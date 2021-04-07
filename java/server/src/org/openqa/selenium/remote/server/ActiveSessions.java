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

import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;
import com.google.common.cache.RemovalListener;

import org.openqa.selenium.grid.session.ActiveSession;
import org.openqa.selenium.io.TemporaryFilesystem;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.server.log.LoggingManager;
import org.openqa.selenium.remote.server.log.PerSessionLogHandler;

import java.util.Collection;
import java.util.LinkedList;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * All current {@link ActiveSession}s that we're aware of.
 */
public class ActiveSessions {
  private static final Logger LOG = Logger.getLogger(ActiveSessions.class.getName());

  private final Cache<SessionId, ActiveSession> allSessions;
  private final List<ActiveSessionListener> listeners = new LinkedList<>();

  public ActiveSessions(long inactiveSessionTimeout, TimeUnit unit) {
    RemovalListener<SessionId, ActiveSession> listener = notification -> {
      ActiveSession session = notification.getValue();
      listeners.forEach(l -> {
        try {
          l.onStop(session);
        } catch (Exception e) {
          LOG.log(Level.WARNING, "Caught exception closing session: " + session.getId(), e);
        }
      });
      session.stop();
    };

    allSessions = CacheBuilder.newBuilder()
        .expireAfterAccess(inactiveSessionTimeout, unit)
        .removalListener(listener)
        .build();

    addListener(new ActiveSessionListener() {
      @Override
      public void onStop(ActiveSession session) {
        LOG.info(String.format("Removing session %s", session));
      }
    });

    addListener(new ActiveSessionListener() {
      @Override
      public void onStop(ActiveSession session) {
        PerSessionLogHandler logHandler = LoggingManager.perSessionLogHandler();
        logHandler.transferThreadTempLogsToSessionLogs(session.getId());
        logHandler.removeSessionLogs(session.getId());
      }
    });

    addListener(new ActiveSessionListener() {
      @Override
      public void onStop(ActiveSession session) {
        TemporaryFilesystem filesystem = session.getFileSystem();
        filesystem.deleteTemporaryFiles();
        filesystem.deleteBaseDir();
      }
    });
  }

  public void put(ActiveSession session) {
    allSessions.put(session.getId(), session);
  }

  public ActiveSession get(SessionId id) {
    ActiveSession session = allSessions.getIfPresent(id);
    if (session != null) {
      listeners.forEach(l -> l.onAccess(session));
    }
    return session;
  }

  public void invalidate(SessionId id) {
    allSessions.invalidate(id);
  }

  public Collection<ActiveSession> getAllSessions() {
    return allSessions.asMap().values();
  }

  public void cleanUp() {
    allSessions.cleanUp();
  }

  public void addListener(ActiveSessionListener listener) {
    listeners.add(listener);
  }

  public void removeListener(ActiveSessionListener listener) {
    listeners.remove(listener);
  }

  @Override
  public String toString() {
    return allSessions.asMap().toString();
  }
}
