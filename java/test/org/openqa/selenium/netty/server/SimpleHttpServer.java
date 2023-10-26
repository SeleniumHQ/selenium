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

package org.openqa.selenium.netty.server;

import io.netty.bootstrap.ServerBootstrap;
import io.netty.buffer.ByteBuf;
import io.netty.buffer.Unpooled;
import io.netty.channel.Channel;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.ChannelInitializer;
import io.netty.channel.ChannelOption;
import io.netty.channel.ChannelPipeline;
import io.netty.channel.EventLoopGroup;
import io.netty.channel.SimpleChannelInboundHandler;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.SocketChannel;
import io.netty.channel.socket.nio.NioServerSocketChannel;
import io.netty.handler.codec.http.DefaultFullHttpResponse;
import io.netty.handler.codec.http.FullHttpResponse;
import io.netty.handler.codec.http.HttpHeaders;
import io.netty.handler.codec.http.HttpMethod;
import io.netty.handler.codec.http.HttpObject;
import io.netty.handler.codec.http.HttpRequest;
import io.netty.handler.codec.http.HttpResponseStatus;
import io.netty.handler.codec.http.HttpServerCodec;
import io.netty.handler.codec.http.HttpServerExpectContinueHandler;
import io.netty.handler.codec.http.LastHttpContent;
import java.io.Closeable;
import java.io.InterruptedIOException;
import java.io.UncheckedIOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;
import org.openqa.selenium.net.NetworkUtils;
import org.openqa.selenium.net.PortProber;

/** A minimal http server intended to be used in unit tests. */
public class SimpleHttpServer implements Closeable {

  public static final Function<HttpRequest, FullHttpResponse> ECHO_HEADERS_HANDLER =
      (request) -> {
        FullHttpResponse response =
            new DefaultFullHttpResponse(
                request.protocolVersion(), HttpResponseStatus.OK, Unpooled.EMPTY_BUFFER);
        HttpHeaders headers = response.headers();

        for (Map.Entry<String, String> entry : request.headers().entries()) {
          if (entry.getKey().equalsIgnoreCase("content-length")) {
            continue;
          }

          headers.add(entry.getKey(), entry.getValue());
        }

        headers.add("content-length", "0");

        return response;
      };

  private final URI baseUri;

  private final Channel channel;

  private Map<Map.Entry<HttpMethod, String>, Function<HttpRequest, FullHttpResponse>> endpoints;

  public SimpleHttpServer() throws InterruptedException, URISyntaxException {
    this(PortProber.findFreePort());
  }

  public SimpleHttpServer(int port) throws InterruptedException, URISyntaxException {
    String address = new NetworkUtils().getPrivateLocalAddress();
    baseUri = new URI("http", null, address, port, null, null, null);

    ServerBootstrap bootstrap = new ServerBootstrap();
    bootstrap.option(ChannelOption.SO_BACKLOG, 1024);

    EventLoopGroup bossGroup = new NioEventLoopGroup(1);
    EventLoopGroup workerGroup = new NioEventLoopGroup();

    bootstrap
        .group(bossGroup, workerGroup)
        .channel(NioServerSocketChannel.class)
        .childHandler(
            new ChannelInitializer<SocketChannel>() {
              @Override
              protected void initChannel(SocketChannel ch) throws Exception {
                ChannelPipeline pipeline = ch.pipeline();
                pipeline.addLast(new HttpServerCodec());
                pipeline.addLast(new HttpServerExpectContinueHandler());
                pipeline.addLast(
                    new SimpleChannelInboundHandler<HttpObject>() {

                      HttpRequest request;

                      @Override
                      protected void channelRead0(
                          ChannelHandlerContext ctx, io.netty.handler.codec.http.HttpObject msg)
                          throws Exception {

                        if (msg instanceof HttpRequest) {
                          request = (HttpRequest) msg;
                        }

                        if (msg instanceof LastHttpContent) {
                          HttpRequest requested = request;
                          request = null;

                          FullHttpResponse response = handleRequest(requested);
                          ctx.writeAndFlush(response);
                        }
                      }
                    });
              }
            });

    channel = bootstrap.bind(address, port).sync().channel();
    endpoints = new HashMap<>();
  }

  public URI baseUri() {
    return baseUri;
  }

  private static <K, V> Map.Entry<K, V> entry(K k, V v) {
    return Collections.singletonMap(k, v).entrySet().iterator().next();
  }

  protected FullHttpResponse handleRequest(HttpRequest requested) {
    Function<io.netty.handler.codec.http.HttpRequest, FullHttpResponse> handler =
        endpoints.getOrDefault(
            entry(requested.method(), requested.uri()),
            (request) -> {
              FullHttpResponse response =
                  new DefaultFullHttpResponse(
                      requested.protocolVersion(),
                      HttpResponseStatus.NOT_FOUND,
                      Unpooled.EMPTY_BUFFER);
              response.headers().add("content-length", response.content().readableBytes());
              return response;
            });

    return handler.apply(requested);
  }

  public void registerEndpoint(
      org.openqa.selenium.remote.http.HttpMethod method,
      String uri,
      Function<io.netty.handler.codec.http.HttpRequest, FullHttpResponse> handler) {
    endpoints.put(entry(HttpMethod.valueOf(method.name()), uri), handler);
  }

  public void registerEndpoint(
      org.openqa.selenium.remote.http.HttpMethod method,
      String uri,
      String contentType,
      byte[] payload) {
    if ((contentType == null && payload != null) || (contentType != null && payload == null)) {
      throw new IllegalArgumentException("contentType and payload must both be set or both null");
    }

    registerEndpoint(
        method,
        uri,
        (request) -> {
          ByteBuf buffer =
              payload != null ? Unpooled.wrappedBuffer(payload) : Unpooled.EMPTY_BUFFER;
          FullHttpResponse response =
              new DefaultFullHttpResponse(request.protocolVersion(), HttpResponseStatus.OK, buffer);

          HttpHeaders headers = response.headers();

          if (contentType != null) {
            headers.add("content-type", contentType);
          }
          headers.add("content-length", response.content().readableBytes());

          return response;
        });
  }

  @Override
  public void close() {
    try {
      channel.close();
      channel.closeFuture().sync();
    } catch (InterruptedException e) {
      throw new UncheckedIOException(new InterruptedIOException(e.getMessage()));
    }
  }
}
