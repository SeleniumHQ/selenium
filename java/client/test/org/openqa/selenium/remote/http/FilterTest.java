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

import com.google.common.collect.ImmutableList;

import org.junit.Test;

import java.util.concurrent.atomic.AtomicBoolean;

public class FilterTest {

  @Test
  public void aFilterShouldWrapAnHttpHandler() {
    AtomicBoolean handlerCalled = new AtomicBoolean(false);
    AtomicBoolean filterCalled = new AtomicBoolean(false);

    HttpHandler handler = ((Filter) next -> req -> {
      filterCalled.set(true);
      return next.execute(req);
    }).andFinally(req -> {
      handlerCalled.set(true);
      return new HttpResponse();
    });

    HttpResponse res = handler.execute(new HttpRequest(GET, "/cheese"));

    assertThat(res).isNotNull();
    assertThat(handlerCalled.get()).isTrue();
    assertThat(filterCalled.get()).isTrue();
  }

  @Test
  public void shouldBePossibleToChainFiltersOneAfterAnother() {
    HttpHandler handler = ((Filter) next -> req -> {
      HttpResponse res = next.execute(req);
      res.addHeader("cheese", "cheddar");
      return res;
    }).andThen(next -> req -> {
      HttpResponse res = next.execute(req);
      res.setHeader("cheese", "brie");
      return res;
    }).andFinally(req -> new HttpResponse());

      HttpResponse res = handler.execute(new HttpRequest(GET, "/cheese"));

    assertThat(res).isNotNull();
    // Because the headers are applied to the response _after_ the request has been processed,
    // we expect to see them in reverse order.
    assertThat(res.getHeaders("cheese")).isEqualTo(ImmutableList.of("brie", "cheddar"));
  }
}
