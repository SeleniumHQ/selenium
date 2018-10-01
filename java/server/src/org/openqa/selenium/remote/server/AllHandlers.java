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
import org.openqa.selenium.grid.web.CommandHandler;
import org.openqa.selenium.grid.web.UrlTemplate;
import org.openqa.selenium.injector.Injector;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.HttpMethod;
import org.openqa.selenium.remote.server.commandhandler.BeginSession;
import org.openqa.selenium.remote.server.commandhandler.GetAllSessions;
import org.openqa.selenium.remote.server.commandhandler.GetLogTypes;
import org.openqa.selenium.remote.server.commandhandler.GetLogsOfType;
import org.openqa.selenium.remote.server.commandhandler.NoHandler;
import org.openqa.selenium.remote.server.commandhandler.NoSessionHandler;
import org.openqa.selenium.remote.server.commandhandler.Status;
import org.openqa.selenium.remote.server.commandhandler.UploadFile;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.function.Function;

import javax.servlet.http.HttpServletRequest;


class AllHandlers {

  private final Json json;
  private final ActiveSessions allSessions;
  private final Injector parentInjector;

  private final Map<HttpMethod, ImmutableList<Function<String, CommandHandler>>> additionalHandlers;

  public AllHandlers(NewSessionPipeline pipeline, ActiveSessions allSessions) {
    this.allSessions = Objects.requireNonNull(allSessions);
    this.json = new Json();

    this.parentInjector = Injector.builder()
        .register(json)
        .register(allSessions)
        .register(pipeline)
        .build();

    this.additionalHandlers = ImmutableMap.of(
        HttpMethod.DELETE, ImmutableList.of(),
        HttpMethod.GET, ImmutableList.of(
            handler("/session/{sessionId}/log/types", GetLogTypes.class),
            handler("/sessions", GetAllSessions.class),
            handler("/status", Status.class)
        ),
        HttpMethod.POST, ImmutableList.of(
            handler("/session", BeginSession.class),
            handler("/session/{sessionId}/file", UploadFile.class),
            handler("/session/{sessionId}/log", GetLogsOfType.class),
            handler("/session/{sessionId}/se/file", UploadFile.class)
        ));
  }

  public CommandHandler match(HttpServletRequest req) {
    String path = Strings.isNullOrEmpty(req.getPathInfo()) ? "/" : req.getPathInfo();

    Optional<? extends CommandHandler> additionalHandler = additionalHandlers.get(HttpMethod.valueOf(req.getMethod()))
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

  private <H extends CommandHandler> Function<String, CommandHandler> handler(
      String template,
      Class<H> handler) {
    UrlTemplate urlTemplate = new UrlTemplate(template);
    return path -> {
      UrlTemplate.Match match = urlTemplate.match(path);
      if (match == null) {
        return null;
      }

      Injector.Builder child = Injector.builder().parent(parentInjector);
      if (match.getParameters().containsKey("sessionId")) {
        SessionId id = new SessionId(match.getParameters().get("sessionId"));
        child.register(id);
        ActiveSession session = allSessions.get(id);
        if (session != null) {
          child.register(session);
          child.register(session.getFileSystem());
        }
      }
      match.getParameters().entrySet().stream()
          .filter(e -> !"sessionId".equals(e.getKey()))
          .forEach(e -> child.register(e.getValue()));

      return child.build().newInstance(handler);
    };
  }
}
