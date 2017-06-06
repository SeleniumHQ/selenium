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

import static java.nio.charset.StandardCharsets.UTF_8;
import static org.openqa.selenium.remote.Dialect.OSS;

import com.google.common.base.Preconditions;
import com.google.common.collect.Iterables;
import com.google.common.io.CharStreams;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.remote.Dialect;
import org.openqa.selenium.remote.JsonToBeanConverter;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

import java.io.BufferedReader;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.logging.Logger;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;


/**
 * Wraps an existing {@link org.openqa.selenium.WebDriver} instance and provides it with the OSS
 * wire protocol remote end points.
 */
class InMemorySession implements ActiveSession {

  private final SessionId id;
  private final Session session;
  private JsonHttpCommandHandler commandHandler;
  private Dialect downstreamDialect;

  public InMemorySession(
      SessionId id,
      Session session,
      JsonHttpCommandHandler commandHandler,
      Dialect downstreamDialect) {
    this.id = id;
    this.session = session;
    this.commandHandler = commandHandler;
    this.downstreamDialect = downstreamDialect;
  }

  @Override
  public SessionId getId() {
    return id;
  }

  @Override
  public Dialect getUpstreamDialect() {
    return OSS;
  }

  @Override
  public Dialect getDownstreamDialect() {
    return downstreamDialect;
  }

  @Override
  public Map<String, Object> getCapabilities() {
    return session.getCapabilities().asMap().entrySet().stream()
        .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));
  }

  @Override
  public void stop() {
    session.close();
  }

  @Override
  public void execute(HttpRequest req, HttpResponse resp) throws IOException {
    commandHandler.handleRequest(req, resp);
  }

  public static class Factory implements SessionFactory {

    private final DriverSessions legacySessions;
    private final JsonHttpCommandHandler jsonHttpCommandHandler;

    public Factory(DriverSessions legacySessions) {
      this.legacySessions = Preconditions.checkNotNull(legacySessions);
      jsonHttpCommandHandler = new JsonHttpCommandHandler(
          legacySessions,
          Logger.getLogger(InMemorySession.class.getName()));
    }

    @Override
    public ActiveSession apply(Path path, Set<Dialect> downstreamDialects) {
      try (BufferedReader reader = Files.newBufferedReader(path, UTF_8)) {
        Map<?, ?> blob = new JsonToBeanConverter().convert(Map.class, CharStreams.toString(reader));

        Map<String, ?> rawCaps = (Map<String, ?>) blob.get("desiredCapabilities");
        if (rawCaps == null) {
          rawCaps = new HashMap<>();
        }
        Capabilities caps = new ImmutableCapabilities(rawCaps);

        SessionId sessionId = legacySessions.newSession(caps);
        Session session = legacySessions.get(sessionId);

        // Force OSS dialect if downstream speaks it
        Dialect downstream = downstreamDialects.contains(OSS) ?
                             OSS :
                             Iterables.getFirst(downstreamDialects, null);

        return new InMemorySession(sessionId, session, jsonHttpCommandHandler, downstream);
      } catch (Exception e) {
        throw new SessionNotCreatedException("Unable to create session", e);
      }
    }
  }
}
