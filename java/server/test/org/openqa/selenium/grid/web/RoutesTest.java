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

import static java.nio.charset.StandardCharsets.UTF_8;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.openqa.selenium.grid.web.Routes.combine;
import static org.openqa.selenium.grid.web.Routes.get;
import static org.openqa.selenium.grid.web.Routes.post;
import static org.openqa.selenium.remote.http.HttpMethod.GET;

import org.junit.Test;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

import java.io.IOException;
import java.util.UUID;

public class RoutesTest {

  @Test
  public void canCreateAHandlerWithNoDependencies() {
    Routes routes = get("/hello").using(SimpleHandler::new).build();

    CommandHandler handler = routes.match(new HttpRequest(GET, "/hello")).get();

    assertThat(handler).isInstanceOf(SimpleHandler.class);
  }

  private static class SimpleHandler implements CommandHandler {
    @Override
    public void execute(HttpRequest req, HttpResponse resp) {
      resp.setContent("Hello, World!".getBytes(UTF_8));
    }
  }

  private static class DependencyHandler implements CommandHandler {

    private final SessionId id;

    public DependencyHandler(SessionId id) {
      this.id = id;
    }

    @Override
    public void execute(HttpRequest req, HttpResponse resp) {
      resp.setContent(id.toString().getBytes(UTF_8));
    }
  }

  @Test
  public void canCreateAHandlerWithAStringDependencyThatIsAUrlTemplateParameter() {
    Routes routes = get("/hello/{cheese}")
        .using((params) -> new StringDepHandler(params.get("cheese")))
        .build();

    CommandHandler handler = routes.match(new HttpRequest(GET, "/hello/cheddar")).get();

    assertThat(handler).isInstanceOf(StringDepHandler.class);
    assertThat(((StringDepHandler) handler).cheese).isEqualTo("cheddar");
  }

  private static class StringDepHandler implements CommandHandler {

    private final String cheese;

    public StringDepHandler(String cheese) {
      this.cheese = cheese;
    }

    @Override
    public void execute(HttpRequest req, HttpResponse resp) {
      resp.setContent(("I love cheese. Especially " + cheese).getBytes(UTF_8));
    }
  }

  @Test
  public void shouldAllowAMappingFunctionToBeSetForEachParameter() {
    Routes routes = get("/hello/{sessionId}")
        .using((params) -> new DependencyHandler(new SessionId(params.get("sessionId"))))
        .build();

    SessionId id = new SessionId(UUID.randomUUID());
    CommandHandler handler = routes.match(new HttpRequest(GET, "/hello/" + id)).get();

    assertThat(handler).isInstanceOf(DependencyHandler.class);
    assertThat(((DependencyHandler) handler).id).isEqualTo(id);
  }

  @Test
  public void canDecorateSpecificHandlers() throws IOException {
    Routes routes = get("/foo")
        .using(SimpleHandler::new)
        .decorateWith(ResponseDecorator::new)
        .build();

    HttpRequest request = new HttpRequest(GET, "/foo");
    CommandHandler handler = routes.match(request).get();
    HttpResponse response = new HttpResponse();

    handler.execute(request, response);

    assertThat(response.getContentString()).isEqualTo("Hello, World!");
    assertThat(response.getHeader("Cheese")).isEqualTo("Camembert");
  }

  private static class ResponseDecorator implements CommandHandler {

    private final CommandHandler delegate;

    public ResponseDecorator(CommandHandler delegate) {
      this.delegate = delegate;
    }

    @Override
    public void execute(HttpRequest req, HttpResponse resp) throws IOException {
      resp.setHeader("Cheese", "Camembert");

      delegate.execute(req, resp);
    }
  }

  @Test
  public void canDecorateAllHandlers() throws IOException {
    Routes routes = get("/session/{sessionId}")
        .using((params) -> new DependencyHandler(new SessionId(params.get("sessionId"))))
        .decorateWith(ResponseDecorator::new)
        .build();

    SessionId id = new SessionId(UUID.randomUUID());
    HttpRequest request = new HttpRequest(GET, "/session/" + id);
    CommandHandler handler = routes.match(request).get();
    HttpResponse response = new HttpResponse();

    handler.execute(request, response);

    assertThat(response.getContentString()).isEqualTo(id.toString());
    assertThat(response.getHeader("Cheese")).isEqualTo("Camembert");
  }

  @Test
  public void shouldAllowFallbackHandlerToBeSpecified() {
    Routes routes = post("/something")
        .using(SimpleHandler::new)
        .fallbackTo(SimpleHandler::new)
        .build();

    CommandHandler handler = routes.match(new HttpRequest(GET, "/status")).get();

    assertThat(handler).isInstanceOf(SimpleHandler.class);
  }

  @Test
  public void whenCombiningMultipleRoutesUseTheLastOneAddedThatMatchesRequest() {
    Routes first = get("/session/{sessionId}").using(SimpleHandler::new).build();
    Routes second = get("/session/{sessionId}")
        .using((params) -> new DependencyHandler(new SessionId(params.get("sessionId"))))
        .build();

    Routes combined = combine(first, second).build();

    SessionId id = new SessionId(UUID.randomUUID());
    CommandHandler handler = combined.match(new HttpRequest(GET, "/session/" + id)).get();

    assertThat(handler).isInstanceOf(DependencyHandler.class);
  }

  @Test
  public void routesRequireAnImplementation() {
    Route route = get("/peas");

    assertThatExceptionOfType(IllegalStateException.class).isThrownBy(route::build);
  }
}
