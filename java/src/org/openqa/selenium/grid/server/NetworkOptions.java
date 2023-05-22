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

package org.openqa.selenium.grid.server;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.openqa.selenium.grid.config.Config;
import org.openqa.selenium.grid.web.CheckContentTypeHeader;
import org.openqa.selenium.grid.web.CheckOriginHeader;
import org.openqa.selenium.grid.web.EnsureSpecCompliantResponseHeaders;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.http.Filter;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.tracing.TracedHttpClient;
import org.openqa.selenium.remote.tracing.Tracer;

public class NetworkOptions {

  private static final String NETWORK_SECTION = "network";

  private final Config config;
  // These are commonly used by process which can't set various headers.
  private final Set<String> SKIP_CHECKS_ON = ImmutableSet.of("/status", "/readyz");

  public NetworkOptions(Config config) {
    this.config = Require.nonNull("Config", config);
  }

  public HttpClient.Factory getHttpClientFactory(Tracer tracer) {
    return new TracedHttpClient.Factory(tracer, HttpClient.Factory.createDefault());
  }

  public Filter getSpecComplianceChecks() {
    // Base case: we do nothing
    Filter toReturn = httpHandler -> httpHandler;

    toReturn = toReturn.andThen(new EnsureSpecCompliantResponseHeaders());

    if (config.getBool(NETWORK_SECTION, "relax-checks").orElse(false)) {
      return toReturn;
    }

    if (config.getBool(NETWORK_SECTION, "check_content_type").orElse(true)) {
      toReturn = toReturn.andThen(new CheckContentTypeHeader(SKIP_CHECKS_ON));
    }

    boolean checkOrigin = config.getBool(NETWORK_SECTION, "check_origin_header").orElse(true);
    Optional<List<String>> allowedOrigins = config.getAll(NETWORK_SECTION, "allowed_origins");

    if (checkOrigin || allowedOrigins.isPresent()) {
      toReturn =
          toReturn.andThen(
              new CheckOriginHeader(allowedOrigins.orElse(ImmutableList.of()), SKIP_CHECKS_ON));
    }

    return toReturn;
  }
}
