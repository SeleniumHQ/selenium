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

import static org.assertj.core.api.Assertions.assertThat;
import static org.openqa.selenium.remote.http.HttpMethod.GET;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

@Tag("UnitTests")
class FilterTest {

  @Test
  void aFilterShouldWrapAnHttpHandler() {
    AtomicBoolean handlerCalled = new AtomicBoolean(false);
    AtomicBoolean filterCalled = new AtomicBoolean(false);

    HttpHandler handler =
        ((Filter)
                next ->
                    req -> {
                      filterCalled.set(true);
                      return next.execute(req);
                    })
            .andFinally(
                req -> {
                  handlerCalled.set(true);
                  return new HttpResponse();
                });

    HttpResponse res = handler.execute(new HttpRequest(GET, "/cheese"));

    assertThat(res).isNotNull();
    assertThat(handlerCalled.get()).isTrue();
    assertThat(filterCalled.get()).isTrue();
  }

  @Test
  void shouldBePossibleToChainFiltersOneAfterAnother() {
    HttpHandler handler =
        ((Filter)
                next ->
                    req -> {
                      HttpResponse res = next.execute(req);
                      res.addHeader("cheese", "cheddar");
                      return res;
                    })
            .andThen(
                next ->
                    req -> {
                      HttpResponse res = next.execute(req);
                      res.setHeader("cheese", "brie");
                      return res;
                    })
            .andFinally(req -> new HttpResponse());

    HttpResponse res = handler.execute(new HttpRequest(GET, "/cheese"));

    assertThat(res).isNotNull();
    // Because the headers are applied to the response _after_ the request has been processed,
    // we expect to see them in reverse order.
    assertThat(res.getHeaders("cheese")).containsExactly("brie", "cheddar");
  }

  @Test
  void eachFilterShouldOnlyBeCalledOnce() {
    AtomicInteger rootCalls = new AtomicInteger(0);

    HttpHandler root =
        req -> {
          rootCalls.incrementAndGet();
          return new HttpResponse();
        };

    AtomicInteger filterOneCount = new AtomicInteger(0);
    root =
        root.with(
            httpHandler ->
                req -> {
                  filterOneCount.incrementAndGet();
                  return httpHandler.execute(req);
                });

    AtomicInteger filterTwoCount = new AtomicInteger(0);
    root =
        root.with(
            httpHandler ->
                req -> {
                  filterTwoCount.incrementAndGet();
                  return httpHandler.execute(req);
                });

    root.execute(new HttpRequest(GET, "/cheese"));

    assertThat(rootCalls.get()).isEqualTo(1);
    assertThat(filterOneCount.get()).isEqualTo(1);
    assertThat(filterTwoCount.get()).isEqualTo(1);
  }

  @Test
  void filtersShouldBeCalledInTheOrderAddedWithLastInCalledFirst() {
    List<String> ordered = new ArrayList<>();

    HttpHandler inner =
        req -> {
          ordered.add("inner");
          return new HttpResponse();
        };
    HttpHandler handler =
        inner
            .with(
                next ->
                    req -> {
                      ordered.add("middle");
                      return next.execute(req);
                    })
            .with(
                next ->
                    req -> {
                      ordered.add("outer");
                      return next.execute(req);
                    });

    handler.execute(new HttpRequest(GET, "/cheese"));

    assertThat(ordered).isEqualTo(Arrays.asList("outer", "middle", "inner"));
  }
}
