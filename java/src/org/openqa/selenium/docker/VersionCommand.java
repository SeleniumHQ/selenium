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

package org.openqa.selenium.docker;

import com.google.common.collect.ImmutableMap;

import org.openqa.selenium.docker.v1_41.V141Docker;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.json.JsonException;
import org.openqa.selenium.remote.http.Contents;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

import java.io.UncheckedIOException;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;

import static org.openqa.selenium.json.Json.MAP_TYPE;
import static org.openqa.selenium.remote.http.HttpMethod.GET;

class VersionCommand {

  private static final Json JSON = new Json();
  // Insertion order matters, and is preserved by ImmutableMap.
  private static final Map<Version, Function<HttpHandler, DockerProtocol>>
    SUPPORTED_VERSIONS = ImmutableMap.of(new Version("1.40"), V141Docker::new);

  private final HttpHandler handler;

  public VersionCommand(HttpHandler handler) {
    this.handler = Require.nonNull("HTTP client", handler);
  }

  public Optional<DockerProtocol> getDockerProtocol() {
    try {
      HttpResponse res = handler.execute(new HttpRequest(GET, "/version"));

      if (!res.isSuccessful()) {
        return Optional.empty();
      }

      Map<String, Object> raw = JSON.toType(Contents.string(res), MAP_TYPE);

      Version maxVersion = new Version((String) raw.get("ApiVersion"));
      Version minVersion = new Version((String) raw.get("MinAPIVersion"));

      return SUPPORTED_VERSIONS.entrySet().stream()
        .filter(entry -> {
          Version version = entry.getKey();
          if (version.equalTo(maxVersion) || version.equalTo(minVersion)) {
            return true;
          }
          return version.isLessThan(maxVersion) && version.isGreaterThan(minVersion);
        })
        .map(Map.Entry::getValue)
        .map(func -> func.apply(handler))
        .findFirst();
    } catch (ClassCastException | JsonException | NullPointerException | UncheckedIOException e) {
      return Optional.empty();
    }
  }

}
