/*
 Copyright 2011 Software Freedom Conservancy.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

package org.openqa.selenium.remote.server.testing;

import com.google.common.collect.Maps;

import org.jmock.Mockery;
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
  
  private final Mockery mockery;
  private final AtomicLong sessionKeyFactory = new AtomicLong(0);
  private final Map<SessionId, Session> sessionIdToDriver = Maps.newHashMap();

  public TestSessions(Mockery mockery) {
    this.mockery = mockery;
  }

  public SessionId newSession(Capabilities desiredCapabilities)
      throws Exception {
    SessionId sessionId = new SessionId(String.valueOf(
        sessionKeyFactory.getAndIncrement()));

    WebDriver driver = mockery.mock(WebDriver.class,
        "webdriver(" + sessionId + ")");

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
