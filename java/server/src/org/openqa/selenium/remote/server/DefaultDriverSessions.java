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

import static java.util.concurrent.TimeUnit.MILLISECONDS;

import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;
import com.google.common.cache.RemovalListener;
import com.google.common.collect.ImmutableSet;
import com.google.common.io.Files;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.io.TemporaryFilesystem;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.server.log.LoggingManager;
import org.openqa.selenium.remote.server.log.PerSessionLogHandler;

import java.util.Set;
import java.util.stream.Stream;

public class DefaultDriverSessions implements DriverSessions {

  private final DriverFactory factory;

  private final Cache<SessionId, Session> sessionIdToDriver;

  public DefaultDriverSessions(
      DriverFactory factory,
      long inactiveSessionTimeoutMs) {
    this.factory = factory;

    RemovalListener<SessionId, Session> listener = notification -> {
      Session session = notification.getValue();

      session.close();
      PerSessionLogHandler logHandler = LoggingManager.perSessionLogHandler();
      logHandler.transferThreadTempLogsToSessionLogs(session.getSessionId());
      logHandler.removeSessionLogs(session.getSessionId());
    };

    this.sessionIdToDriver = CacheBuilder.newBuilder()
        .removalListener(listener)
        .expireAfterAccess(inactiveSessionTimeoutMs, MILLISECONDS)
        .build();
  }

  @Override
  public void registerDriver(Capabilities capabilities, Class<? extends WebDriver> driverClass) {
    factory.registerDriverProvider(new DefaultDriverProvider(capabilities, driverClass));
  }

  @Override
  public SessionId newSession(Stream<Capabilities> desiredCapabilities) throws Exception {
    Session session = DefaultSession.createSession(
        factory,
        TemporaryFilesystem.getTmpFsBasedOn(Files.createTempDir()),
        desiredCapabilities.findFirst().orElseThrow(
            () -> new SessionNotCreatedException("Unable to determine capabilities for session")));

    sessionIdToDriver.put(session.getSessionId(), session);

    return session.getSessionId();
  }

  @Override
  public Session get(SessionId sessionId) {
    return sessionIdToDriver.getIfPresent(sessionId);
  }

  @Override
  public void deleteSession(SessionId sessionId) {
    sessionIdToDriver.invalidate(sessionId);
  }

  @Override
  public Set<SessionId> getSessions() {
    return ImmutableSet.copyOf(sessionIdToDriver.asMap().keySet());
  }
}
