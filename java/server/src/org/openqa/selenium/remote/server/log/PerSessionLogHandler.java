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

import com.google.common.collect.ImmutableList;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.logging.LogEntries;
import org.openqa.selenium.logging.LogEntry;
import org.openqa.selenium.logging.LogType;
import org.openqa.selenium.logging.LoggingPreferences;
import org.openqa.selenium.logging.SessionLogs;
import org.openqa.selenium.remote.SessionId;

import java.io.IOException;
import java.io.StringWriter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.logging.Formatter;
import java.util.logging.Level;
import java.util.logging.LogRecord;

/**
 * RestishHandler which keeps in memory the log records per session so that users can retrieve logs
 * per session.
 */
public class PerSessionLogHandler extends java.util.logging.Handler {

  private final Map<SessionId, List<LogRecord>> perSessionRecords;

  private final Map<SessionId, Map<String, LogEntries>> perSessionDriverEntries;

  // Used to store log records that doesnt have associated session.
  // These records get mapped to session id once the session gets created
  // Useful for commands like: getNewBrowseSession() which doesnt have session
  // associated till the session gets created.
  private final Map<ThreadKey, List<LogRecord>> perThreadTempRecords;
  private final Formatter formatter;
  private Map<ThreadKey, SessionId> threadToSessionMap;
  private Map<SessionId, ThreadKey> sessionToThreadMap;
  private SessionLogsToFileRepository logFileRepository;
  private int capacity;
  private boolean storeLogsOnSessionQuit = false;

  private Level serverLogLevel = Level.INFO;

  /**
   * New handler keeping track of log records per session.
   *
   * @param capacity     The capacity
   * @param formatter    Formatter to use when retrieving log messages.
   * @param captureLogsOnQuit Whether to enable log capture on quit.
   */
  public PerSessionLogHandler(
    int capacity,
    Formatter formatter,
    boolean captureLogsOnQuit) {
    this.capacity = capacity;
    this.formatter = formatter;
    this.storeLogsOnSessionQuit = captureLogsOnQuit;
    this.perSessionRecords = new HashMap<>();
    this.perThreadTempRecords = new HashMap<>();
    this.threadToSessionMap = new HashMap<>();
    this.sessionToThreadMap = new HashMap<>();
    this.logFileRepository = new SessionLogsToFileRepository();
    this.perSessionDriverEntries = new HashMap<>();
  }


  public synchronized void attachToCurrentThread(SessionId sessionId) {
    ThreadKey threadId = new ThreadKey();
    if (threadToSessionMap.get(threadId) == null
        || threadToSessionMap.get(threadId).equals(sessionId)) {
      threadToSessionMap.put(threadId, sessionId);
      sessionToThreadMap.put(sessionId, threadId);
    }
    transferThreadTempLogsToSessionLogs(sessionId);
  }

  public void transferThreadTempLogsToSessionLogs(SessionId sessionId) {
    ThreadKey threadId = new ThreadKey();
    List<LogRecord> threadRecords = perThreadTempRecords.get(threadId);
    List<LogRecord> sessionRecords = perSessionRecords.get(sessionId);

    if (threadRecords != null) {
      if (sessionRecords == null) {
        sessionRecords = new ArrayList<>();
        perSessionRecords.put(sessionId, sessionRecords);
      }
      sessionRecords.addAll(threadRecords);
    }
    clearThreadTempLogs();
  }


  public synchronized void detachFromCurrentThread() {
    ThreadKey threadId = new ThreadKey();
    SessionId sessionId = threadToSessionMap.get(threadId);
    if (sessionId != null) {
      threadToSessionMap.remove(threadId);
      sessionToThreadMap.remove(sessionId);
      clearThreadTempLogs();
    }
  }

  /**
   * Removes session logs for the given session id.
   *
   * NB! If the handler has been configured to capture logs on quit no logs will be removed.
   *
   * @param sessionId The session id to use.
   */
  public synchronized void removeSessionLogs(SessionId sessionId) {
    if (storeLogsOnSessionQuit) {
      return;
    }
    ThreadKey threadId = sessionToThreadMap.get(sessionId);
    SessionId sessionIdForThread = threadToSessionMap.get(threadId);
    if (threadId != null && sessionIdForThread != null && sessionIdForThread.equals(sessionId)) {
      threadToSessionMap.remove(threadId);
      sessionToThreadMap.remove(sessionId);
    }
    perSessionRecords.remove(sessionId);
    logFileRepository.removeLogFile(sessionId);
  }

  /**
   * Clears the logging events attached to the thread.
   *
   * The logging is globally added to the jvm and is effectively used by both classic selenium and
   * WebDriver.
   *
   * WebDriver must call this to avoid leaking memory, even though it is not really used.
   *
   * Ideally we should probably attach the *request* somewhere we could pick it up, so we could
   * attach the pre-session logging to the request instead of the logging. Unfortunately this is no
   * small task.
   */
  public synchronized void clearThreadTempLogs() {
    ThreadKey threadId = new ThreadKey();
    perThreadTempRecords.remove(threadId);
  }


  /**
   * This returns Selenium Remote Control logs associated with the sessionId.
   *
   * @param sessionId session-id for which the RC logs will be returned.
   * @return String RC logs for the sessionId
   * @throws IOException when the elves go bad
   */
  public synchronized String getLog(SessionId sessionId) throws IOException {
    // TODO(chandra): Provide option to clear logs after getLog()
    String logs = formattedRecords(sessionId);
    logs = "\n<RC_Logs RC_Session_ID=" + sessionId + ">\n" + logs
           + "\n</RC_Logs>\n";
    return logs;
  }

