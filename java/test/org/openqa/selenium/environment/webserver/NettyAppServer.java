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

package org.openqa.selenium.environment.webserver;

import static com.google.common.net.HttpHeaders.CONTENT_TYPE;
import static java.util.Collections.singletonMap;
import static org.openqa.selenium.json.Json.JSON_UTF_8;
import static org.openqa.selenium.remote.http.Contents.string;

import com.google.common.collect.ImmutableMap;

import dev.failsafe.Failsafe;
import dev.failsafe.RetryPolicy;

import org.openqa.selenium.grid.config.CompoundConfig;
import org.openqa.selenium.grid.config.Config;
import org.openqa.selenium.grid.config.MapConfig;
import org.openqa.selenium.grid.config.MemoizedConfig;
import org.openqa.selenium.grid.server.BaseServerOptions;
import org.openqa.selenium.grid.server.Server;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.io.TemporaryFilesystem;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.netty.server.NettyServer;
import org.openqa.selenium.netty.server.ServerBindException;
import org.openqa.selenium.remote.http.Contents;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpMethod;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

import java.io.File;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.time.temporal.ChronoUnit;
import java.util.logging.Level;
import java.util.logging.Logger;

public class NettyAppServer implements AppServer {

  private final static Config sslConfig = new MapConfig(
    singletonMap("server", singletonMap("https-self-signed", true)));
  private static final Logger LOG = Logger.getLogger(NettyAppServer.class.getName());
  private Server<?> server;
  private Server<?> secure;
  private final RetryPolicy<Object> retryPolicy = RetryPolicy.builder()
    .withMaxAttempts(5)
    .withDelay(100, 1000, ChronoUnit.MILLIS)
    .handle(ServerBindException.class)
    .onRetry(e -> {
      LOG.log(Level.WARNING, String.format("NettyAppServer retry #%s. ", e.getAttemptCount()));
      initValues();
    })
    .onRetriesExceeded(e -> LOG.log(Level.WARNING, "NettyAppServer start aborted."))
    .build();

  public NettyAppServer() {
    initValues();
  }

  public NettyAppServer(HttpHandler handler) {
    this(
      createDefaultConfig(),
      Require.nonNull("Handler", handler));
  }

  private NettyAppServer(Config config, HttpHandler handler) {
    Require.nonNull("Config", config);
    Require.nonNull("Handler", handler);

    server = new NettyServer(new BaseServerOptions(new MemoizedConfig(config)), handler);
    secure = null;
  }

  private static Config createDefaultConfig() {
    return new MemoizedConfig(new MapConfig(
      singletonMap("server", singletonMap("port", PortProber.findFreePort()))));
  }

  public static void main(String[] args) {
    MemoizedConfig config = new MemoizedConfig(
      new MapConfig(singletonMap("server", singletonMap("port", 2310))));
    BaseServerOptions options = new BaseServerOptions(config);

    HttpHandler handler = new HandlersForTests(
      options.getHostname().orElse("localhost"),
      options.getPort(),
      TemporaryFilesystem.getDefaultTmpFS().createTempDir("netty", "server").toPath());

    NettyAppServer server = new NettyAppServer(
      config,
      handler);
    server.start();

    System.out.printf("Server started. Root URL: %s%n", server.whereIs("/"));
  }

  private void initValues() {
    Config config = createDefaultConfig();
    BaseServerOptions options = new BaseServerOptions(config);

    File tempDir = TemporaryFilesystem.getDefaultTmpFS().createTempDir("generated", "pages");

    HttpHandler handler = new HandlersForTests(
      options.getHostname().orElse("localhost"),
      options.getPort(),
      tempDir.toPath());

    server = new NettyServer(options, handler);

    Config secureConfig = new CompoundConfig(sslConfig, createDefaultConfig());
    BaseServerOptions secureOptions = new BaseServerOptions(secureConfig);

    HttpHandler secureHandler = new HandlersForTests(
      secureOptions.getHostname().orElse("localhost"),
      secureOptions.getPort(),
      tempDir.toPath());

    secure = new NettyServer(secureOptions, secureHandler);
  }

  @Override
  public void start() {
    Failsafe.with(retryPolicy).run(
      () -> {
        server.start();
        if (secure != null) {
          secure.start();
        }
      }
    );
  }

  @Override
  public void stop() {
    server.stop();
    if (secure != null) {
      secure.stop();
    }
  }

  @Override
  public String whereIs(String relativeUrl) {
    return createUrl(server, "http", getHostName(), relativeUrl);
  }

  @Override
  public String whereElseIs(String relativeUrl) {
    return createUrl(server, "http", getAlternateHostName(), relativeUrl);
  }

  @Override
  public String whereIsSecure(String relativeUrl) {
    if (secure == null) {
      throw new IllegalStateException("Server not configured to return HTTPS url");
    }
    return createUrl(secure, "https", getHostName(), relativeUrl);
  }

  @Override
  public String whereIsWithCredentials(String relativeUrl, String user, String password) {
    return String.format(
      "http://%s:%s@%s:%d/%s",
      user,
      password,
      getHostName(),
      server.getUrl().getPort(),
      relativeUrl);
  }

  private String createUrl(Server<?> server, String protocol, String hostName, String relativeUrl) {
    if (!relativeUrl.startsWith("/")) {
      relativeUrl = "/" + relativeUrl;
    }

    try {
      return new URL(
        protocol,
        hostName,
        server.getUrl().getPort(),
        relativeUrl
      ).toString();
    } catch (MalformedURLException e) {
      throw new UncheckedIOException(e);
    }
  }

  @Override
  public String create(Page page) {
    try (HttpClient client = HttpClient.Factory.createDefault().createClient(new URL(whereIs("/")))) {
      HttpRequest request = new HttpRequest(HttpMethod.POST, "/common/createPage");
      request.setHeader(CONTENT_TYPE, JSON_UTF_8);
      request.setContent(Contents.asJson(ImmutableMap.of("content", page.toString())));
      HttpResponse response = client.execute(request);
      return string(response);
    } catch (IOException ex) {
      throw new RuntimeException(ex);
    }
  }

  @Override
  public String getHostName() {
    return AppServer.detectHostname();
  }

  @Override
  public String getAlternateHostName() {
    return AppServer.detectAlternateHostname();
  }
}
