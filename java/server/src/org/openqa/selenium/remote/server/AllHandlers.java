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

import com.google.common.annotations.VisibleForTesting;
import com.google.common.base.Splitter;
import com.google.common.base.Strings;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;

import org.openqa.selenium.remote.BeanToJsonConverter;
import org.openqa.selenium.remote.JsonToBeanConverter;
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

import java.lang.reflect.Constructor;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import javax.servlet.http.HttpServletRequest;


class AllHandlers {

  private final JsonToBeanConverter toBean;
  private final BeanToJsonConverter toJson;
  private final ActiveSessions allSessions;

  private final Map<HttpMethod, ImmutableList<Function<String, CommandHandler>>> additionalHandlers;

  public AllHandlers(ActiveSessions allSessions) {
    this.toBean = new JsonToBeanConverter();
    this.toJson = new BeanToJsonConverter();

    this.allSessions = allSessions;

    additionalHandlers = ImmutableMap.of(
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
        return new NoSessionHandler(toJson, id);
      }
      return session;
    }

    return new NoHandler(toJson);
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

      ImmutableSet.Builder<Object> args = ImmutableSet.builder();
      args.add(allSessions);
      args.add(toBean);
      args.add(toJson);
      if (match.getParameters().containsKey("sessionId")) {
        SessionId id = new SessionId(match.getParameters().get("sessionId"));
        args.add(id);
        ActiveSession session = allSessions.get(id);
        if (session != null) {
          args.add(session);
          args.add(session.getFileSystem());
        }
      }
      match.getParameters().entrySet().stream()
          .filter(e -> !"sessionId".equals(e.getKey()))
          .forEach(e -> args.add(e.getValue()));

      return create(handler, args.build());
    };
  }

  @VisibleForTesting
  <T extends CommandHandler> T create(Class<T> toCreate, Set<Object> args) {
    Constructor<?> constructor = Stream.of(toCreate.getDeclaredConstructors())
        .peek(c -> c.setAccessible(true))
        .sorted((l, r) -> r.getParameterCount() - l.getParameterCount())
        .filter(c ->
                    Stream.of(c.getParameters())
                        .map(p -> args.stream()
                            .anyMatch(arg -> p.getType().isAssignableFrom(arg.getClass())))
                        .reduce(Boolean::logicalAnd)
                        .orElse(true))
        .findFirst()
        .orElseThrow(() -> new IllegalArgumentException("Cannot find constructor to populate"));

    List<Object> parameters = Stream.of(constructor.getParameters())
        .map(p -> args.stream()
            .filter(arg -> p.getType().isAssignableFrom(arg.getClass()))
            .findFirst()
            .orElseThrow(() -> new IllegalArgumentException(
                "Cannot find match for " + p + " in " + toCreate)))
        .collect(Collectors.toList());

    try {
      Object[] objects = parameters.toArray();
      return (T) constructor.newInstance(objects);
    } catch (ReflectiveOperationException e) {
      throw new IllegalArgumentException("Cannot invoke constructor", e);
    }
  }
}
