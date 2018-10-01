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
import static java.net.HttpURLConnection.HTTP_INTERNAL_ERROR;
import static java.nio.charset.StandardCharsets.UTF_8;

import com.google.common.base.Throwables;
import com.google.common.collect.ImmutableMap;

import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.ErrorCodes;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

import java.util.Map;
import java.util.Objects;

public class ErrorHandler implements CommandHandler {

  private final static ErrorCodes errors = new ErrorCodes();
  private final Json json;
  private final Throwable throwable;

  public ErrorHandler(Json json, Throwable throwable) {
    this.json = Objects.requireNonNull(json);
    this.throwable = Objects.requireNonNull(throwable);
  }

  @Override
  public void execute(HttpRequest req, HttpResponse resp) {
    resp.setStatus(HTTP_INTERNAL_ERROR);
    resp.setHeader("Cache-Control", "none");
    resp.setHeader("Content-Type", JSON_UTF_8.toString());

    Map<String, Object> value = ImmutableMap.of(
        "value", ImmutableMap.of(
            // W3C first
            "message", throwable.getMessage(),
            "error", errors.toState(errors.toStatusCode(throwable)),
            "stacktrace", Throwables.getStackTraceAsString(throwable),

            // JSON Wire Protocol second
            "class", throwable.getClass().getName(),
            "stackTrace", throwable.getStackTrace()
        ));

    resp.setContent(json.toJson(value).getBytes(UTF_8));
  }
}
