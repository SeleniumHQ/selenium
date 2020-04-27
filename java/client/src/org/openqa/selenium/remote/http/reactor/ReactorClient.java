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

import com.google.common.collect.ImmutableMap;

import org.openqa.selenium.remote.http.ClientConfig;
import org.openqa.selenium.remote.http.Filter;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpMethod;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.http.WebSocket;

import io.netty.buffer.ByteBuf;
import io.netty.buffer.ByteBufAllocator;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.util.function.Tuple2;

import java.io.IOException;
import java.io.InputStream;
import java.nio.channels.Channels;
import java.util.Map;
import java.util.Objects;

public class ReactorClient implements HttpClient {

  private static final Map<HttpMethod, io.netty.handler.codec.http.HttpMethod> methodMap =
      ImmutableMap.of(HttpMethod.DELETE, io.netty.handler.codec.http.HttpMethod.DELETE,
                      HttpMethod.GET, io.netty.handler.codec.http.HttpMethod.GET,
                      HttpMethod.POST, io.netty.handler.codec.http.HttpMethod.POST);

  private final static int MAX_CHUNK_SIZE = 1024 * 512 ; // 500k

  private final ClientConfig config;
  private final reactor.netty.http.client.HttpClient httpClient;

  private ReactorClient(ClientConfig config) {
    this.config = config;
    httpClient = reactor.netty.http.client.HttpClient.create();
  }

  @Override
  public HttpResponse execute(HttpRequest request) {
    Tuple2<InputStream, HttpResponse> result = httpClient
        .baseUrl(config.baseUrl().toString())
        .request(methodMap.get(request.getMethod()))
        .uri(request.getUri())
        .send((r, out) -> out.send(fromInputStream(request.getContent().get())))
        .responseSingle((res, buf) -> {
          HttpResponse toReturn = new HttpResponse();
          toReturn.setStatus(res.status().code());
          res.responseHeaders().entries().forEach(
              entry -> toReturn.addHeader(entry.getKey(), entry.getValue()));
          return buf.asInputStream().zipWith(Mono.just(toReturn));
        }).block();
    result.getT2().setContent(result::getT1);
    return result.getT2();
  }

  private Flux<ByteBuf> fromInputStream(InputStream is) {
    ByteBufAllocator allocator = ByteBufAllocator.DEFAULT;
    return Flux.generate(
        () -> Channels.newChannel(is),
        (rbc, sync) -> {
          ByteBuf buf = allocator.buffer();
          try {
            if (buf.writeBytes(is, MAX_CHUNK_SIZE) < 0) {
              buf.release();
              sync.complete();
            } else {
              sync.next(buf);
            }
          } catch (IOException ex) {
            buf.release();
            sync.error(ex);
          }
          return rbc;
        },
        rbc -> {
          try {
            if (rbc != null) {
              rbc.close();
            }
          } catch (IOException e) {
            e.printStackTrace();
          }
        });
  }

  @Override
  public WebSocket openSocket(HttpRequest request, WebSocket.Listener listener) {
    Objects.requireNonNull(request, "Request to send must be set.");
    Objects.requireNonNull(listener, "WebSocket listener must be set.");

    return null;
  }

  @Override
  public HttpClient with(Filter filter) {
    Objects.requireNonNull(filter, "Filter to use must be set.");

    // TODO: Implement filtering
    return this;
  }

  public static class Factory implements HttpClient.Factory {

    @Override
    public HttpClient createClient(ClientConfig config) {
      Objects.requireNonNull(config, "Client config to use must be set.");
      return new ReactorClient(config);
    }
  }
}
