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

package org.openqa.selenium.docker.v1_41;

import static org.openqa.selenium.docker.v1_41.DockerMessages.throwIfNecessary;
import static org.openqa.selenium.docker.v1_41.V141Docker.DOCKER_API_VERSION;
import static org.openqa.selenium.remote.http.HttpMethod.POST;

import java.time.Duration;
import org.openqa.selenium.docker.ContainerId;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpRequest;

class StopContainer {
  private final HttpHandler client;

  public StopContainer(HttpHandler client) {
    this.client = Require.nonNull("HTTP client", client);
  }

  public void apply(ContainerId id, Duration timeout) {
    Require.nonNull("Container id", id);
    Require.nonNull("Timeout", timeout);

    String seconds = String.valueOf(timeout.toMillis() / 1000);

    String requestUrl = String.format("/v%s/containers/%s/stop", DOCKER_API_VERSION, id);
    HttpRequest request =
        new HttpRequest(POST, requestUrl)
            .addHeader("Content-Type", "text/plain")
            .addQueryParameter("t", seconds);

    throwIfNecessary(client.execute(request), "Unable to stop container: %s", id);
  }
}
