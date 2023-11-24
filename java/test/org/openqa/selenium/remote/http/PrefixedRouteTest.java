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

import static java.util.Collections.singletonList;
import static org.assertj.core.api.Assertions.assertThat;
import static org.openqa.selenium.remote.http.HttpMethod.GET;

import java.util.Arrays;
import java.util.List;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

@Tag("UnitTests")
class PrefixedRouteTest {

  @Test
  void pathWithoutPrefixIsNotMatched() {
    Route route =
        Route.prefix("/cheese").to(Route.matching(req -> true).to(() -> req -> new HttpResponse()));

    assertThat(route.matches(new HttpRequest(GET, "/cake"))).isFalse();
  }

  @Test
  void pathWithPrefixIsMatched() {
    Route route =
        Route.prefix("/cheese").to(Route.matching(req -> true).to(() -> req -> new HttpResponse()));

    assertThat(route.matches(new HttpRequest(GET, "/cheese/cake"))).isTrue();
  }

  @Test
  void pathWhichCoincidentallyStartsWithThePrefixIsNotMatched() {
    Route route =
        Route.prefix("/cheese").to(Route.matching(req -> true).to(() -> req -> new HttpResponse()));

    assertThat(route.matches(new HttpRequest(GET, "/cheeseandpeas"))).isFalse();
  }

  @Test
  void pathWhichIsJustThePrefixMatches() {
    Route route =
        Route.prefix("/cheese").to(Route.matching(req -> true).to(() -> req -> new HttpResponse()));

    assertThat(route.matches(new HttpRequest(GET, "/cheese"))).isTrue();
  }

  @Test
  void pathWhichIsJustThePrefixAndATrailingSlashMatches() {
    Route route =
        Route.prefix("/cheese").to(Route.matching(req -> true).to(() -> req -> new HttpResponse()));

    assertThat(route.matches(new HttpRequest(GET, "/cheese/"))).isTrue();
  }

  @Test
  void pathWhichDoesMatchHasPrefixAsAttributeWhenHandling() {
    AtomicReference<String> path = new AtomicReference<>();
    AtomicReference<List<?>> parts = new AtomicReference<>();

    Route route =
        Route.prefix("/cheese")
            .to(
                Route.matching(req -> true)
                    .to(
                        () ->
                            req -> {
                              path.set(req.getUri());
                              parts.set((List<?>) req.getAttribute(UrlPath.ROUTE_PREFIX_KEY));
                              return new HttpResponse();
                            }));

    route.execute(new HttpRequest(GET, "/cheese/and/peas"));

    assertThat(path.get()).isEqualTo("/and/peas");
    assertThat(parts.get()).isEqualTo(singletonList("/cheese"));
  }

  @Test
  void nestingPrefixesAlsoCausesPathStoredInAttributeToBeExtended() {
    AtomicReference<String> path = new AtomicReference<>();
    AtomicReference<List<?>> parts = new AtomicReference<>();

    Route route =
        Route.prefix("/cheese")
            .to(
                Route.prefix("/and")
                    .to(
                        Route.matching(req -> true)
                            .to(
                                () ->
                                    req -> {
                                      path.set(req.getUri());
                                      parts.set(
                                          (List<?>) req.getAttribute(UrlPath.ROUTE_PREFIX_KEY));
                                      return new HttpResponse();
                                    })));

    route.execute(new HttpRequest(GET, "/cheese/and/peas"));

    assertThat(path.get()).isEqualTo("/peas");
    assertThat(parts.get()).isEqualTo(Arrays.asList("/cheese", "/and"));
  }
}
