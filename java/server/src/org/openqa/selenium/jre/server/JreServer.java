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

package org.openqa.selenium.jre.server;

import com.google.common.io.ByteStreams;
import com.sun.net.httpserver.HttpServer;
import org.openqa.selenium.grid.server.BaseServerOptions;
import org.openqa.selenium.grid.server.Server;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.UncheckedIOException;
import java.net.InetSocketAddress;
import java.net.URL;

public class JreServer implements Server<JreServer> {

  private final HttpServer server;
  private final URL url;
  private boolean started = false;

  public JreServer(BaseServerOptions options, HttpHandler handler) {
    Require.nonNull("Server options", options);
    Require.nonNull("Handler", handler);

    try {
      url = options.getExternalUri().toURL();
      server = HttpServer.create(new InetSocketAddress(url.getPort()), 0);
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }

    server.setExecutor(null);
    server.createContext(
      "/", httpExchange -> {
        HttpRequest req = JreMessages.asRequest(httpExchange);

        HttpResponse res = handler.execute(req);

        res.getHeaderNames().forEach(
          name -> res.getHeaders(name).forEach(value -> httpExchange.getResponseHeaders().add(name, value)));
        httpExchange.sendResponseHeaders(res.getStatus(), 0);

        try (InputStream in = res.getContent().get();
             OutputStream out = httpExchange.getResponseBody()) {
          ByteStreams.copy(in, out);
        }
      });
  }

  @Override
  public boolean isStarted() {
    return started;
  }

  @Override
  public JreServer start() {
    if (isStarted()) {
      throw new IllegalStateException("Server is already started");
    }

    server.start();
    this.started = true;
    return this;
  }

  @Override
  public URL getUrl() {
    return url;
  }

  @Override
  public void stop() {
    server.stop(5);
  }
}
