/*
Copyright 2012 Selenium committers
Copyright 2012 Software Freedom Conservancy

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

package org.openqa.selenium.remote.server.log;

import com.google.common.collect.ImmutableList;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.logging.LogEntries;
import org.openqa.selenium.logging.LogEntry;
import org.openqa.selenium.logging.LoggingPreferences;
import org.openqa.selenium.logging.SessionLogs;
import org.openqa.selenium.remote.SessionId;

import java.util.logging.LogRecord;

/**
 * @author Kristian Rosenvold
 */
public class NoOpSessionLogHandler extends PerSessionLogHandler {

  @Override
  public void attachToCurrentThread(SessionId sessionId) {
  }

  @Override
  public void transferThreadTempLogsToSessionLogs(SessionId sessionId) {
  }

  @Override
  public void detachFromCurrentThread() {
  }

  @Override
  public void removeSessionLogs(SessionId sessionId) {
  }

  @Override
  public void clearThreadTempLogs() {
  }

  @Override
  public String getLog(SessionId sessionId) {
    return null;
  }

  @Override
  public void publish(LogRecord record) {
  }

  @Override
  public void flush() {
  }

  @Override
  public void close() throws SecurityException {
  }

  @Override
  public LogEntries getSessionLog(SessionId sessionId) {
    return new LogEntries(ImmutableList.<LogEntry>of());
  }
  
  @Override
  public ImmutableList<SessionId> getLoggedSessions() {
    return ImmutableList.<SessionId>of();
  }

  @Override
  public SessionLogs getAllLogsForSession(SessionId sessionId) {
    return new SessionLogs();
  }

  @Override
  public void fetchAndStoreLogsFromDriver(SessionId sessionId, WebDriver driver) {
  }
  
  @Override
  public void configureLogging(LoggingPreferences prefs) {    
  }
}
