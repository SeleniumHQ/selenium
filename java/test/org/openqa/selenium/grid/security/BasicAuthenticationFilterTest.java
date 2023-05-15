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

import static java.nio.charset.StandardCharsets.UTF_8;
import static org.assertj.core.api.Assertions.assertThat;
import static org.openqa.selenium.remote.http.HttpMethod.GET;

import java.net.HttpURLConnection;
import java.util.Base64;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

class BasicAuthenticationFilterTest {

  @Test
  void shouldAskAnUnauthenticatedRequestToAuthenticate() {
    HttpHandler handler =
        new BasicAuthenticationFilter("cheese", "cheddar").apply(req -> new HttpResponse());

    HttpResponse res = handler.execute(new HttpRequest(GET, "/"));

    assertThat(res.getStatus()).isEqualTo(HttpURLConnection.HTTP_UNAUTHORIZED);
    assertThat(res.getHeader("Www-Authenticate")).startsWith("Basic ");
    assertThat(res.getHeader("Www-Authenticate")).contains("Basic ");
  }

  @Test
  void shouldAllowAuthenticatedTrafficThrough() {
    HttpHandler handler =
        new BasicAuthenticationFilter("cheese", "cheddar").apply(req -> new HttpResponse());

    HttpResponse res =
        handler.execute(
            new HttpRequest(GET, "/")
                .setHeader(
                    "Authorization",
                    "Basic "
                        + Base64.getEncoder().encodeToString("cheese:cheddar".getBytes(UTF_8))));

    assertThat(res.isSuccessful()).isTrue();
  }
}
