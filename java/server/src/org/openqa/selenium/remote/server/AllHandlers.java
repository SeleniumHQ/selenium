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

package org.openqa.selenium.remote.server;

import static com.google.common.net.MediaType.JAVASCRIPT_UTF_8;
import static java.net.HttpURLConnection.HTTP_NOT_FOUND;
import static java.net.HttpURLConnection.HTTP_OK;
import static java.nio.charset.StandardCharsets.UTF_8;
import static org.openqa.selenium.remote.ErrorCodes.UNKNOWN_COMMAND;

import com.google.common.base.Splitter;
import com.google.common.base.Strings;
import com.google.common.cache.Cache;
import com.google.common.collect.ImmutableMap;
import com.google.gson.GsonBuilder;

import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

import java.io.IOException;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;


class AllHandlers {

  private final Cache<SessionId, ActiveSession> allSessions;
  private final DriverSessions legacySessions;

  public AllHandlers(Cache<SessionId, ActiveSession> allSessions, DriverSessions legacySessions) {
    this.allSessions = allSessions;
    this.legacySessions = legacySessions;
  }

  public CommandHandler match(HttpServletRequest req) {
    String path = Strings.isNullOrEmpty(req.getPathInfo()) ? "/" : req.getPathInfo();

    // All commands that take a session id expect that as the path fragment immediately after "/session".
    SessionId id = null;
    List<String> fragments = Splitter.on('/').limit(4).splitToList(path);
    if (fragments.size() > 2) {
      if ("session".equals(fragments.get(1))) {
        id = new SessionId(fragments.get(2));
      }
    }

    if (id != null) {
      ActiveSession session = allSessions.getIfPresent(id);
      if (session != null) {
        return session;
      }
    }

    if ("POST".equalsIgnoreCase(req.getMethod()) && "/session".equals(path)) {
      return new BeginSession(allSessions, legacySessions);
    }

    if ("GET".equalsIgnoreCase(req.getMethod()) && "/status".equals(path)) {
      return new StatusHandler();
    }

    return new NoHandler();
  }

  private static class NoHandler implements CommandHandler {

    @Override
    public void execute(HttpRequest req, HttpResponse resp) throws IOException {
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

      byte[] payload = new GsonBuilder().serializeNulls().create().toJson(responseMap)
          .getBytes(UTF_8);

      resp.setStatus(HTTP_NOT_FOUND);
      resp.setHeader("Content-Type", JAVASCRIPT_UTF_8.toString());
      resp.setHeader("Content-Length", String.valueOf(payload.length));

      resp.setContent(payload);
    }
  }

  private static class StatusHandler implements CommandHandler {

    @Override
    public void execute(HttpRequest req, HttpResponse resp) throws IOException {
      // Write out a minimal W3C status response.
      byte[] payload = new GsonBuilder().create().toJson(ImmutableMap.of(
          "ready", true,
          "message", "Server is running"
      )).getBytes(UTF_8);

      resp.setStatus(HTTP_OK);
      resp.setHeader("Content-Type", JAVASCRIPT_UTF_8.toString());
      resp.setHeader("Content-Length", String.valueOf(payload.length));

      resp.setContent(payload);
    }
  }
}
