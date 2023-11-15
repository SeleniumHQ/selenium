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

import static java.net.HttpURLConnection.HTTP_INTERNAL_ERROR;
import static org.openqa.selenium.json.Json.JSON_UTF_8;

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;
import java.util.Collection;
import java.util.Set;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.http.Contents;
import org.openqa.selenium.remote.http.Filter;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpResponse;

public class CheckOriginHeader implements Filter {

  private final Set<String> allowedHosts;
  private final Set<String> skipChecksOn;

  public CheckOriginHeader(Collection<String> allowedOriginHosts, Set<String> skipChecksOn) {
    Require.nonNull("Allowed origins list", allowedOriginHosts);
    allowedHosts = ImmutableSet.copyOf(allowedOriginHosts);
    this.skipChecksOn =
        ImmutableSet.copyOf(Require.nonNull("URLs where checks are skipped", skipChecksOn));
  }

  @Override
  public HttpHandler apply(HttpHandler httpHandler) {
    Require.nonNull("Next handler", httpHandler);

    return req -> {
      if (skipChecksOn.contains(req.getUri())) {
        return httpHandler.execute(req);
      }

      String origin = req.getHeader("Origin");
      if (origin != null && !allowedHosts.contains(origin)) {
        return new HttpResponse()
            .setStatus(HTTP_INTERNAL_ERROR)
            .addHeader("Content-Type", JSON_UTF_8)
            .setContent(
                Contents.asJson(
                    ImmutableMap.of(
                        "value",
                        ImmutableMap.of(
                            "error", "unknown error",
                            "message", "Origin not allowed: " + origin,
                            "stacktrace", ""))));
      }

      return httpHandler.execute(req);
    };
  }
}
