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

import static com.google.common.net.MediaType.JSON_UTF_8;
import static java.net.HttpURLConnection.HTTP_NOT_FOUND;
import static java.nio.charset.StandardCharsets.UTF_8;
import static org.openqa.selenium.remote.ErrorCodes.UNKNOWN_COMMAND;
import static org.openqa.selenium.remote.http.Contents.bytes;

import com.google.common.collect.ImmutableMap;

import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

import java.io.UncheckedIOException;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

public class NoHandler implements HttpHandler {

  private final Json json;

  public NoHandler(Json json) {
    this.json = Objects.requireNonNull(json);
  }

  @Override
  public HttpResponse execute(HttpRequest req) throws UncheckedIOException {
    // We're not using ImmutableMap for the outer map because it disallows null values.
    Map<String, Object> responseMap = new HashMap<>();
    responseMap.put("sessionId", null);
    responseMap.put("status", UNKNOWN_COMMAND);
    responseMap.put("value", ImmutableMap.of(
      "error", "unknown command",
      "message", String.format(
        "Unable to find command matching %s to %s",
        req.getMethod(),
        req.getUri()),
      "stacktrace", ""));
    responseMap = Collections.unmodifiableMap(responseMap);

    byte[] payload = json.toJson(responseMap).getBytes(UTF_8);

    return new HttpResponse()
      .setStatus(HTTP_NOT_FOUND)
      .setHeader("Content-Type", JSON_UTF_8.toString())
      .setHeader("Content-Length", String.valueOf(payload.length))

      .setContent(bytes(payload));
  }
}
