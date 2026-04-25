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

package org.openqa.selenium.grid.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.openqa.selenium.remote.http.HttpMethod.GET;

import org.junit.jupiter.api.Test;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

class RequiresSecretFilterTest {

  @Test
  void shouldRequireSecretForRegularRequests() {
    HttpHandler handler =
        new RequiresSecretFilter(new Secret("cheddar")).apply(req -> new HttpResponse());

    HttpResponse res = handler.execute(new HttpRequest(GET, "/status"));

    assertThat(res.isSuccessful()).isFalse();
  }

  @Test
  void shouldAllowReadinessCheckWithoutSecret() {
    HttpHandler handler =
        new RequiresSecretFilter(new Secret("cheddar")).apply(req -> new HttpResponse());

    HttpResponse res = handler.execute(new HttpRequest(GET, "/readyz"));

    assertThat(res.isSuccessful()).isTrue();
  }
}
