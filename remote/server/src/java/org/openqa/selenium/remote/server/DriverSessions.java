// Copyright 2008 Google Inc.  All Rights Reserved.

package org.openqa.selenium.remote.server;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.remote.SessionId;

import java.util.Set;

public interface DriverSessions {
  SessionId newSession(Capabilities desiredCapabilities) throws Exception;

  Session get(SessionId sessionId);

  void deleteSession(SessionId sessionId);

  void registerDriver(Capabilities capabilities, Class<? extends WebDriver> implementation);

  Set<SessionId> getSessions();

}
