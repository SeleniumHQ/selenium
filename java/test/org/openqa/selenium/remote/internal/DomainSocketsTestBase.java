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

package org.openqa.selenium.remote.internal;

import com.google.common.net.MediaType;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.remote.http.ClientConfig;
import org.openqa.selenium.remote.http.Contents;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.testing.Safely;

import io.netty.bootstrap.ServerBootstrap;
import io.netty.buffer.ByteBuf;
import io.netty.buffer.PooledByteBufAllocator;
import io.netty.buffer.Unpooled;
import io.netty.channel.ChannelFuture;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.ChannelInitializer;
import io.netty.channel.ChannelOption;
import io.netty.channel.EventLoopGroup;
import io.netty.channel.SimpleChannelInboundHandler;
import io.netty.channel.epoll.Epoll;
import io.netty.channel.epoll.EpollEventLoopGroup;
import io.netty.channel.epoll.EpollServerDomainSocketChannel;
import io.netty.channel.kqueue.KQueue;
import io.netty.channel.kqueue.KQueueEventLoopGroup;
import io.netty.channel.kqueue.KQueueServerDomainSocketChannel;
import io.netty.channel.unix.DomainSocketAddress;
import io.netty.channel.unix.DomainSocketChannel;
import io.netty.channel.unix.ServerDomainSocketChannel;
import io.netty.handler.codec.http.DefaultFullHttpResponse;
import io.netty.handler.codec.http.FullHttpRequest;
import io.netty.handler.codec.http.FullHttpResponse;
import io.netty.handler.codec.http.HttpObjectAggregator;
import io.netty.handler.codec.http.HttpResponseStatus;
import io.netty.handler.codec.http.HttpServerCodec;
import io.netty.handler.codec.http.HttpServerKeepAliveHandler;
import io.netty.handler.codec.http.HttpVersion;

import java.io.IOException;
import java.net.SocketAddress;
import java.net.URI;
import java.net.URISyntaxException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.concurrent.atomic.AtomicReference;

import static io.netty.handler.codec.http.HttpHeaderNames.CONTENT_LENGTH;
import static io.netty.handler.codec.http.HttpHeaderNames.CONTENT_TYPE;
import static java.nio.charset.StandardCharsets.UTF_8;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assumptions.assumeThat;
import static org.openqa.selenium.remote.http.HttpMethod.GET;

public abstract class DomainSocketsTestBase {

  private final AtomicReference<String> responseText = new AtomicReference<>();
  private EventLoopGroup group;
  private ChannelFuture future;
  private URI socket;

  protected abstract HttpClient.Factory createFactory();

  @BeforeEach
  public void setupUnixDomainSocketServer() throws IOException, URISyntaxException {
    Class<? extends ServerDomainSocketChannel> channelType = null;

    if (Epoll.isAvailable()) {
      group = new EpollEventLoopGroup(2);
      channelType = EpollServerDomainSocketChannel.class;
    } else if (KQueue.isAvailable()) {
      group = new KQueueEventLoopGroup(2);
      channelType = KQueueServerDomainSocketChannel.class;
    }

    assumeThat(group).isNotNull();
    assumeThat(channelType).isNotNull();

    ServerBootstrap bootstrap = new ServerBootstrap()
      .group(group)
      .option(ChannelOption.SO_BACKLOG, 1024)
      .childOption(ChannelOption.ALLOCATOR, PooledByteBufAllocator.DEFAULT)
      .channel(channelType)
      .childHandler(new ChannelInitializer<DomainSocketChannel>() {
        @Override
        protected void initChannel(DomainSocketChannel ch) {
          ch.pipeline()
            .addLast("http-codec", new HttpServerCodec())
            .addLast("http-keep-alive", new HttpServerKeepAliveHandler())
            .addLast("http-aggregator", new HttpObjectAggregator(Integer.MAX_VALUE))
            .addLast(new SimpleChannelInboundHandler<FullHttpRequest>() {
              @Override
              protected void channelRead0(ChannelHandlerContext ctx, FullHttpRequest req) {
                byte[] bytes = responseText.get().getBytes(UTF_8);
                ByteBuf text = Unpooled.wrappedBuffer(bytes);
                FullHttpResponse
                  res =
                  new DefaultFullHttpResponse(HttpVersion.HTTP_1_1, HttpResponseStatus.OK, text);
                res.headers().set(CONTENT_TYPE, MediaType.PLAIN_TEXT_UTF_8.toString());
                res.headers().set(CONTENT_LENGTH, bytes.length);

                ctx.writeAndFlush(res);
              }
            });
        }
      });

    Path temp = Files.createTempFile(Paths.get("/tmp"), "domain-socket-test", "socket");
    Files.deleteIfExists(temp);

    SocketAddress address = new DomainSocketAddress(temp.toFile());
    future = bootstrap.bind(address);

    this.socket = new URI("unix", null, null, 0, temp.toString(), null, null);
  }

  @AfterEach
  public void shutdown() {
    Safely.safelyCall(() -> group.shutdownGracefully());
    Safely.safelyCall(() -> future.channel().closeFuture().sync());
  }

  @Test
  public void shouldBeAbleToConnectToAUnixDomainSocketUrl() {
    ClientConfig config = ClientConfig.defaultConfig().baseUri(socket);
    HttpClient client = createFactory().createClient(config);

    String emphaticCheeseEnjoyment = "I like cheese!";
    responseText.set(emphaticCheeseEnjoyment);

    HttpResponse res = client.execute(new HttpRequest(GET, "/do-you-like-cheese"));

    assertThat(Contents.string(res)).isEqualTo(emphaticCheeseEnjoyment);
  }

}
