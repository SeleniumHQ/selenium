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

package org.openqa.selenium.remote.server.scheduler;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.io.TemporaryFilesystem;
import org.openqa.selenium.remote.Dialect;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.server.ActiveSession;
import org.openqa.selenium.remote.server.SessionFactory;

import java.io.IOException;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.logging.Logger;

class ScheduledSessionFactory implements SessionFactory {

  private final static Logger LOG = Logger.getLogger(SessionFactory.class.getName());

  private final SessionFactory delegate;
  private volatile boolean available = true;
  private volatile long lastUsed = 0;
  private volatile Optional<ActiveSession> currentSession;

  ScheduledSessionFactory(SessionFactory delegate) {
    this.delegate = Objects.requireNonNull(delegate, "Actual session factory cannot be null");
    this.currentSession = Optional.empty();
  }

  @Override
  public boolean isSupporting(Capabilities capabilities) {
    return delegate.isSupporting(capabilities);
  }

  @Override
  public Optional<ActiveSession> apply(Set<Dialect> downstreamDialects, Capabilities capabilities) {
    lastUsed = System.currentTimeMillis();
    available = false;
    currentSession = delegate.apply(downstreamDialects, capabilities).map(ScheduledSession::new);
    return currentSession;
  }

  public boolean isAvailable() {
    return available;
  }

  void setAvailable(boolean isAvailable) {
    this.available = isAvailable;
  }

  public long getLastSessionCreated() {
    return lastUsed;
  }

  public void killSession() {
    try {
      if (currentSession.isPresent()) {
        ActiveSession session = currentSession.get();
        if (session.isActive()) {
          LOG.info("Killing session: " + session.getId());
          session.stop();
        }
      }
    } catch (Exception ignored) {
      // Nothing sane to do.
    } finally {
      currentSession = Optional.empty();
    }
  }

  /**
   * Equality is based on the underlying {@link SessionFactory} and nothing else.
   */
  @Override
  public boolean equals(Object o) {
    if (!(o instanceof ScheduledSessionFactory)) {
      return false;
    }

    ScheduledSessionFactory that = (ScheduledSessionFactory) o;
    return Objects.equals(this.delegate, that.delegate);
  }

  @Override
  public int hashCode() {
    return Objects.hash(delegate);
  }

  private class ScheduledSession implements ActiveSession {

    @Override
    public SessionId getId() {
      return delegate.getId();
    }

    @Override
    public Dialect getUpstreamDialect() {
      return delegate.getUpstreamDialect();
    }

    @Override
    public Dialect getDownstreamDialect() {
      return delegate.getDownstreamDialect();
    }

    @Override
    public Map<String, Object> getCapabilities() {
      return delegate.getCapabilities();
    }

    @Override
    public TemporaryFilesystem getFileSystem() {
      return delegate.getFileSystem();
    }

    @Override
    public void stop() {
      try {
        delegate.stop();
      } finally {
        available = true;
        currentSession = Optional.empty();
        lastUsed = System.currentTimeMillis();
      }
    }

    @Override
    public boolean isActive() {
      return delegate.isActive();
    }

    @Override
    public void execute(HttpRequest req, HttpResponse resp) throws IOException {
      delegate.execute(req, resp);
    }

    @Override
    public WebDriver getWrappedDriver() {
      return delegate.getWrappedDriver();
    }

    private final ActiveSession delegate;

    private ScheduledSession(ActiveSession delegate) {
      this.delegate = delegate;
    }
  }
}
