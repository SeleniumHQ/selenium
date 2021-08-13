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

import com.google.common.net.MediaType;
import org.openqa.selenium.build.InProject;
import org.openqa.selenium.grid.security.BasicAuthenticationFilter;
import org.openqa.selenium.grid.web.PathResource;
import org.openqa.selenium.grid.web.ResourceHandler;
import org.openqa.selenium.remote.http.Contents;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.http.Routable;
import org.openqa.selenium.remote.http.Route;

import java.io.UncheckedIOException;
import java.nio.file.Path;

import static java.nio.charset.StandardCharsets.UTF_8;
import static org.openqa.selenium.remote.http.HttpMethod.GET;

public class HandlersForTests implements Routable {

  private static final String TEMP_SRC_CONTEXT_PATH = "/temp";
  private final Route delegate;

  public HandlersForTests(String hostname, int port, Path tempPageDir) {
    CreatePageHandler createPageHandler = new CreatePageHandler(
      tempPageDir,
      hostname,
      port,
      TEMP_SRC_CONTEXT_PATH);
    Routable generatedPages = new ResourceHandler(new PathResource(tempPageDir));

    Path webSrc = InProject.locate("common/src/web");

    Route route = Route.combine(
      Route.get("/basicAuth").to(() -> req ->
        new HttpResponse()
          .addHeader("Content-Type", MediaType.HTML_UTF_8.toString())
          .setContent(Contents.string("<h1>authorized</h1>", UTF_8)))
        .with(new BasicAuthenticationFilter("test", "test")),
      Route.get("/echo").to(EchoHandler::new),
      Route.get("/cookie").to(CookieHandler::new),
      Route.get("/encoding").to(EncodingHandler::new),
      Route.matching(req -> req.getUri().startsWith("/generated/")).to(() -> new GeneratedJsTestHandler("/generated")),
      Route.matching(req -> req.getUri().startsWith("/page/") && req.getMethod() == GET).to(PageHandler::new),
      Route.post("/createPage").to(() -> createPageHandler),
      Route.get("/redirect").to(RedirectHandler::new),
      Route.get("/sleep").to(SleepingHandler::new),
      Route.post("/upload").to(UploadHandler::new),
      Route.matching(req -> req.getUri().startsWith("/utf8/")).to(() -> new Utf8Handler(webSrc, "/utf8/")),
      Route.prefix(TEMP_SRC_CONTEXT_PATH).to(Route.combine(generatedPages)),
      new CommonWebResources());

    delegate = Route.combine(
      route,
      Route.prefix("/common").to(route));
  }

  @Override
  public boolean matches(HttpRequest req) {
    return delegate.matches(req);
  }

  @Override
  public HttpResponse execute(HttpRequest req) throws UncheckedIOException {
    return delegate.execute(req);
  }
}
