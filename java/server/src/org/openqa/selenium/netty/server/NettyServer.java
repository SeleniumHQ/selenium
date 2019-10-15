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
import io.netty.channel.Channel;
import io.netty.channel.ChannelOption;
import io.netty.channel.EventLoopGroup;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.nio.NioServerSocketChannel;
import io.netty.handler.logging.LogLevel;
import io.netty.handler.logging.LoggingHandler;
import org.openqa.selenium.grid.server.AddWebDriverSpecHeaders;
import org.openqa.selenium.grid.server.BaseServerOptions;
import org.openqa.selenium.grid.server.Server;
import org.openqa.selenium.grid.server.WrapExceptions;
import org.openqa.selenium.grid.server.BaseServerOptions;
import org.openqa.selenium.grid.server.Server;
import org.openqa.selenium.remote.http.HttpHandler;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.Objects;

public class NettyServer implements Server<NettyServer> {

  private final EventLoopGroup bossGroup;
  private final EventLoopGroup workerGroup;
  private final int port;
  private final URL externalUrl;
  private final HttpHandler handler;

  private Channel channel;

  public NettyServer(BaseServerOptions options, HttpHandler handler) {
    Objects.requireNonNull(options, "Server options must be set.");
    Objects.requireNonNull(handler, "Handler to use must be set.");

    this.handler = handler.with(new WrapExceptions().andThen(new AddWebDriverSpecHeaders()));

    bossGroup = new NioEventLoopGroup(1);
    workerGroup = new NioEventLoopGroup();

    port = options.getPort();
    try {
      externalUrl = options.getExternalUri().toURL();
    } catch (MalformedURLException e) {
      throw new UncheckedIOException("Server URI is not a valid URL: " + options.getExternalUri(), e);
    }
  }

  @Override
  public boolean isStarted() {
    return channel != null;
  }

  @Override
  public URL getUrl() {
    return externalUrl;
  }

  @Override
  public void stop() {
    try {
      channel.closeFuture().sync();
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
      throw new UncheckedIOException(new IOException("Shutdown interrupted", e));
    } finally {
      channel = null;
      bossGroup.shutdownGracefully();
      workerGroup.shutdownGracefully();
    }
  }

  public NettyServer start() {
    ServerBootstrap b = new ServerBootstrap();
    b.group(bossGroup, workerGroup)
      .channel(NioServerSocketChannel.class)
      .handler(new LoggingHandler(LogLevel.INFO))
      .childHandler(new SeleniumHttpInitializer(handler));

    try {
      channel = b.bind(port).sync().channel();
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
      throw new UncheckedIOException(new IOException("Start up interrupted", e));
    }

    return this;
  }
}
