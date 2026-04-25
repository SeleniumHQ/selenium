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

import static java.net.HttpURLConnection.HTTP_OK;
import static java.net.HttpURLConnection.HTTP_UNAVAILABLE;
import static org.assertj.core.api.Assertions.assertThat;
import static org.openqa.selenium.remote.http.HttpMethod.GET;

import java.util.concurrent.atomic.AtomicBoolean;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

class ReadinessCheckTest {

  @Test
  void shouldReturnOkWhenReady() {
    ReadinessCheck readinessCheck = new ReadinessCheck("Test component", () -> true);

    HttpResponse response = readinessCheck.execute(new HttpRequest(GET, "/readyz"));

    assertThat(response.getStatus()).isEqualTo(HTTP_OK);
  }

  @Test
  void shouldReturnUnavailableWhenDependencyIsNotReady() {
    ReadinessCheck readinessCheck = new ReadinessCheck("Test component", () -> false);

    HttpResponse response = readinessCheck.execute(new HttpRequest(GET, "/readyz"));

    assertThat(response.getStatus()).isEqualTo(HTTP_UNAVAILABLE);
  }

  @Test
  void shouldReturnUnavailableAfterTrafficIsStopped() {
    AtomicBoolean dependencyReady = new AtomicBoolean(true);
    ReadinessCheck readinessCheck = new ReadinessCheck("Test component", dependencyReady::get);

    readinessCheck.stopAcceptingTraffic();

    HttpResponse response = readinessCheck.execute(new HttpRequest(GET, "/readyz"));
    assertThat(response.getStatus()).isEqualTo(HTTP_UNAVAILABLE);
  }

  @Test
  void shouldReturnUnavailableWhenReadinessCheckFails() {
    ReadinessCheck readinessCheck =
        new ReadinessCheck(
            "Test component",
            () -> {
              throw new IllegalStateException("Not ready");
            });

    HttpResponse response = readinessCheck.execute(new HttpRequest(GET, "/readyz"));

    assertThat(response.getStatus()).isEqualTo(HTTP_UNAVAILABLE);
  }
}
