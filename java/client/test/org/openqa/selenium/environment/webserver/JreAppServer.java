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

import com.google.common.collect.ImmutableMap;
import com.google.common.io.ByteStreams;
import com.sun.net.httpserver.HttpServer;
import org.openqa.selenium.grid.config.MapConfig;
import org.openqa.selenium.grid.server.BaseServerOptions;
import org.openqa.selenium.grid.server.Server;
import org.openqa.selenium.grid.web.PathResource;
import org.openqa.selenium.grid.web.ResourceHandler;
import org.openqa.selenium.jre.server.JreServer;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpMethod;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.http.Route;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.UncheckedIOException;
import java.net.InetSocketAddress;
import java.net.MalformedURLException;
import java.net.URL;
import java.nio.file.Path;
import java.util.Map;
import java.util.Objects;

import static com.google.common.net.HttpHeaders.CONTENT_TYPE;
import static com.google.common.net.MediaType.JSON_UTF_8;
import static java.nio.charset.StandardCharsets.UTF_8;
import static java.util.concurrent.TimeUnit.SECONDS;
import static org.openqa.selenium.build.InProject.locate;
import static org.openqa.selenium.remote.http.Contents.bytes;
import static org.openqa.selenium.remote.http.Contents.string;
import static org.openqa.selenium.remote.http.Route.get;
import static org.openqa.selenium.remote.http.Route.matching;
import static org.openqa.selenium.remote.http.Route.post;

public class JreAppServer implements AppServer {

  private final Server<?> server;

  public JreAppServer() {
    this(emulateJettyAppServer());
  }

  public JreAppServer(HttpHandler handler) {
    Objects.requireNonNull(handler, "Handler to use must be set");

    int port = PortProber.findFreePort();
    server = new JreServer(
      new BaseServerOptions(new MapConfig(Map.of("server", Map.of("port", port)))),
      handler);
  }

  private static Route emulateJettyAppServer() {
    Path common = locate("common/src/web").toAbsolutePath();

    return Route.combine(
      new ResourceHandler(new PathResource(common)),
      get("/encoding").to(EncodingHandler::new),
      matching(req -> req.getUri().startsWith("/page/")).to(PageHandler::new),
      get("/redirect").to(() -> new RedirectHandler()),
      get("/sleep").to(SleepingHandler::new),
      post("/upload").to(UploadHandler::new));
  }

  @Override
  public void start() {
    server.start();
  }

  @Override
  public void stop() {
    server.stop();
  }

  @Override
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
         server.getUrl().getPort(),
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
          server.getUrl().getPort(),
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
      request.setContent(bytes(data));
      HttpResponse response = client.execute(request);
      return string(response);
    } catch (IOException ex) {
      throw new RuntimeException(ex);
    }
  }

  @Override
  public String getHostName() {
    return "localhost";
  }

  @Override
  public String getAlternateHostName() {
    throw new UnsupportedOperationException("getAlternateHostName");
  }

  public static void main(String[] args) {
    JreAppServer server = new JreAppServer();
    server.start();

    System.out.println(server.whereIs("/"));
  }
}
