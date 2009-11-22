/*
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.

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

package org.openqa.selenium.remote.server;

import org.openqa.selenium.remote.Capabilities;
import org.openqa.selenium.remote.SessionId;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class DriverSessions {

  private static Map<SessionId, Session> sessionIdToDriver =
      new ConcurrentHashMap<SessionId, Session>();

  public SessionId newSession(Capabilities desiredCapabilities) throws Exception {
    Session session = new Session(desiredCapabilities);
    
    SessionId sessionId = new SessionId(String.valueOf(System.currentTimeMillis()));
    sessionIdToDriver.put(sessionId, session);
    return sessionId;
  }
  
  public Session get(SessionId sessionId) {
    return sessionIdToDriver.get(sessionId);
  }

  public void deleteSession(SessionId sessionId) {
    sessionIdToDriver.remove(sessionId);
  }
}
