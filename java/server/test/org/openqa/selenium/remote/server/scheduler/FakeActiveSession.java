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

import static org.openqa.selenium.remote.Dialect.OSS;

import com.google.common.collect.Iterators;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.NoSuchSessionException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.io.TemporaryFilesystem;
import org.openqa.selenium.remote.Dialect;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.server.ActiveSession;
import org.openqa.selenium.remote.server.ActiveSessionCommandExecutor;

import java.util.Map;
import java.util.Set;
import java.util.concurrent.atomic.AtomicInteger;

class FakeActiveSession implements ActiveSession {

  private static final AtomicInteger counter = new AtomicInteger(1);

  private final SessionId id = new SessionId("session" + counter.getAndIncrement());
  private final Dialect downstream;
  private final Capabilities caps;
  private boolean active;

  FakeActiveSession(Set<Dialect> downstreams, Capabilities caps) {
    this.downstream = Iterators.getNext(downstreams.iterator(), OSS);
    this.caps = caps;
    this.active = true;
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
    return downstream;
  }

  @SuppressWarnings("unchecked")
  @Override
  public Map<String, Object> getCapabilities() {
    return (Map<String, Object>) caps.asMap();
  }

  @Override
  public TemporaryFilesystem getFileSystem() {
    throw new UnsupportedOperationException("getFileSystem");
  }

  @Override
  public void stop() {
    active = false;
  }

  @Override
  public boolean isActive() {
    return active;
  }

  @Override
  public WebDriver getWrappedDriver() {
    if (!isActive()) {
      throw new NoSuchSessionException("Session has been stopped: " + getId());
    }
    return new RemoteWebDriver(new ActiveSessionCommandExecutor(this), caps);
  }

  @Override
  public void execute(HttpRequest req, HttpResponse resp) {
    if (!isActive()) {
      throw new NoSuchSessionException("Session has been stopped: " + getId());
    }
    resp.setStatus(0);
  }
}
