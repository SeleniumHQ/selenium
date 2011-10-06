package org.openqa.selenium.server.log;
/*
Copyright 2007-2011 WebDriver committers
Copyright 2007-2011 Google Inc.

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
import java.io.IOException;
import java.io.StringWriter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Formatter;
import java.util.logging.Level;
import java.util.logging.LogRecord;

/**
 * Handler which keeps in memory the log records per session so that users can retrieve logs per
 * session.
 */
public class DefaultPerSessionLogHandler extends PerSessionLogHandler {

  private final Map<String, List<LogRecord>> perSessionRecords;

  // Used to store log records that doesnt have associated session.
  // These records get mapped to session id once the session gets created
  // Useful for commands like: getNewBrowseSession() which doesnt have session
  // associated till the session gets created.
  private final Map<ThreadKey, List<LogRecord>> perThreadTempRecords;
  private final Formatter formatter;
  private Map<ThreadKey, String> threadToSessionMap;
  private Map<String, ThreadKey> sessionToThreadMap;
  private SessionLogsToFileRepository logFileRepository;
  private int capacity;

  /**
   * New handler keeping track of log records per session.
   *
   * @param capacity     The capacity
   * @param minimumLevel Only keep track of records whose level is equal or greater than
   *                     minimumLevel.
   * @param formatter    Formatter to use when retrieving log messages.
   */
  public DefaultPerSessionLogHandler(int capacity, Level minimumLevel, Formatter formatter) {
    this.capacity = capacity;
    this.formatter = formatter;
    this.perSessionRecords = new HashMap<String, List<LogRecord>>();
    this.perThreadTempRecords = new HashMap<ThreadKey, List<LogRecord>>();
    this.threadToSessionMap = new HashMap<ThreadKey, String>();
    this.sessionToThreadMap = new HashMap<String, ThreadKey>();
    this.logFileRepository = new SessionLogsToFileRepository();
  }

  @Override
  synchronized public void publish(LogRecord record) {
    ThreadKey threadId = new ThreadKey();
    String sessionId = threadToSessionMap.get(threadId);

    if (sessionId != null) {
      List<LogRecord> records = perSessionRecords.get(sessionId);
      if (records == null) {
        records = new ArrayList<LogRecord>();
      }
      records.add(record);
      perSessionRecords.put(sessionId, records);
      if (records.size() > capacity) {
        // flush records to file;
        try {
          logFileRepository.flushRecordsToLogFile(sessionId, records);
          // clear in memory session records
          records.clear();
          perSessionRecords.put(sessionId, records);
        } catch (IOException ex) {
          ex.printStackTrace();
        }
      }
    } else {
      List<LogRecord> records = perThreadTempRecords.get(threadId);
      if (records == null) {
        records = new ArrayList<LogRecord>();
      }
      records.add(record);
      perThreadTempRecords.put(threadId, records);
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

  private LogRecord[] records(String sessionId) throws IOException {
    List<LogRecord> logFileRecords = logFileRepository.getLogRecords(sessionId);
    List<LogRecord> records = perSessionRecords.get(sessionId);
    if (records != null) {
      logFileRecords.addAll(records);
    }
    return logFileRecords.toArray(new LogRecord[logFileRecords.size()]);
  }

  private String formattedRecords(String sessionId) throws IOException {
    final StringWriter writer;

    writer = new StringWriter();
    for (LogRecord record : records(sessionId)) {
      writer.append(formatter.format(record));
    }
    return writer.toString();
  }

  @Override
  public synchronized void attachToCurrentThread(String sessionId) {
    ThreadKey threadId = new ThreadKey();
    if (threadToSessionMap.get(threadId) == null
        || threadToSessionMap.get(threadId).equals(sessionId)) {
      threadToSessionMap.put(threadId, sessionId);
      sessionToThreadMap.put(sessionId, threadId);
    }
    transferThreadTempLogsToSessionLogs(sessionId);
  }

  @Override
  public void transferThreadTempLogsToSessionLogs(String sessionId) {
    ThreadKey threadId = new ThreadKey();
    List<LogRecord> threadRecords = perThreadTempRecords.get(threadId);
    List<LogRecord> sessionRecords = perSessionRecords.get(sessionId);

    if (threadRecords != null) {
      if (sessionRecords == null) {
        sessionRecords = new ArrayList<LogRecord>();
        perSessionRecords.put(sessionId, sessionRecords);
      }
      sessionRecords.addAll(threadRecords);
    }
    clearThreadTempLogs();
  }

  @Override
  public synchronized void detachFromCurrentThread() {
    ThreadKey threadId = new ThreadKey();
    String sessionId = threadToSessionMap.get(threadId);
    if (sessionId != null) {
      threadToSessionMap.remove(threadId);
      sessionToThreadMap.remove(sessionId);
      clearThreadTempLogs();
    }
  }

  @Override
  public synchronized void removeSessionLogs(String sessionId) {
    ThreadKey threadId = sessionToThreadMap.get(sessionId);
    String sessionIdForThread = threadToSessionMap.get(threadId);
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
  @Override
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
  @Override
  public synchronized String getLog(String sessionId) throws IOException {
    // TODO(chandra): Provide option to clear logs after getLog()
    String logs = formattedRecords(sessionId);
    logs = "\n<RC_Logs RC_Session_ID=" + sessionId + ">\n" + logs
           + "\n</RC_Logs>\n";
    return logs;
  }

  private static class ThreadKey {

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

      return !(id != null ? !id.equals(threadKey.id) : threadKey.id != null);

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
