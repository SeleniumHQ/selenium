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

import static com.google.common.net.MediaType.JSON_UTF_8;
import static java.net.HttpURLConnection.HTTP_NOT_FOUND;
import static java.net.HttpURLConnection.HTTP_OK;
import static java.nio.charset.StandardCharsets.UTF_8;
import static org.openqa.selenium.remote.ErrorCodes.NO_SUCH_SESSION;
import static org.openqa.selenium.remote.ErrorCodes.SUCCESS;
import static org.openqa.selenium.remote.ErrorCodes.UNKNOWN_COMMAND;

import com.google.common.annotations.VisibleForTesting;
import com.google.common.base.Splitter;
import com.google.common.base.Strings;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import org.openqa.selenium.internal.BuildInfo;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.HttpMethod;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.server.commandhandler.GetLogTypes;

import java.io.IOException;
import java.lang.reflect.Constructor;
import java.util.Collections;
import java.util.HashMap;
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

  private final static Gson GSON = new GsonBuilder().setLenient().serializeNulls().create();
  private final ActiveSessions allSessions;

  private final Map<HttpMethod, ImmutableList<Function<String, CommandHandler>>> additionalHandlers;

  public AllHandlers(ActiveSessions allSessions) {
    this.allSessions = allSessions;

    additionalHandlers = ImmutableMap.of(
        HttpMethod.DELETE, ImmutableList.of(),
        HttpMethod.GET, ImmutableList.of(
            handler("/session/{sessionId}/log/types", GetLogTypes.class),
            handler("/status", StatusHandler.class)
        ),
        HttpMethod.POST, ImmutableList.of(
            handler("/session", BeginSession.class)
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
        return new NoSessionHandler(id);
      }
      return session;
    }

    return new NoHandler();
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
      args.add(GSON);
      if (match.getParameters().containsKey("sessionId")) {
        SessionId id = new SessionId(match.getParameters().get("sessionId"));
        args.add(id);
        ActiveSession session = allSessions.get(id);
        if (session != null) {
          args.add(session);
        }
      }
      match.getParameters().entrySet().stream()
          .filter(e -> !"sessionId".equals(e.getKey()))
          .forEach(e -> args.add(e.getValue()));

      return create(handler, args.build());
    };
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
      resp.setHeader("Content-Type", JSON_UTF_8.toString());
      resp.setHeader("Content-Length", String.valueOf(payload.length));

      resp.setContent(payload);
    }
  }

  private static class NoSessionHandler implements CommandHandler {

    private final SessionId sessionId;

    public NoSessionHandler(SessionId sessionId) {
      this.sessionId = sessionId;
    }

    @Override
    public void execute(HttpRequest req, HttpResponse resp) throws IOException {
      // We're not using ImmutableMap for the outer map because it disallows null values.
      Map<String, Object> responseMap = new HashMap<>();
      responseMap.put("sessionId", sessionId.toString());
      responseMap.put("status", NO_SUCH_SESSION);
      responseMap.put("value", ImmutableMap.of(
          "error", "invalid session id",
          "message", String.format("No active session with ID %s", sessionId),
          "stacktrace", ""));
      responseMap = Collections.unmodifiableMap(responseMap);

      byte[] payload = new GsonBuilder().serializeNulls().create().toJson(responseMap)
          .getBytes(UTF_8);

      resp.setStatus(HTTP_NOT_FOUND);
      resp.setHeader("Content-Type", JSON_UTF_8.toString());
      resp.setHeader("Content-Length", String.valueOf(payload.length));

      resp.setContent(payload);
    }
  }

  private static class StatusHandler implements CommandHandler {

    @Override
    public void execute(HttpRequest req, HttpResponse resp) throws IOException {
      ImmutableMap.Builder<String, Object> value = ImmutableMap.builder();

      // W3C spec
      value.put("ready", true);
      value.put("message", "Server is running");

      // And now more information
      BuildInfo buildInfo = new BuildInfo();
      value.put("build", ImmutableMap.of(
          // We need to fix the BuildInfo to properly fill out these values.
//          "revision", buildInfo.getBuildRevision(),
//          "time", buildInfo.getBuildTime(),
          "version", buildInfo.getReleaseLabel()));

      value.put("os", ImmutableMap.of(
          "arch", System.getProperty("os.arch"),
          "name", System.getProperty("os.name"),
          "version", System.getProperty("os.version")));

      value.put("java", ImmutableMap.of("version", System.getProperty("java.version")));

      Map<String, Object> payloadObj = ImmutableMap.of(
          "status", SUCCESS,
          "value", value.build());

      // Write out a minimal W3C status response.
      byte[] payload = new GsonBuilder()
          .serializeNulls()
          .create()
          .toJson(payloadObj).getBytes(UTF_8);

      resp.setStatus(HTTP_OK);
      resp.setHeader("Content-Type", JSON_UTF_8.toString());
      resp.setHeader("Content-Length", String.valueOf(payload.length));

      resp.setContent(payload);
    }
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
