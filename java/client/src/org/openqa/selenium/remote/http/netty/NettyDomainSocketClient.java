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

package org.openqa.selenium.remote.http.netty;

import com.google.common.base.Joiner;
import com.google.common.base.Throwables;
import com.google.common.io.ByteStreams;
import io.netty.bootstrap.Bootstrap;
import io.netty.buffer.ByteBufInputStream;
import io.netty.buffer.Unpooled;
import io.netty.channel.Channel;
import io.netty.channel.ChannelFuture;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.ChannelInitializer;
import io.netty.channel.EventLoopGroup;
import io.netty.channel.SimpleChannelInboundHandler;
import io.netty.channel.epoll.Epoll;
import io.netty.channel.epoll.EpollDomainSocketChannel;
import io.netty.channel.epoll.EpollEventLoopGroup;
import io.netty.channel.kqueue.KQueue;
import io.netty.channel.kqueue.KQueueDomainSocketChannel;
import io.netty.channel.kqueue.KQueueEventLoopGroup;
import io.netty.channel.unix.DomainSocketAddress;
import io.netty.channel.unix.UnixChannel;
import io.netty.handler.codec.http.DefaultFullHttpRequest;
import io.netty.handler.codec.http.FullHttpResponse;
import io.netty.handler.codec.http.HttpClientCodec;
import io.netty.handler.codec.http.HttpContentDecompressor;
import io.netty.handler.codec.http.HttpHeaderNames;
import io.netty.handler.codec.http.HttpHeaderValues;
import io.netty.handler.codec.http.HttpMethod;
import io.netty.handler.codec.http.HttpObjectAggregator;
import io.netty.handler.codec.http.HttpVersion;

import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.http.AddSeleniumUserAgent;
import org.openqa.selenium.remote.http.ClientConfig;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.http.RemoteCall;
import org.openqa.selenium.remote.http.WebSocket;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.io.UnsupportedEncodingException;
import java.net.URI;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.atomic.AtomicReference;

import static java.net.HttpURLConnection.HTTP_INTERNAL_ERROR;
import static java.nio.charset.StandardCharsets.UTF_8;
import static java.util.concurrent.TimeUnit.MILLISECONDS;
import static org.openqa.selenium.remote.http.Contents.bytes;
import static org.openqa.selenium.remote.http.Contents.utf8String;

class NettyDomainSocketClient extends RemoteCall implements HttpClient {

  private final EventLoopGroup eventLoopGroup;
  private final Class<? extends Channel> channelClazz;
  private final String path;

  public NettyDomainSocketClient(ClientConfig config) {
    super(config);
    URI uri = config.baseUri();
    Require.argument("URI scheme", uri.getScheme()).equalTo("unix");

    if (Epoll.isAvailable()) {
      this.eventLoopGroup = new EpollEventLoopGroup();
      this.channelClazz = EpollDomainSocketChannel.class;
    } else if (KQueue.isAvailable()) {
      this.eventLoopGroup = new KQueueEventLoopGroup();
      this.channelClazz = KQueueDomainSocketChannel.class;
    } else {
      throw new IllegalStateException("No native library for unix domain sockets is available");
    }

    this.path = uri.getPath();
  }

  @Override
  public HttpResponse execute(HttpRequest req) throws UncheckedIOException {
    Require.nonNull("Request to send", req);

    AtomicReference<HttpResponse> outRef = new AtomicReference<>();
    CountDownLatch latch = new CountDownLatch(1);
    Channel channel = createChannel(outRef, latch);

    StringBuilder uri = new StringBuilder(req.getUri());
    List<String> queryPairs = new ArrayList<>();
    req.getQueryParameterNames().forEach(
      name -> req.getQueryParameters(name).forEach(
        value -> {
          try {
            queryPairs.add(URLEncoder.encode(name, UTF_8.toString()) + "=" + URLEncoder.encode(value, UTF_8.toString()));
          } catch (UnsupportedEncodingException e) {
            Thread.currentThread().interrupt();
            throw new UncheckedIOException(e);
          }
        }));
    if (!queryPairs.isEmpty()) {
      uri.append("?");
      Joiner.on('&').appendTo(uri, queryPairs);
    }

    byte[] bytes = bytes(req.getContent());

    DefaultFullHttpRequest fullRequest = new DefaultFullHttpRequest(
      HttpVersion.HTTP_1_1,
      HttpMethod.valueOf(req.getMethod().toString()),
      uri.toString(),
      Unpooled.wrappedBuffer(bytes));
    req.getHeaderNames().forEach(name -> req.getHeaders(name).forEach(value -> fullRequest.headers().add(name, value)));
    if (req.getHeader("User-Agent") == null) {
      fullRequest.headers().set("User-Agent", AddSeleniumUserAgent.USER_AGENT);
    }
    fullRequest.headers().set(HttpHeaderNames.HOST, "localhost");
    fullRequest.headers().set(HttpHeaderNames.CONNECTION, HttpHeaderValues.CLOSE);
    fullRequest.headers().set(HttpHeaderNames.CONTENT_LENGTH, bytes.length);

    ChannelFuture future = channel.writeAndFlush(fullRequest);

    try {
      future.get();
      channel.closeFuture().sync();
    } catch (InterruptedException | ExecutionException e) {
      Thread.currentThread().interrupt();
      throw new UncheckedIOException(new IOException(e));
    }

    try {
      if (!latch.await(getConfig().readTimeout().toMillis(), MILLISECONDS)) {
        throw new UncheckedIOException(new IOException("Timed out waiting for response"));
      }
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
      throw new RuntimeException(e);
    }

    return outRef.get();
  }

  @Override
  public WebSocket openSocket(HttpRequest request, WebSocket.Listener listener) {
    throw new UnsupportedOperationException("openSocket");
  }

  private Channel createChannel(AtomicReference<HttpResponse> outRef, CountDownLatch latch) {
    Bootstrap bootstrap = new Bootstrap()
      .group(eventLoopGroup)
      .channel(channelClazz)
      .handler(new ChannelInitializer<UnixChannel>() {
        @Override
        public void initChannel(UnixChannel ch) {
          ch
            .pipeline()
            .addLast(new HttpClientCodec())
            .addLast(new HttpContentDecompressor())
            .addLast(new HttpObjectAggregator(Integer.MAX_VALUE))
            .addLast(new SimpleChannelInboundHandler<FullHttpResponse>() {
              @Override
              public void channelRead0(ChannelHandlerContext ctx, FullHttpResponse msg) {
                HttpResponse res = new HttpResponse().setStatus(msg.status().code());
                msg.headers().forEach(entry -> res.addHeader(entry.getKey(), entry.getValue()));

                try (InputStream is = new ByteBufInputStream(msg.content());
                     ByteArrayOutputStream bos = new ByteArrayOutputStream()) {
                  ByteStreams.copy(is, bos);
                  res.setContent(bytes(bos.toByteArray()));
                  outRef.set(res);
                  latch.countDown();
                } catch (IOException e) {
                  outRef.set(new HttpResponse()
                    .setStatus(HTTP_INTERNAL_ERROR)
                    .setContent(utf8String(Throwables.getStackTraceAsString(e))));
                  latch.countDown();
                }
              }

              @Override
              public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) {
                outRef.set(new HttpResponse()
                  .setStatus(HTTP_INTERNAL_ERROR)
                  .setContent(utf8String(Throwables.getStackTraceAsString(cause))));
                latch.countDown();
              }
            });
        }
      });
    try {
      return bootstrap.connect(new DomainSocketAddress(path)).sync().channel();
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
      throw new RuntimeException(e);
    }
  }
}
