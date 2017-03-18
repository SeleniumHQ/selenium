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

package org.openqa.testing;

import static org.mockito.Mockito.mock;

import com.google.common.collect.Maps;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.server.DriverSessions;
import org.openqa.selenium.remote.server.Session;

import java.util.Collections;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.atomic.AtomicLong;

public class TestSessions implements DriverSessions {

  private final AtomicLong sessionKeyFactory = new AtomicLong(0);
  private final Map<SessionId, Session> sessionIdToDriver = Maps.newHashMap();

  public SessionId newSession(Capabilities desiredCapabilities)
      throws Exception {
    SessionId sessionId = new SessionId(String.valueOf(
        sessionKeyFactory.getAndIncrement()));

    WebDriver driver = mock(WebDriver.class, "webdriver(" + sessionId + ")");

    Session session = new TestSession(sessionId, driver, desiredCapabilities);
    sessionIdToDriver.put(sessionId, session);

    return sessionId;
  }

  public Session get(SessionId sessionId) {
    return sessionIdToDriver.get(sessionId);
  }

  public void deleteSession(SessionId sessionId) {
    Session session = sessionIdToDriver.remove(sessionId);
    if (session != null) {
      session.close();
    }
  }

  public void registerDriver(Capabilities capabilities,
      Class<? extends WebDriver> implementation) {
    throw new UnsupportedOperationException();
  }

  public Set<SessionId> getSessions() {
    return Collections.unmodifiableSet(sessionIdToDriver.keySet());
  }
}
