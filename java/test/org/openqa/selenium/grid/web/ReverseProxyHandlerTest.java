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

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.net.MalformedURLException;
import java.net.URISyntaxException;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.netty.server.SimpleHttpServer;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpMethod;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.tracing.DefaultTestTracer;
import org.openqa.selenium.remote.tracing.Tracer;

class ReverseProxyHandlerTest {
  private Tracer tracer = DefaultTestTracer.createTracer();
  private HttpClient.Factory factory = HttpClient.Factory.createDefault();

  @Test
  void shouldForwardRequestsToEndPoint()
      throws MalformedURLException, URISyntaxException, InterruptedException {
    try (SimpleHttpServer server = new SimpleHttpServer()) {
      server.registerEndpoint(HttpMethod.GET, "/ok", SimpleHttpServer.ECHO_HEADERS_HANDLER);

      HttpHandler handler =
          new ReverseProxyHandler(tracer, factory.createClient(server.baseUri().toURL()));
      HttpRequest req = new HttpRequest(HttpMethod.GET, "/ok");
      req.addHeader("X-Cheese", "Cake");
      HttpResponse response = handler.execute(req);

      // HTTP headers are case insensitive.
      assertEquals("Cake", response.getHeader("x-cheese"));
    }
  }
}
