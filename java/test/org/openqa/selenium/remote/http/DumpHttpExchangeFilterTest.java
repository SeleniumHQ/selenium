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

import static java.nio.charset.StandardCharsets.UTF_8;
import static org.assertj.core.api.Assertions.assertThat;
import static org.openqa.selenium.remote.http.Contents.string;
import static org.openqa.selenium.remote.http.HttpMethod.GET;

import org.junit.jupiter.api.Test;

class DumpHttpExchangeFilterTest {

  @Test
  void shouldIncludeRequestAndResponseHeaders() {
    DumpHttpExchangeFilter dumpFilter = new DumpHttpExchangeFilter();

    String reqLog =
        dumpFilter.requestLogMessage(
            new HttpRequest(GET, "/foo").addHeader("Peas", "and Sausages"));

    assertThat(reqLog).contains("Peas");
    assertThat(reqLog).contains("and Sausages");

    String resLog =
        dumpFilter.responseLogMessage(
            new HttpResponse()
                .addHeader("Cheese", "Brie")
                .setContent(string("Hello, World!", UTF_8)));

    assertThat(resLog).contains("Cheese");
    assertThat(resLog).contains("Brie");
  }

  @Test
  void shouldIncludeRequestContentInLogMessage() {
    DumpHttpExchangeFilter dumpFilter = new DumpHttpExchangeFilter();

    String reqLog =
        dumpFilter.requestLogMessage(
            new HttpRequest(GET, "/foo").setContent(Contents.string("Cheese is lovely", UTF_8)));

    assertThat(reqLog).contains("Cheese is lovely");
  }

  @Test
  void shouldIncludeResponseCodeInLogMessage() {
    DumpHttpExchangeFilter dumpFilter = new DumpHttpExchangeFilter();

    String resLog = dumpFilter.responseLogMessage(new HttpResponse().setStatus(505));

    assertThat(resLog).contains("505");
  }

  @Test
  void shouldIncludeBodyOfResponseInLogMessage() {
    DumpHttpExchangeFilter dumpFilter = new DumpHttpExchangeFilter();

    String resLog =
        dumpFilter.responseLogMessage(
            new HttpResponse().setContent(Contents.string("Peas", UTF_8)));

    assertThat(resLog).contains("Peas");
  }
}
