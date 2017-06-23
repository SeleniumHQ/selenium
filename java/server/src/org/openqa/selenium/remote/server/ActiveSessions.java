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

import static java.util.concurrent.TimeUnit.MINUTES;

import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;
import com.google.common.cache.RemovalListener;

import org.openqa.selenium.remote.SessionId;

import java.util.concurrent.TimeUnit;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * All current {@link ActiveSession}s that we're aware of.
 */
class ActiveSessions {
  private final static Logger LOG = Logger.getLogger(ActiveSessions.class.getName());

  private final Cache<SessionId, ActiveSession> allSessions;

  public ActiveSessions(long inactiveSessionTimeout, TimeUnit unit) {
    RemovalListener<SessionId, ActiveSession> listener = notification -> {
      log("Removing session %s: %s", notification.getKey(), notification.getCause());
      ActiveSession session = notification.getValue();
      session.stop();
    };

    allSessions = CacheBuilder.newBuilder()
        .expireAfterAccess(10, MINUTES)
        .removalListener(listener)
        .build();
  }

  public void put(ActiveSession session) {
    allSessions.put(session.getId(), session);
  }

  public ActiveSession get(SessionId id) {
    return allSessions.getIfPresent(id);
  }

  public void invalidate(SessionId id) {
    allSessions.invalidate(id);
  }

  @Override
  public String toString() {
    return allSessions.asMap().toString();
  }

  private void log(String message, Object... args) {
    LOG.info(String.format(message, args));
  }

  private void log(Throwable throwable, String message, Object... args) {
    LOG.log(Level.WARNING, String.format(message, args), throwable);
  }
}
