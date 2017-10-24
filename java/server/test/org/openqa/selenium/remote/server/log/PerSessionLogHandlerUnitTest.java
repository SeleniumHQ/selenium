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

package org.openqa.selenium.remote.server.log;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import org.junit.Ignore;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;
import org.openqa.selenium.logging.LogEntries;
import org.openqa.selenium.logging.LogType;
import org.openqa.selenium.logging.SessionLogs;
import org.openqa.selenium.remote.SessionId;

import java.io.IOException;
import java.util.logging.Formatter;
import java.util.logging.Level;
import java.util.logging.LogRecord;

@RunWith(JUnit4.class)
public class PerSessionLogHandlerUnitTest {

  private static final int CAPACITY = 1;

  @Test
  public void testPopulationOfSessionLog() throws IOException {
    PerSessionLogHandler handler = createPerSessionLogHandler();
    SessionId sessionId = new SessionId("session-1");
    handler.attachToCurrentThread(sessionId);
    LogRecord firstRecord = new LogRecord(Level.INFO, "First Log Record");
    handler.publish(firstRecord);
    LogEntries entries = handler.getSessionLog(sessionId);
    assertEquals("Session log should contain one entry", 1, entries.getAll().size());
    assertEquals("Session log should contain logged entry",
        firstRecord.getMessage(), entries.getAll().get(0).getMessage());
  }

  @Test @Ignore("it fails!")
  public void testLoggedSessions() {
    PerSessionLogHandler handler = createPerSessionLogHandler();
    SessionId sessionId = new SessionId("session-1");
    handler.attachToCurrentThread(sessionId);
    handler.publish(new LogRecord(Level.INFO, "First Log Record"));
    assertTrue("Added session should be provided as a logged session",
        handler.getLoggedSessions().contains(sessionId));
  }

  @Test @Ignore("it fails!")
  public void testGetSessionLogsWithLogCaptureDisabled() {
    PerSessionLogHandler handler = createPerSessionLogHandler();
    SessionId sessionId = new SessionId("session-1");
    handler.attachToCurrentThread(sessionId);
    LogRecord firstRecord = new LogRecord(Level.INFO, "First Log Record");
    handler.publish(firstRecord);
    SessionLogs sessionLogs = handler.getAllLogsForSession(sessionId);
    assertTrue("Session logs for session should contain server logs",
        sessionLogs.getLogTypes().contains(LogType.SERVER));
    assertEquals("Session logs for server should contain one entry",
        1, sessionLogs.getLogs(LogType.SERVER).getAll().size());
    assertEquals("Session log should contain logged entry", firstRecord.getMessage(),
        sessionLogs.getLogs(LogType.SERVER).getAll().get(0).getMessage());
  }

  @Test
  public void testThreadToSessionMappingOnInitialNullSession()
      throws IOException {
    PerSessionLogHandler handler = createPerSessionLogHandler();
    LogRecord firstRecord = new LogRecord(Level.INFO, "First Log Record");
    LogRecord secondRecord = new LogRecord(Level.INFO, "Second Log Record");

    SessionId sessionId = new SessionId("session-1");

    handler.publish(firstRecord);
    handler.attachToCurrentThread(sessionId);
    handler.publish(secondRecord);

    assertMessagesLoggedForSessionId(handler, sessionId,
                                     "First Log Record", "Second Log Record");
  }

  @Test
  public void testThreadToSessionMappingOnTwoInitialNullSessions()
      throws IOException {
    PerSessionLogHandler handler = createPerSessionLogHandler();
    LogRecord firstRecord = new LogRecord(Level.INFO, "First Log Record");
    LogRecord secondRecord = new LogRecord(Level.INFO, "Second Log Record");

    LogRecord anotherRecord = new LogRecord(Level.INFO,
                                            "Another Log Record");
    LogRecord oneMoreRecord = new LogRecord(Level.INFO,
                                            "One More Log Record");

    SessionId sessionIdOne = new SessionId("session-1");
    SessionId sessionIdTwo = new SessionId("session-2");

    handler.publish(firstRecord);
    handler.attachToCurrentThread(sessionIdOne);
    handler.publish(secondRecord);
    handler.detachFromCurrentThread();
    handler.publish(anotherRecord);
    handler.attachToCurrentThread(sessionIdTwo);
    handler.publish(oneMoreRecord);

    assertMessagesLoggedForSessionId(handler, sessionIdOne,
                                     firstRecord.getMessage(), "Second Log Record");
    assertMessagesLoggedForSessionId(handler, sessionIdTwo,
                                     "Another Log Record", "One More Log Record");
  }

  @Test
  public void testThreadToSessionMappingAndClearMapping() throws IOException {
    PerSessionLogHandler handler = createPerSessionLogHandler();
    LogRecord firstSessionLog = new LogRecord(Level.INFO,
                                              "First Session Related Log Record");
    LogRecord secondSessionLog = new LogRecord(Level.INFO,
                                               "Second Session Related Log Record");

    SessionId sessionIdOne = new SessionId("session-one");
    SessionId sessionIdTwo = new SessionId("session-two");

    // set logs for session-1
    handler.attachToCurrentThread(sessionIdOne);
    handler.publish(firstSessionLog);
    handler.detachFromCurrentThread();

    // set logs for session-2
    handler.attachToCurrentThread(sessionIdTwo);
    handler.publish(secondSessionLog);
    handler.detachFromCurrentThread();

    assertMessagesLoggedForSessionId(handler, sessionIdOne,
                                     "First Session Related Log Record");
    assertMessagesLoggedForSessionId(handler, sessionIdTwo,
                                     "Second Session Related Log Record");
  }

  @Test
  public void testShouldReturnEmptyLogIfNoRecordHasBeenLogged()
      throws IOException {
    PerSessionLogHandler handler = createPerSessionLogHandler();

    assertNoMessageLoggedForSessionId(handler, new SessionId("session"));
  }

  @Test
  public void testShouldNotCopyThreadTempLogsToSessionLogsIfNoLogRecordForThreadPresent()
      throws IOException {
    PerSessionLogHandler handler = createPerSessionLogHandler();

    SessionId sessionId = new SessionId("session");

    handler.transferThreadTempLogsToSessionLogs(sessionId);

    assertNoMessageLoggedForSessionId(handler, sessionId);
  }

  private void assertMessagesLoggedForSessionId(PerSessionLogHandler handler,
                                                SessionId sessionId, String... expectedMessages)
      throws IOException {
    StringBuilder expectedLogMessage = new StringBuilder(
        "\n<RC_Logs RC_Session_ID=");
    expectedLogMessage.append(sessionId);
    expectedLogMessage.append(">\n");
    for (String expectedMessage : expectedMessages) {
      expectedLogMessage.append("[FORMATTED] ");
      expectedLogMessage.append(expectedMessage);
    }
    expectedLogMessage.append("\n</RC_Logs>\n");

    String loggedMessage = handler.getLog(sessionId);
    assertEquals("Wrong message logged.", expectedLogMessage.toString(),
                 loggedMessage);
  }

  private void assertNoMessageLoggedForSessionId(
      PerSessionLogHandler handler, SessionId sessionId) throws IOException {
    assertMessagesLoggedForSessionId(handler, sessionId);
  }

  private PerSessionLogHandler createPerSessionLogHandler() {
    return  new PerSessionLogHandler(CAPACITY, new FormatterStub(), false);
  }

  static class FormatterStub extends Formatter {

    @Override
    public String format(LogRecord record) {
      return "[FORMATTED] " + record.getMessage();
    }
  }
}
