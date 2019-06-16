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

import com.google.common.base.Splitter;
import com.google.common.base.Strings;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;
import org.openqa.selenium.grid.session.ActiveSession;
import org.openqa.selenium.grid.web.NoHandler;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpMethod;
import org.openqa.selenium.remote.http.UrlTemplate;
import org.openqa.selenium.remote.server.commandhandler.BeginSession;
import org.openqa.selenium.remote.server.commandhandler.GetAllSessions;
import org.openqa.selenium.remote.server.commandhandler.GetLogTypes;
import org.openqa.selenium.remote.server.commandhandler.GetLogsOfType;
import org.openqa.selenium.remote.server.commandhandler.NoSessionHandler;
import org.openqa.selenium.remote.server.commandhandler.Status;
import org.openqa.selenium.remote.server.commandhandler.UploadFile;

import javax.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.function.Function;


class AllHandlers {

  private final Json json;
  private final ActiveSessions allSessions;

  private final Map<HttpMethod, ImmutableList<Function<String, HttpHandler>>> additionalHandlers;

  public AllHandlers(NewSessionPipeline pipeline, ActiveSessions allSessions) {
    this.allSessions = Objects.requireNonNull(allSessions);
    this.json = new Json();

    this.additionalHandlers = ImmutableMap.of(
        HttpMethod.DELETE, ImmutableList.of(),
        HttpMethod.GET, ImmutableList.of(
            handler("/session/{sessionId}/log/types",
                    params -> new GetLogTypes(json, allSessions.get(new SessionId(params.get("sessionId"))))),
            handler("/sessions", params -> new GetAllSessions(allSessions, json)),
            handler("/status", params -> new Status(json))
        ),
        HttpMethod.POST, ImmutableList.of(
            handler("/session", params -> new BeginSession(pipeline, allSessions, json)),
            handler("/session/{sessionId}/file",
                    params -> new UploadFile(json, allSessions.get(new SessionId(params.get("sessionId"))))),
            handler("/session/{sessionId}/log",
                    params -> new GetLogsOfType(json, allSessions.get(new SessionId(params.get("sessionId"))))),
            handler("/session/{sessionId}/se/file",
                    params -> new UploadFile(json, allSessions.get(new SessionId(params.get("sessionId")))))
        ));
  }

  public HttpHandler match(HttpServletRequest req) {
    String path = Strings.isNullOrEmpty(req.getPathInfo()) ? "/" : req.getPathInfo();

    Optional<? extends HttpHandler> additionalHandler = additionalHandlers.get(HttpMethod.valueOf(req.getMethod()))
        .stream()
        .map(bundle -> bundle.apply(req.getPathInfo()))
        .filter(Objects::nonNull)
        .findFirst();

    if (additionalHandler.isPresent()) {
      return additionalHandler.get();
    }

    // All commands that take a session id expect that as the path fragment immediately after "/session".
    SessionId id = null;
    List<String> fragments = Splitter.on('/').limit(4).splitToList(path);
    if (fragments.size() > 2) {
      if ("session".equals(fragments.get(1))) {
        id = new SessionId(fragments.get(2));
      }
    }

    if (id != null) {
      ActiveSession session = allSessions.get(id);
      if (session == null) {
        return new NoSessionHandler(json, id);
      }
      return session;
    }

    return new NoHandler(json);
  }

  private <H extends HttpHandler> Function<String, HttpHandler> handler(
      String template,
      Function<Map<String, String>, H> handlerGenerator) {
    UrlTemplate urlTemplate = new UrlTemplate(template);
    return path -> {
      UrlTemplate.Match match = urlTemplate.match(path);
      if (match == null) {
        return null;
      }
      return handlerGenerator.apply(match.getParameters());
    };
  }
}
