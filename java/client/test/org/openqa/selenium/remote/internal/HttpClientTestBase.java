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

import static org.assertj.core.api.Assertions.assertThat;
import static org.openqa.selenium.json.Json.MAP_TYPE;
import static org.openqa.selenium.net.Urls.fromUri;
import static org.openqa.selenium.remote.http.Contents.string;
import static org.openqa.selenium.remote.http.HttpMethod.GET;

import com.google.common.collect.HashMultimap;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.Multimap;

import org.junit.Test;
import org.openqa.selenium.BuildInfo;
import org.openqa.selenium.Platform;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.json.JsonOutput;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.seleniumhq.jetty9.server.Server;
import org.seleniumhq.jetty9.servlet.ServletContextHandler;
import org.seleniumhq.jetty9.servlet.ServletHolder;

import java.io.IOException;
import java.io.PrintWriter;
import java.io.Writer;
import java.net.URI;
import java.net.URL;
import java.util.Map;
import java.util.stream.Stream;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

abstract public class HttpClientTestBase {

  protected abstract HttpClient.Factory createFactory();

  @Test
  public void responseShouldCaptureASingleHeader() throws Exception {
    HashMultimap<String, String> headers = HashMultimap.create();
    headers.put("Cake", "Delicious");

    HttpResponse response = getResponseWithHeaders(headers);

    String value = response.getHeader("Cake");
    assertThat(value).isEqualTo("Delicious");
  }

  /**
   * The HTTP Spec that it should be
   * <a href="https://www.w3.org/Protocols/rfc2616/rfc2616-sec4.html#sec4.2">safe to combine them
   * </a>, but things like the <a href="https://www.ietf.org/rfc/rfc2109.txt">cookie spec</a> make
   * this hard (notably when a legal value may contain a comma).
   */
  @Test
  public void responseShouldKeepMultipleHeadersSeparate() throws Exception {
    HashMultimap<String, String> headers = HashMultimap.create();
    headers.put("Cheese", "Cheddar");
    headers.put("Cheese", "Brie, Gouda");

    HttpResponse response = getResponseWithHeaders(headers);

    ImmutableList<String> values = ImmutableList.copyOf(response.getHeaders("Cheese"));

    assertThat(values).contains("Cheddar");
    assertThat(values).contains("Brie, Gouda");
  }

  @Test
  public void shouldAddUrlParameters() {
    HttpRequest request = new HttpRequest(GET, "/query");
    String value = request.getQueryParameter("cheese");
    assertThat(value).isNull();

    request.addQueryParameter("cheese", "brie");
    value = request.getQueryParameter("cheese");
    assertThat(value).isEqualTo("brie");
  }

  @Test
  public void shouldSendSimpleQueryParameters() throws Exception {
    HttpRequest request = new HttpRequest(GET, "/query");
    request.addQueryParameter("cheese", "cheddar");

    HttpResponse response = getQueryParameterResponse(request);
    Map<String, Object> values = new Json().toType(string(response), MAP_TYPE);

    assertThat(values).containsEntry("cheese", ImmutableList.of("cheddar"));
  }

  @Test
  public void shouldEncodeParameterNamesAndValues() throws Exception {
    HttpRequest request = new HttpRequest(GET, "/query");
    request.addQueryParameter("cheese type", "tasty cheese");

    HttpResponse response = getQueryParameterResponse(request);
    Map<String, Object> values = new Json().toType(string(response), MAP_TYPE);

    assertThat(values).containsEntry("cheese type", ImmutableList.of("tasty cheese"));
  }

  @Test
  public void canAddMoreThanOneQueryParameter() throws Exception {
    HttpRequest request = new HttpRequest(GET, "/query");
    request.addQueryParameter("cheese", "cheddar");
    request.addQueryParameter("cheese", "gouda");
    request.addQueryParameter("vegetable", "peas");

    HttpResponse response = getQueryParameterResponse(request);
    Map<String, Object> values = new Json().toType(string(response), MAP_TYPE);

    assertThat(values).containsEntry("cheese", ImmutableList.of("cheddar", "gouda"));
    assertThat(values).containsEntry("vegetable", ImmutableList.of("peas"));
  }

  @Test
  public void shouldAllowUrlsWithSchemesToBeUsed() throws Exception {
    Server server = new Server(PortProber.findFreePort());
    ServletContextHandler handler = new ServletContextHandler();
    handler.setContextPath("");

    class Canned extends HttpServlet {
      @Override
      protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        try (PrintWriter writer = resp.getWriter()) {
          writer.append("Hello, World!");
        }
      }
    }
    ServletHolder holder = new ServletHolder(new Canned());
    handler.addServlet(holder, "/*");
    server.setHandler(handler);

    server.start();
    try {
      // This is a terrible choice of URL
      HttpClient client = createFactory().createClient(new URL("http://example.com"));

      URI uri = server.getURI();
      HttpRequest request = new HttpRequest(
          GET,
          String.format("http://%s:%s/hello", uri.getHost(), uri.getPort()));

      HttpResponse response = client.execute(request);

      assertThat(string(response)).isEqualTo("Hello, World!");
    } finally {
      server.stop();
    }
  }

  @Test
  public void shouldIncludeAUserAgentHeader() throws Exception {
    HttpResponse response = executeWithinServer(
        new HttpRequest(GET, "/foo"),
        new HttpServlet() {
          @Override
          protected void doGet(HttpServletRequest req, HttpServletResponse resp)
              throws IOException {
            try (Writer writer = resp.getWriter()) {
              writer.write(req.getHeader("user-agent"));
            }
          }
        });


    String label = new BuildInfo().getReleaseLabel();
    Platform platform = Platform.getCurrent();
    Platform family = platform.family() == null ? platform : platform.family();

    assertThat(string(response)).isEqualTo(String.format(
        "selenium/%s (java %s)",
        label,
        family.toString().toLowerCase()));
  }

  private HttpResponse getResponseWithHeaders(final Multimap<String, String> headers)
      throws Exception {
    return executeWithinServer(
        new HttpRequest(GET, "/foo"),
        new HttpServlet() {
          @Override
          protected void doGet(HttpServletRequest req, HttpServletResponse resp) {
            headers.forEach(resp::addHeader);
            resp.setContentLengthLong(0);
          }
        });
  }

  private HttpResponse getQueryParameterResponse(HttpRequest request) throws Exception {
    return executeWithinServer(
        request,
        new HttpServlet() {
          @Override
          protected void doGet(HttpServletRequest req, HttpServletResponse resp)
              throws IOException {
            try (Writer writer = resp.getWriter()) {
              JsonOutput json = new Json().newOutput(writer);
              json.beginObject();
              req.getParameterMap()
                  .forEach((key, value) -> {
                    json.name(key);
                    json.beginArray();
                    Stream.of(value).forEach(json::write);
                    json.endArray();
                  });
              json.endObject();
            }
          }
        });
  }

  private HttpResponse executeWithinServer(HttpRequest request, HttpServlet servlet)
      throws Exception {
    Server server = new Server(PortProber.findFreePort());
    ServletContextHandler handler = new ServletContextHandler();
    handler.setContextPath("");
    ServletHolder holder = new ServletHolder(servlet);
    handler.addServlet(holder, "/*");

    server.setHandler(handler);

    server.start();
    try {
      HttpClient client = createFactory().createClient(fromUri(server.getURI()));
      return client.execute(request);
    } finally {
      server.stop();
    }
  }
}
