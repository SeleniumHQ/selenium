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
import io.netty.channel.EventLoopGroup;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.nio.NioServerSocketChannel;
import io.netty.handler.logging.LogLevel;
import io.netty.handler.logging.LoggingHandler;
import io.netty.handler.ssl.SslContext;
import io.netty.handler.ssl.SslContextBuilder;
import io.netty.handler.ssl.util.SelfSignedCertificate;
import io.netty.util.internal.logging.InternalLoggerFactory;
import io.netty.util.internal.logging.JdkLoggerFactory;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.net.BindException;
import java.net.InetSocketAddress;
import java.net.MalformedURLException;
import java.net.URL;
import java.security.cert.CertificateException;
import java.util.Optional;
import java.util.function.BiFunction;
import java.util.function.Consumer;
import javax.net.ssl.SSLException;
import org.openqa.selenium.grid.server.BaseServerOptions;
import org.openqa.selenium.grid.server.Server;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.AddWebDriverSpecHeaders;
import org.openqa.selenium.remote.ErrorFilter;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.Message;

public class NettyServer implements Server<NettyServer> {

  private final EventLoopGroup bossGroup;
  private final EventLoopGroup workerGroup;
  private final int port;
  private final String host;
  private final boolean bindHost;
  private final URL externalUrl;
  private final HttpHandler handler;
  private final BiFunction<String, Consumer<Message>, Optional<Consumer<Message>>> websocketHandler;
  private final SslContext sslCtx;
  private final boolean allowCors;

  private Channel channel;

  public NettyServer(BaseServerOptions options, HttpHandler handler) {
    this(options, handler, (str, sink) -> Optional.empty());
  }

  public NettyServer(
      BaseServerOptions options,
      HttpHandler handler,
      BiFunction<String, Consumer<Message>, Optional<Consumer<Message>>> websocketHandler) {
    Require.nonNull("Server options", options);
    Require.nonNull("Handler", handler);
    this.websocketHandler = Require.nonNull("Factory for websocket connections", websocketHandler);

    InternalLoggerFactory.setDefaultFactory(JdkLoggerFactory.INSTANCE);

    boolean secure = options.isSecure();
    if (secure) {
      try {
        sslCtx =
            SslContextBuilder.forServer(options.getCertificate(), options.getPrivateKey()).build();
      } catch (SSLException e) {
        throw new UncheckedIOException(new IOException("Certificate problem.", e));
      }
    } else if (options.isSelfSigned()) {
      try {
        SelfSignedCertificate cert = new SelfSignedCertificate();
        sslCtx = SslContextBuilder.forServer(cert.certificate(), cert.privateKey()).build();
      } catch (CertificateException | SSLException e) {
        throw new UncheckedIOException(new IOException("Self-signed certificate problem.", e));
      }
    } else {
      sslCtx = null;
    }

    this.handler = handler.with(new ErrorFilter().andThen(new AddWebDriverSpecHeaders()));

    bossGroup = new NioEventLoopGroup(1);
    workerGroup = new NioEventLoopGroup();

    port = options.getPort();
    host = options.getHostname().orElse("0.0.0.0");
    bindHost = options.getBindHost();
    allowCors = options.getAllowCORS();

    try {
      externalUrl = options.getExternalUri().toURL();
    } catch (MalformedURLException e) {
      throw new UncheckedIOException(
          "Server URI is not a valid URL: " + options.getExternalUri(), e);
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
      bossGroup.shutdownGracefully().sync();
      workerGroup.shutdownGracefully().sync();

      channel.closeFuture().sync();
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
      throw new UncheckedIOException(new IOException("Shutdown interrupted", e));
    } finally {
      channel = null;
    }
  }

  @SuppressWarnings("ConstantConditions")
  public NettyServer start() {
    ServerBootstrap b = new ServerBootstrap();

    b.group(bossGroup, workerGroup)
        .channel(NioServerSocketChannel.class)
        .handler(new LoggingHandler(LogLevel.DEBUG))
        .childHandler(new SeleniumHttpInitializer(sslCtx, handler, websocketHandler, allowCors));

    try {
      // Using a flag to avoid binding to the host, useful in environments like Docker,
      // where the "host" value can be the IP of the Docker host machine, which cannot
      // be bind inside the container.
      channel =
          bindHost
              ? b.bind(new InetSocketAddress(host, port)).sync().channel()
              : b.bind(port).sync().channel();
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
      throw new UncheckedIOException(new IOException("Start up interrupted", e));
    } catch (Exception e) {
      if (e instanceof BindException) {
        String errorMessage =
            String.format(
                "Could not bind to address or port is already in use. Host %s, Port %s",
                host, port);
        throw new ServerBindException(errorMessage, (BindException) e);
      }
      throw e;
    }

    return this;
  }
}
