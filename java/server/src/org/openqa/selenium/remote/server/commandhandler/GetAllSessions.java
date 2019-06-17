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

package org.openqa.selenium.remote.server.commandhandler;

import static com.google.common.net.MediaType.JSON_UTF_8;
import static java.net.HttpURLConnection.HTTP_OK;
import static java.nio.charset.StandardCharsets.UTF_8;
import static org.openqa.selenium.remote.ErrorCodes.SUCCESS;
import static org.openqa.selenium.remote.http.Contents.bytes;

import com.google.common.collect.ImmutableMap;

import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.server.ActiveSessions;

import java.io.UncheckedIOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;

public class GetAllSessions implements HttpHandler {

  private final ActiveSessions allSessions;
  private final Json json;

  public GetAllSessions(ActiveSessions allSessions, Json json) {
    this.allSessions = Objects.requireNonNull(allSessions);
    this.json = Objects.requireNonNull(json);
  }

  @Override
  public HttpResponse execute(HttpRequest req) throws UncheckedIOException {
    List<Map<String, Object>> value = new ArrayList<>();

    allSessions.getAllSessions().forEach(s -> value.add(
        ImmutableMap.of("id", s.getId().toString(), "capabilities", s.getCapabilities())));

    Map<String, Object> payloadObj = ImmutableMap.of(
        "status", SUCCESS,
        "value", value);

    // Write out a minimal W3C status response.
    byte[] payload = json.toJson(payloadObj).getBytes(UTF_8);

    return new HttpResponse().setStatus(HTTP_OK)
      .setHeader("Content-Type", JSON_UTF_8.toString())
      .setContent(bytes(payload));
  }
}
