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

package org.openqa.selenium.remote.server.scheduler;

import static java.nio.charset.StandardCharsets.UTF_8;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import com.google.common.collect.ImmutableMap;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import org.junit.BeforeClass;
import org.junit.Test;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.internal.OkHttpClient;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.MalformedURLException;
import java.net.URL;

public class HealthCheckTest {

  private static HttpServer httpServer;

  @BeforeClass
  public static void setupServer() throws IOException {
    int port = PortProber.findFreePort();
    httpServer = HttpServer.create(new InetSocketAddress(port), 5);
    httpServer.createContext("/status", new HttpHandler() {
      @Override
      public void handle(HttpExchange httpExchange) throws IOException {
        String json = new Json().toJson(
            ImmutableMap.of(
                "value", ImmutableMap.of(
                    "ready", true,
                    "message", "AOK")));
        byte[] bytes = json.getBytes(UTF_8);
        httpExchange.sendResponseHeaders(200, bytes.length);

        try (OutputStream responseBody = httpExchange.getResponseBody()) {
          responseBody.write(bytes);
        }
      }
    });
    httpServer.createContext("/busy/status", new HttpHandler() {
      @Override
      public void handle(HttpExchange httpExchange) throws IOException {
        String json = new Json().toJson(
            ImmutableMap.of(
                "value", ImmutableMap.of(
                    "ready", false,
                    "message", "Very busy")));
        byte[] bytes = json.getBytes(UTF_8);
        httpExchange.sendResponseHeaders(200, bytes.length);

        try (OutputStream responseBody = httpExchange.getResponseBody()) {
          responseBody.write(bytes);
        }
      }
    });
    httpServer.createContext("/bad/status", new HttpHandler() {
      @Override
      public void handle(HttpExchange httpExchange) throws IOException {
        String text = "Cheese is delcious";
        byte[] bytes = text.getBytes(UTF_8);
        httpExchange.sendResponseHeaders(200, bytes.length);

        try (OutputStream responseBody = httpExchange.getResponseBody()) {
          responseBody.write(bytes);
        }
      }
    });

    httpServer.start();
  }

  @Test
  public void shouldCheckStatusPage() throws MalformedURLException {
    URL url = new URL("http", "localhost", httpServer.getAddress().getPort(), "");
    HttpClient client = new OkHttpClient.Factory().createClient(url);
    HealthCheck check = new WebDriverStatusHealthCheck(client);

    HealthCheck.Result result = check.check();

    assertTrue(result.isAlive());
    assertEquals("AOK", result.getMessage());
  }

  @Test
  public void reportsServiceIsAliveEvenIfItIsBusy() throws MalformedURLException {
    URL url = new URL("http", "localhost", httpServer.getAddress().getPort(), "/busy");
    HttpClient client = new OkHttpClient.Factory().createClient(url);
    HealthCheck check = new WebDriverStatusHealthCheck(client);

    HealthCheck.Result result = check.check();

    assertTrue(result.isAlive());
    assertEquals("Very busy", result.getMessage());
  }

  @Test
  public void shouldReportServerIsNotAliveIfStatusPageReturnsGarbage()
      throws MalformedURLException {
    URL url = new URL("http", "localhost", httpServer.getAddress().getPort(), "/bad");
    HttpClient client = new OkHttpClient.Factory().createClient(url);
    HealthCheck check = new WebDriverStatusHealthCheck(client);

    HealthCheck.Result result = check.check();

    assertFalse(result.isAlive());
    assertTrue(result.getMessage(), result.getMessage().contains("Cheese"));
  }

  @Test
  public void shouldReportServerNotAvailableIfServerIsNotAvailable() throws MalformedURLException {
    URL url = new URL("http://localhost:" + PortProber.findFreePort());
    HttpClient client = new OkHttpClient.Factory().createClient(url);

    HealthCheck check = new WebDriverStatusHealthCheck(client);

    HealthCheck.Result result = check.check();

    assertFalse(result.isAlive());
  }
}
