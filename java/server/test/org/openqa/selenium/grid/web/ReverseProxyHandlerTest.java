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

package org.openqa.selenium.grid.web;

import com.google.common.io.ByteStreams;
import com.sun.net.httpserver.Headers;
import com.sun.net.httpserver.HttpServer;
import io.opentelemetry.OpenTelemetry;
import io.opentelemetry.trace.Tracer;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.net.NetworkUtils;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpMethod;
import org.openqa.selenium.remote.http.HttpRequest;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.URL;
import java.util.List;
import java.util.Map;

import static java.net.HttpURLConnection.HTTP_OK;
import static java.nio.charset.StandardCharsets.UTF_8;
import static org.junit.Assert.assertEquals;
import static org.openqa.selenium.remote.http.Contents.bytes;


public class ReverseProxyHandlerTest {

  private Server server;
  private Tracer tracer = OpenTelemetry.getTracerProvider().get("default");
  private HttpClient.Factory factory = HttpClient.Factory.createDefault();

  @Before
  public void startServer() throws IOException {
    server = new Server();
  }

  @After
  public void stopServer() {
    server.stop();
  }

  @Test
  public void shouldForwardRequestsToEndPoint() {
    HttpHandler handler = new ReverseProxyHandler(tracer, factory.createClient(server.url));
    HttpRequest req = new HttpRequest(HttpMethod.GET, "/ok");
    req.addHeader("X-Cheese", "Cake");
    handler.execute(req);

    // HTTP headers are case insensitive. This is how the HttpUrlConnection likes to encode things
    assertEquals("Cake", server.lastRequest.getHeader("x-cheese"));
  }

  private static class Server {
    private final URL url;
    private final HttpServer server;
    private HttpRequest lastRequest;

    public Server() throws IOException {
      int port = PortProber.findFreePort();
      String address = new NetworkUtils().getPrivateLocalAddress();
      url = new URL("http", address, port, "/ok");

      server = HttpServer.create(new InetSocketAddress(address, port), 0);
      server.createContext("/ok", ex -> {
        lastRequest = new HttpRequest(
            HttpMethod.valueOf(ex.getRequestMethod()),
            ex.getRequestURI().getPath());
        Headers headers = ex.getRequestHeaders();
        for (Map.Entry<String, List<String>> entry : headers.entrySet()) {
          for (String value : entry.getValue()) {
            lastRequest.addHeader(entry.getKey().toLowerCase(), value);
          }
        }
        try (InputStream in = ex.getRequestBody()) {
          lastRequest.setContent(bytes(ByteStreams.toByteArray(in)));
        }

        byte[] payload = "I like cheese".getBytes(UTF_8);
        ex.sendResponseHeaders(HTTP_OK, payload.length);
        try (OutputStream out = ex.getResponseBody()) {
          out.write(payload);
        }
      });
      server.start();
    }

    public void stop() {
      server.stop(0);
    }
  }

}
