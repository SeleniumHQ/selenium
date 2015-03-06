package org.openqa.selenium.remote.server.log;

/*
Copyright 2007-2011 Selenium committers

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

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.logging.LogEntries;
import org.openqa.selenium.logging.LoggingPreferences;
import org.openqa.selenium.logging.SessionLogs;
import org.openqa.selenium.remote.SessionId;

import java.io.IOException;
import java.util.List;
import java.util.logging.LogRecord;

/**
 * @author Kristian Rosenvold
 */
public abstract class PerSessionLogHandler extends java.util.logging.Handler {

  public abstract void attachToCurrentThread(SessionId sessionId);

  public abstract void transferThreadTempLogsToSessionLogs(SessionId sessionId);

  public abstract void detachFromCurrentThread();

  public abstract void removeSessionLogs(SessionId sessionId);

  public abstract void clearThreadTempLogs();

  public abstract String getLog(SessionId sessionId) throws IOException;

  public abstract List<SessionId> getLoggedSessions();

  public abstract SessionLogs getAllLogsForSession(SessionId sessionId);

  public abstract LogEntries getSessionLog(SessionId sessionId) throws IOException;

  public abstract void fetchAndStoreLogsFromDriver(SessionId sessionId, WebDriver driver) 
      throws IOException;

  public abstract void configureLogging(LoggingPreferences loggingPrefs);
  
  @Override
  public abstract void publish(LogRecord record);
}
