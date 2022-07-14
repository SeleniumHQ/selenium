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

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableSet;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.remote.http.Contents;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

import static java.net.HttpURLConnection.HTTP_INTERNAL_ERROR;
import static java.net.HttpURLConnection.HTTP_OK;
import static org.assertj.core.api.Assertions.assertThat;
import static org.openqa.selenium.json.Json.JSON_UTF_8;
import static org.openqa.selenium.remote.http.HttpMethod.POST;

public class EnsureSpecCompliantHeadersTest {

  private final HttpHandler alwaysOk = req -> new HttpResponse()
    .setContent(Contents.utf8String("Cheese"));

  @Test
  public void shouldBlockRequestsWithNoContentType() {
    HttpResponse res = new EnsureSpecCompliantHeaders(ImmutableList.of(), ImmutableSet.of())
      .apply(alwaysOk)
      .execute(new HttpRequest(POST, "/session"));

    assertThat(res.getStatus()).isEqualTo(HTTP_INTERNAL_ERROR);
  }

  @Test
  public void shouldAllowRequestsWithNoContentTypeWhenSkipCheckOnMatches() {
    HttpResponse res = new EnsureSpecCompliantHeaders(ImmutableList.of(), ImmutableSet.of("/gouda"))
      .apply(alwaysOk)
      .execute(new HttpRequest(POST, "/gouda"));

    assertThat(res.getStatus()).isEqualTo(HTTP_OK);
  }

  @Test
  public void requestsWithAnOriginHeaderShouldBeBlocked() {
    HttpResponse res = new EnsureSpecCompliantHeaders(ImmutableList.of(), ImmutableSet.of())
      .apply(alwaysOk)
      .execute(
        new HttpRequest(POST, "/session")
          .addHeader("Content-Type", JSON_UTF_8)
          .addHeader("Origin", "example.com"));

    assertThat(res.getStatus()).isEqualTo(HTTP_INTERNAL_ERROR);
  }

  @Test
  public void requestsWithAnAllowedOriginHeaderShouldBeAllowed() {
    HttpResponse res = new EnsureSpecCompliantHeaders(ImmutableList.of("example.com"), ImmutableSet.of())
      .apply(alwaysOk)
      .execute(
        new HttpRequest(POST, "/session")
          .addHeader("Content-Type", JSON_UTF_8)
          .addHeader("Origin", "example.com"));

    assertThat(res.getStatus()).isEqualTo(HTTP_OK);
    assertThat(Contents.string(res)).isEqualTo("Cheese");
  }

  @Test
  public void shouldAllowRequestsWithNoOriginHeader() {
    HttpResponse res = new EnsureSpecCompliantHeaders(ImmutableList.of(), ImmutableSet.of())
      .apply(alwaysOk)
      .execute(
        new HttpRequest(POST, "/session")
          .addHeader("Content-Type", JSON_UTF_8));

    assertThat(res.getStatus()).isEqualTo(HTTP_OK);
    assertThat(Contents.string(res)).isEqualTo("Cheese");
  }
}
