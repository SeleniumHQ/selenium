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
import static com.google.common.net.MediaType.JSON_UTF_8;
import static java.nio.charset.StandardCharsets.UTF_8;
import static java.util.stream.Collectors.mapping;
import static java.util.stream.Collectors.toList;
import static org.openqa.selenium.remote.http.HttpMethod.GET;
import static org.openqa.selenium.remote.http.HttpMethod.POST;
import static org.openqa.selenium.testing.InProject.locate;

import com.google.common.collect.ImmutableMap;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;

import org.openqa.selenium.json.Json;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpMethod;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

import java.io.BufferedOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.UncheckedIOException;
import java.net.InetSocketAddress;
import java.net.MalformedURLException;
import java.net.URL;
import java.nio.file.Paths;
import java.util.AbstractMap;
import java.util.Arrays;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.BiConsumer;
import java.util.function.Predicate;
import java.util.stream.Collectors;

public class JreAppServer implements AppServer {

  private final HttpServer server;
  private final Map<Predicate<HttpRequest>, BiConsumer<HttpRequest, HttpResponse>> mappings =
      new LinkedHashMap<>();  // Insert order matters.

  public JreAppServer() {
    try {
      int port = PortProber.findFreePort();
      server = HttpServer.create(new InetSocketAddress(port), 0);
      server.setExecutor(null);
      server.createContext(
          "/", httpExchange -> {
            HttpRequest req = new SunHttpRequest(httpExchange);
            HttpResponse resp = new SunHttpResponse(httpExchange);

            mappings.entrySet().stream()
                .filter(entry -> entry.getKey().test(req))
                .findFirst()
                .map(Map.Entry::getValue)
                .orElseGet(() -> (in, out) -> {
                  out.setStatus(404);
                  out.setContent("".getBytes(UTF_8));
                })
                .accept(req, resp);
          });

      emulateJettyAppServer();
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
  }

  protected JreAppServer emulateJettyAppServer() {
    addHandler(GET, "/encoding", new EncodingHandler());
    addHandler(GET, "/page", new PageHandler());
    addHandler(GET, "/redirect", new RedirectHandler(whereIs("/")));
    addHandler(GET, "/sleep", new SleepingHandler());
    addHandler(POST, "/upload", new UploadHandler());

    String javascript = locate("javascript").toAbsolutePath().toString();
    String common = locate("common/src/web").toAbsolutePath().toString();
    addHandler(
        GET,
        "/",
        new StaticContent(
            path -> Paths.get(common + path),
            path -> Paths.get(javascript + path.substring("/javascript".length()))));

    return this;
  }

  public JreAppServer addHandler(
      HttpMethod method,
      String url,
      BiConsumer<HttpRequest, HttpResponse> handler) {
    mappings.put(req -> req.getMethod().equals(method) && req.getUri().startsWith(url), handler);
    return this;
  }

  public void start() {
    server.start();
  }

  public void stop() {
    server.stop(0);
  }

  public String whereIs(String relativeUrl) {
    return createUrl("http", getHostName(), relativeUrl);
  }

  @Override
  public String whereElseIs(String relativeUrl) {
    return createUrl("http", getAlternateHostName(), relativeUrl);
  }

  @Override
  public String whereIsSecure(String relativeUrl) {
    return createUrl("https", getHostName(), relativeUrl);
  }

  @Override
  public String whereIsWithCredentials(String relativeUrl, String user, String password) {
    return String.format
        ("http://%s:%s@%s:%d/%s",
         user,
         password,
         getHostName(),
         server.getAddress().getPort(),
         relativeUrl);
  }

  private String createUrl(String protocol, String hostName, String relativeUrl) {
    if (!relativeUrl.startsWith("/")) {
      relativeUrl = "/" + relativeUrl;
    }

    try {
      return new URL(
          protocol,
          hostName,
          server.getAddress().getPort(),
          relativeUrl)
          .toString();
    } catch (MalformedURLException e) {
      throw new UncheckedIOException(e);
    }
  }

  @Override
  public String create(Page page) {
    try {
      byte[] data = new Json()
          .toJson(ImmutableMap.of("content", page.toString()))
          .getBytes(UTF_8);

      HttpClient client = HttpClient.Factory.createDefault().createClient(new URL(whereIs("/")));
      HttpRequest request = new HttpRequest(HttpMethod.POST, "/common/createPage");
      request.setHeader(CONTENT_TYPE, JSON_UTF_8.toString());
      request.setContent(data);
      HttpResponse response = client.execute(request);
      return response.getContentString();
    } catch (IOException ex) {
      throw new RuntimeException(ex);
    }
  }

  public String getHostName() {
    return "localhost";
  }

  @Override
  public String getAlternateHostName() {
    throw new UnsupportedOperationException("getAlternateHostName");
  }

  private static class SunHttpRequest extends HttpRequest {

    private final HttpExchange exchange;

    public SunHttpRequest(HttpExchange exchange) {
      super(HttpMethod.valueOf(exchange.getRequestMethod()), exchange.getRequestURI().toString());
      this.exchange = exchange;
    }

    @Override
    public HttpMethod getMethod() {
      return HttpMethod.valueOf(exchange.getRequestMethod());
    }

    @Override
    public String getUri() {
      return exchange.getRequestURI().getPath();
    }

    @Override
    public String getQueryParameter(String name) {
      String query = exchange.getRequestURI().getQuery();
      if (query == null) {
        return null;
      }

      HashMap<String, List<String>> params = Arrays.stream(query.split("&"))
          .map(q -> {
            int i = q.indexOf("=");
            if (i == -1) {
              return new AbstractMap.SimpleImmutableEntry<>(q, "");
            }
            return new AbstractMap.SimpleImmutableEntry<>(q.substring(0, i), q.substring(i + 1));
          })
          .collect(Collectors.groupingBy(
              Map.Entry::getKey,
              HashMap::new,
              mapping(Map.Entry::getValue, toList())));

      List<String> values = params.get(name);
      if (values == null || values.isEmpty()) {
        return null;
      }
      return values.get(0);
    }

    @Override
    public Iterable<String> getHeaderNames() {
      return exchange.getRequestHeaders().keySet();
    }

    @Override
    public Iterable<String> getHeaders(String name) {
      return exchange.getResponseHeaders().get(name);
    }

    @Override
    public InputStream consumeContentStream() {
      return exchange.getRequestBody();
    }
  }

  private class SunHttpResponse extends HttpResponse {

    private final HttpExchange exchange;

    public SunHttpResponse(HttpExchange exchange) {
      this.exchange = exchange;
    }

    @Override
    public void removeHeader(String name) {
      exchange.getResponseHeaders().remove(name);
    }

    @Override
    public void addHeader(String name, String value) {
      exchange.getResponseHeaders().add(name, value);
    }

    @Override
    public void setContent(byte[] data) {
      try {
        setHeader("Content-Length", String.valueOf(data.length));
        exchange.sendResponseHeaders(getStatus(), data.length);

        try (OutputStream os = exchange.getResponseBody();
             OutputStream out = new BufferedOutputStream(os)) {
          out.write(data);
        }
      } catch (IOException e) {
        throw new UncheckedIOException(e);
      }
    }
  }

  public static void main(String[] args) {
    JreAppServer server = new JreAppServer();
    server.start();

    System.out.println(server.whereIs("/"));
  }
}
