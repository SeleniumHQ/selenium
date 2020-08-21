// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

package org.openqa.selenium.remote.http.reactor;

import com.google.auto.service.AutoService;
import com.google.common.base.Joiner;
import com.google.common.collect.ImmutableMap;
import io.netty.buffer.ByteBuf;
import io.netty.buffer.ByteBufAllocator;
import io.netty.channel.ChannelOption;
import io.netty.channel.unix.DomainSocketAddress;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.http.AddSeleniumUserAgent;
import org.openqa.selenium.remote.http.ClientConfig;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpClientName;
import org.openqa.selenium.remote.http.HttpMethod;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.http.Message;
import org.openqa.selenium.remote.http.TextMessage;
import org.openqa.selenium.remote.http.WebSocket;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.netty.http.websocket.WebsocketOutbound;
import reactor.util.function.Tuple2;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.io.UnsupportedEncodingException;
import java.net.InetSocketAddress;
import java.net.SocketAddress;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URLEncoder;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import static java.nio.charset.StandardCharsets.UTF_8;

public class ReactorClient implements HttpClient {

  private static final Logger log = Logger.getLogger(ReactorClient.class.getName());

  private static final Map<String, Integer> SCHEME_TO_PORT = ImmutableMap.of(
    "http", 80,
    "https", 443,
    "ws", 80,
    "wss", 443);

  private static final Map<HttpMethod, io.netty.handler.codec.http.HttpMethod> METHOD_MAP =
    ImmutableMap.of(HttpMethod.DELETE, io.netty.handler.codec.http.HttpMethod.DELETE,
      HttpMethod.GET, io.netty.handler.codec.http.HttpMethod.GET,
      HttpMethod.POST, io.netty.handler.codec.http.HttpMethod.POST);

  private static final int MAX_CHUNK_SIZE = 1024 * 512; // 500k

  private final ClientConfig config;
  private final reactor.netty.http.client.HttpClient httpClient;

  private ReactorClient(ClientConfig config) {
    this.config = Require.nonNull("Client config", config);
    this.httpClient = createClient();
  }

  private reactor.netty.http.client.HttpClient createClient() {
    reactor.netty.http.client.HttpClient client = reactor.netty.http.client.HttpClient.create()
      .followRedirect(true)
      .keepAlive(true);

    switch (config.baseUri().getScheme()) {
      case "http":
      case "https":
        int port = config.baseUri().getPort() == -1 ?
          SCHEME_TO_PORT.get(config.baseUri().getScheme()) :
          config.baseUri().getPort();
        SocketAddress inetAddr = new InetSocketAddress(config.baseUri().getHost(), port);
        client = client.remoteAddress(() -> inetAddr)
          .tcpConfiguration(
            tcpClient -> tcpClient.option(
              ChannelOption.CONNECT_TIMEOUT_MILLIS, Math.toIntExact(config.connectionTimeout().toMillis())));
        break;

      case "unix":
        Path socket = Paths.get(config.baseUri().getPath());
        SocketAddress domainAddr = new DomainSocketAddress(socket.toFile());
        client = client.remoteAddress(() -> domainAddr);
        break;

      default:
        throw new IllegalArgumentException("Base URI must be unix, http, or https: " + config.baseUri());
    }

    return client;
  }

  @Override
  public HttpResponse execute(HttpRequest request) {
    StringBuilder uri = new StringBuilder(request.getUri());
    List<String> queryPairs = new ArrayList<>();
    request.getQueryParameterNames().forEach(
      name -> request.getQueryParameters(name).forEach(
        value -> {
          try {
            queryPairs.add(
              URLEncoder.encode(name, UTF_8.toString()) + "=" + URLEncoder.encode(value, UTF_8.toString()));
          } catch (UnsupportedEncodingException e) {
            Thread.currentThread().interrupt();
            throw new UncheckedIOException(e);
          }
        }));
    if (!queryPairs.isEmpty()) {
      uri.append("?");
      Joiner.on('&').appendTo(uri, queryPairs);
    }

    Tuple2<InputStream, HttpResponse> result = httpClient
      .headers(h -> {
        request.getHeaderNames().forEach(
          name -> request.getHeaders(name).forEach(value -> h.set(name, value)));
        if (request.getHeader("User-Agent") == null) {
          h.set("User-Agent", AddSeleniumUserAgent.USER_AGENT);
        }
      })
      .request(METHOD_MAP.get(request.getMethod()))
      .uri(uri.toString())
      .send((r, out) -> out.send(fromInputStream(request.getContent().get())))
      .responseSingle((res, buf) -> {
        HttpResponse toReturn = new HttpResponse();
        toReturn.setStatus(res.status().code());
        res.responseHeaders().entries().forEach(
          entry -> toReturn.addHeader(entry.getKey(), entry.getValue()));
        return buf.asInputStream()
          .switchIfEmpty(Mono.just(new ByteArrayInputStream("".getBytes())))
          .zipWith(Mono.just(toReturn));
      }).block();
    result.getT2().setContent(result::getT1);
    return result.getT2();
  }

  private Flux<ByteBuf> fromInputStream(InputStream is) {
    ByteBufAllocator allocator = ByteBufAllocator.DEFAULT;
    return Flux.generate(
      () -> is,
      (in, sync) -> {
        ByteBuf buf = allocator.buffer();
        try {
          if (buf.writeBytes(in, MAX_CHUNK_SIZE) < 0) {
            buf.release();
            sync.complete();
          } else {
            sync.next(buf);
          }
        } catch (IOException ex) {
          buf.release();
          sync.error(ex);
        }
        return in;
      },
      in -> {
        try {
          if (in != null) {
            in.close();
          }
        } catch (IOException e) {
          log.log(Level.INFO, e.getMessage(), e);
        }
      });
  }

  @Override
  public WebSocket openSocket(HttpRequest request, WebSocket.Listener listener) {
    Require.nonNull("Request to send", request);
    Require.nonNull("WebSocket listener", listener);

    try {
      URI origUri = new URI(request.getUri());
      URI wsUri = new URI("ws", null, origUri.getHost(), origUri.getPort(), origUri.getPath(), null, null);

      return new ReactorWebSocket(
        httpClient
          .headers(h -> request.getHeaderNames().forEach(
            name -> request.getHeaders(name).forEach(value -> h.set(name, value))))
          .websocket().uri(wsUri.toString()), listener);
    } catch (URISyntaxException e) {
      log.log(Level.INFO, e.getMessage(), e);
      return null;
    }
  }

  @AutoService(HttpClient.Factory.class)
  @HttpClientName("reactor")
  public static class Factory implements HttpClient.Factory {

    @Override
    public HttpClient createClient(ClientConfig config) {
      return new ReactorClient(Require.nonNull("Client config", config));
    }
  }

  private static class ReactorWebSocket implements WebSocket {

    private WebsocketOutbound out;

    ReactorWebSocket(reactor.netty.http.client.HttpClient.WebsocketSender websocket, WebSocket.Listener listener) {
      Flux<String> response = websocket.handle((in, out) -> {
        this.out = out;
        return in.receive().asString();
      });
      response.subscribe(listener::onText);
    }

    @Override
    public WebSocket send(Message message) {
      TextMessage txt = (TextMessage) message;
      out.sendString(Flux.just(txt.text())).then().subscribe();
      return this;
    }

    @Override
    public void close() {
      out.sendClose().then().subscribe();
    }
  }
}
