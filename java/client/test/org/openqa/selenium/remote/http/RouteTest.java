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

package org.openqa.selenium.remote.http;

import static java.net.HttpURLConnection.HTTP_INTERNAL_ERROR;
import static java.net.HttpURLConnection.HTTP_NOT_FOUND;
import static java.net.HttpURLConnection.HTTP_OK;
import static org.assertj.core.api.Assertions.assertThat;
import static org.openqa.selenium.remote.http.Contents.string;
import static org.openqa.selenium.remote.http.Contents.utf8String;
import static org.openqa.selenium.remote.http.HttpMethod.DELETE;
import static org.openqa.selenium.remote.http.HttpMethod.GET;
import static org.openqa.selenium.remote.http.HttpMethod.POST;

import org.assertj.core.api.Assertions;
import org.junit.Test;

import java.net.HttpURLConnection;

public class RouteTest {

  @Test
  public void shouldNotRouteUnhandledUrls() {
    Route route = Route.get("/hello").to(() -> req ->
        new HttpResponse().setContent(utf8String("Hello, World!"))
    );

    Assertions.assertThat(route.matches(new HttpRequest(GET, "/greeting"))).isFalse();
  }

  @Test
  public void shouldRouteSimplePaths() {
    Route route = Route.get("/hello").to(() -> req ->
        new HttpResponse().setContent(utf8String("Hello, World!"))
    );

    HttpRequest request = new HttpRequest(GET, "/hello");
    Assertions.assertThat(route.matches(request)).isTrue();

    HttpResponse res = route.execute(request);
    assertThat(string(res)).isEqualTo("Hello, World!");
  }

  @Test
  public void shouldAllowRoutesToBeUrlTemplates() {
    Route route = Route.post("/greeting/{name}").to(params -> req ->
        new HttpResponse().setContent(utf8String(String.format("Hello, %s!", params.get("name")))));

    HttpRequest request = new HttpRequest(POST, "/greeting/cheese");
    Assertions.assertThat(route.matches(request)).isTrue();

    HttpResponse res = route.execute(request);
    assertThat(string(res)).isEqualTo("Hello, cheese!");
  }

  @Test
  public void shouldAllowRoutesToBePrefixed() {
    Route route = Route.prefix("/cheese")
        .to(Route.get("/type").to(() -> req -> new HttpResponse().setContent(utf8String("brie"))));

    HttpRequest request = new HttpRequest(GET, "/cheese/type");
    Assertions.assertThat(route.matches(request)).isTrue();
    HttpResponse res = route.execute(request);
    assertThat(string(res)).isEqualTo("brie");
  }

  @Test
  public void shouldAllowRoutesToBeNested() {
    Route route = Route.prefix("/cheese").to(
        Route.prefix("/favourite").to(
            Route.get("/is/{kind}").to(
                params -> req -> new HttpResponse().setContent(Contents.utf8String(params.get("kind"))))));

    HttpRequest good = new HttpRequest(GET, "/cheese/favourite/is/stilton");
    Assertions.assertThat(route.matches(good)).isTrue();
    HttpResponse response = route.execute(good);
    assertThat(string(response)).isEqualTo("stilton");

    HttpRequest bad = new HttpRequest(GET, "/cheese/favourite/not-here");
    Assertions.assertThat(route.matches(bad)).isFalse();
  }

  @Test
  public void nestedRoutesShouldStripPrefixFromRequest() {
    Route route = Route.prefix("/cheese")
        .to(Route
                .get("/type").to(() -> req -> new HttpResponse().setContent(Contents.utf8String(req.getUri()))));

    HttpRequest request = new HttpRequest(GET, "/cheese/type");
    Assertions.assertThat(route.matches(request)).isTrue();
    HttpResponse res = route.execute(request);
    assertThat(string(res)).isEqualTo("/type");
  }

  @Test
  public void itShouldBePossibleToCombineRoutes() {
    Route route = Route.combine(
        Route.get("/hello").to(() -> req -> new HttpResponse().setContent(utf8String("world"))),
        Route.post("/cheese").to(
            () -> req -> new HttpResponse().setContent(utf8String("gouda"))));

    HttpRequest greet = new HttpRequest(GET, "/hello");
    Assertions.assertThat(route.matches(greet)).isTrue();
    HttpResponse response = route.execute(greet);
    assertThat(string(response)).isEqualTo("world");

    HttpRequest cheese = new HttpRequest(POST, "/cheese");
    Assertions.assertThat(route.matches(cheese)).isTrue();
    response = route.execute(cheese);
    assertThat(string(response)).isEqualTo("gouda");
  }

  @Test
  public void laterRoutesOverrideEarlierRoutesToFacilitateOverridingRoutes() {
    HttpHandler handler = Route.combine(
        Route.get("/hello").to(() -> req -> new HttpResponse().setContent(utf8String("world"))),
        Route.get("/hello").to(() -> req -> new HttpResponse().setContent(utf8String("buddy"))));

    HttpResponse response = handler.execute(new HttpRequest(GET, "/hello"));
    assertThat(string(response)).isEqualTo("buddy");
  }

  @Test
  public void shouldUseFallbackIfAnyDeclared() {
    HttpHandler handler = Route.delete("/negativity").to(() -> req -> new HttpResponse())
        .fallbackTo(() -> req -> new HttpResponse().setStatus(HTTP_NOT_FOUND));

    HttpResponse res = handler.execute(new HttpRequest(DELETE, "/negativity"));
    assertThat(res.getStatus()).isEqualTo(HTTP_OK);

    res = handler.execute(new HttpRequest(GET, "/joy"));
    assertThat(res.getStatus()).isEqualTo(HTTP_NOT_FOUND);
  }

  @Test
  public void shouldReturnA404IfNoRouteMatches() {
    Route route = Route.get("/hello").to(() -> req -> new HttpResponse());

    HttpResponse response = route.execute(new HttpRequest(GET, "/greeting"));

    assertThat(response.getStatus()).isEqualTo(HTTP_NOT_FOUND);
  }

  @Test
  public void shouldReturnA500IfNoResponseIsReturned() {
    Route route = Route.get("/hello").to(() -> req -> null);

    HttpResponse response = route.execute(new HttpRequest(GET, "/hello"));

    assertThat(response.getStatus()).isEqualTo(HTTP_INTERNAL_ERROR);
  }
}