  /**
   * Returns a list of session IDs for which there are logs.
   *
   * The type of logs that are available depends on the log types provided
   * by the driver. An included session id will at least have server logs.
   *
   * @return The list of session IDs.
   */
  public synchronized List<SessionId> getLoggedSessions() {
    // TODO: Find a solution that can handle large numbers of sessions, maybe by
    // reading them from disc.
    ImmutableList.Builder<SessionId> builder = new ImmutableList.Builder<>();
    builder.addAll(perSessionDriverEntries.keySet());
    return builder.build();
  }

  /**
   * Gets all logs for a session.
   *
   * @param sessionId The id of the session.
   * @return The logs for the session, ordered after log types in a session logs object.
   */
  public synchronized SessionLogs getAllLogsForSession(SessionId sessionId) {
    SessionLogs sessionLogs = new SessionLogs();
    if (perSessionDriverEntries.containsKey(sessionId)) {
      Map<String, LogEntries> typeToEntriesMap = perSessionDriverEntries.get(sessionId);
      for (String logType : typeToEntriesMap.keySet()) {
        sessionLogs.addLog(logType, typeToEntriesMap.get(logType));
      }
      perSessionDriverEntries.remove(sessionId);
    }
    return sessionLogs;
  }

  /**
   * Returns the server log for the given session id.
   *
   * @param sessionId The session id.
   * @return The available server log entries for the session.
   * @throws IOException If there was a problem reading from file.
   */
  public synchronized LogEntries getSessionLog(SessionId sessionId) throws IOException {
    List<LogEntry> entries = new ArrayList<>();
    for (LogRecord record : records(sessionId)) {
      if (record.getLevel().intValue() >= serverLogLevel.intValue())
        entries.add(new LogEntry(record.getLevel(), record.getMillis(), record.getMessage()));
    }
    return new LogEntries(entries);
  }

  /**
   * Fetches and stores available logs from the given session and driver.
   *
   *  @param sessionId The id of the session.
   *  @param driver The driver to get the logs from.
   *  @throws IOException If there was a problem reading from file.
   */
  public synchronized void fetchAndStoreLogsFromDriver(SessionId sessionId, WebDriver driver)
    throws IOException {
    if (!perSessionDriverEntries.containsKey(sessionId)) {
      perSessionDriverEntries.put(sessionId, new HashMap<>());
    }
    Map<String, LogEntries> typeToEntriesMap = perSessionDriverEntries.get(sessionId);
    if (storeLogsOnSessionQuit) {
      typeToEntriesMap.put(LogType.SERVER, getSessionLog(sessionId));
      Set<String> logTypeSet = driver.manage().logs().getAvailableLogTypes();
      for (String logType : logTypeSet) {
        typeToEntriesMap.put(logType, driver.manage().logs().get(logType));
      }
    }
  }

  /**
   * Configures logging using a logging preferences object.
   *
   * @param prefs The logging preferences object.
   */
  // TODO(simons): Of course, this effects all loggers, not just the one for the session.
  public void configureLogging(LoggingPreferences prefs) {
    if (prefs == null) {
      return;
    }
    if (prefs.getEnabledLogTypes().contains(LogType.SERVER)) {
      serverLogLevel = prefs.getLevel(LogType.SERVER);
    }
  }

  @Override
  synchronized public void publish(LogRecord record) {
    ThreadKey threadId = new ThreadKey();
    SessionId sessionId = threadToSessionMap.get(threadId);

    if (sessionId != null) {
      List<LogRecord> records = perSessionRecords.get(sessionId);
      if (records == null) {
        records = new ArrayList<>();
      }
      records.add(record);
      perSessionRecords.put(sessionId, records);

      if (records.size() > capacity) {
        perSessionRecords.put(sessionId, new ArrayList<>());
        // flush records to file;
        try {
          logFileRepository.flushRecordsToLogFile(sessionId, records);
          // clear in memory session records
          records.clear();
        } catch (IOException ex) {
          ex.printStackTrace();
        }
      }
    } else {
      perThreadTempRecords.computeIfAbsent(threadId, k -> new ArrayList<>()).add(record);
    }
  }

  @Override
  public void flush() {
    /* NOOP */
  }

  @Override
  public synchronized void close() throws SecurityException {
    perSessionRecords.clear();
    perThreadTempRecords.clear();
  }

  private LogRecord[] records(SessionId sessionId) throws IOException {
    List<LogRecord> logFileRecords = logFileRepository.getLogRecords(sessionId);
    List<LogRecord> records = perSessionRecords.remove(sessionId);
    if (records != null) {
      logFileRecords.addAll(records);
    }
    logFileRepository.removeLogFile(sessionId);
    return logFileRecords.toArray(new LogRecord[0]);
  }

  private String formattedRecords(SessionId sessionId) throws IOException {
    final StringWriter writer;

    writer = new StringWriter();
    for (LogRecord record : records(sessionId)) {
      writer.append(formatter.format(record));
    }
    return writer.toString();
  }

  protected static class ThreadKey {

    private final String name;
    private final Long id;

    ThreadKey() {
      this.name = Thread.currentThread().toString();
      this.id = Thread.currentThread().getId();
    }

    @Override
    public boolean equals(Object o) {
      if (this == o) {
        return true;
      }
      if (o == null || getClass() != o.getClass()) {
        return false;
      }

      ThreadKey threadKey = (ThreadKey) o;

      return Objects.equals(id, threadKey.id);

    }

    @Override
    public int hashCode() {
      return id != null ? id.hashCode() : 0;
    }

    @Override
    public String toString() {
      return "id" + id + "," + name;
    }
  }
}
