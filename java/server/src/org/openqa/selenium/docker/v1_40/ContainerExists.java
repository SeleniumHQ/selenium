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

package org.openqa.selenium.docker.v1_40;

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;
import org.openqa.selenium.docker.ContainerId;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.http.Contents;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

import java.util.List;
import java.util.Map;
import java.util.Objects;

import static org.openqa.selenium.docker.v1_40.DockerMessages.throwIfNecessary;
import static org.openqa.selenium.json.Json.JSON_UTF_8;
import static org.openqa.selenium.remote.http.HttpMethod.GET;

class ContainerExists {
  private static final Json JSON = new Json();
  private final HttpHandler client;

  public ContainerExists(HttpHandler client) {
    this.client = Objects.requireNonNull(client);
  }

  boolean apply(ContainerId id) {
    Objects.requireNonNull(id);

    Map<String, Object> filters = ImmutableMap.of("id", ImmutableSet.of(id));

    HttpResponse res = throwIfNecessary(
      client.execute(
        new HttpRequest(GET, "/v1.40/containers/json")
          .addHeader("Content-Length", "0")
          .addHeader("Content-Type", JSON_UTF_8)
          .addQueryParameter("filters", JSON.toJson(filters))
      ),
      "Unable to list container %s",
      id);

    List<?> allContainers = JSON.toType(Contents.string(res), List.class);
    return !allContainers.isEmpty();
  }
}
