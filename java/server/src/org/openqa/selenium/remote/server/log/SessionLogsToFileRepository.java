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

import org.openqa.selenium.remote.SessionId;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.LogRecord;
import java.util.logging.Logger;

public class SessionLogsToFileRepository {
  private static final Logger LOG = Logger.getLogger(SessionLogsToFileRepository.class.getName());
  private final Map<SessionId, LogFile> sessionToLogFileMap;

  public SessionLogsToFileRepository() {
    sessionToLogFileMap = new HashMap<>();
  }

  /**
   * This creates log file object which represents logs in file form. This opens ObjectOutputStream
   * which is used to write logRecords to log file and opens a ObjectInputStream which is used to
   * read logRecords from the file.
   *
   * @param sessionId session-id for the log file entry needs to be created.
   * @throws IOException file i/o exception can occur because of a temp file created
   */
  public void createLogFileAndAddToMap(SessionId sessionId) throws IOException {
    File rcLogFile;
    // create logFile;
    rcLogFile = File.createTempFile(sessionId.toString(), ".rclog");
    rcLogFile.deleteOnExit();
    LogFile logFile = new LogFile(rcLogFile.getAbsolutePath());
    sessionToLogFileMap.put(sessionId, logFile);
  }

  /**
   * This creates a mapping between session and file representation of logs if doesnt exist already.
   * Writes the log records to the log file. This does *NOT* flush the logs to file. This does *NOT*
   * clear the records after writing to file.
   *
   * @param sessionId session-id to which the log records belong
   * @param records logRecords that need to be stored
   * @throws IOException file i/o exception can occur because of a temp file created
   */
  public synchronized void flushRecordsToLogFile(SessionId sessionId,
      List<LogRecord> records) throws IOException {
    LogFile logFile = sessionToLogFileMap.get(sessionId);

    if (logFile == null) {
      createLogFileAndAddToMap(sessionId);
      logFile = sessionToLogFileMap.get(sessionId);
    }

    logFile.openLogWriter();
    for (LogRecord record : records) {
      logFile.getLogWriter().writeObject(record);
    }
    logFile.closeLogWriter();
  }

  /**
   * This returns the log records storied in the corresponding log file. This does *NOT* clear the
   * log records in the file.
   *
   * @param sessionId session-id for which the file logs needs to be returned.
   * @return A List of LogRecord objects, which can be <i>null</i>.
   * @throws IOException IO exception can occur with reading the log file
   */
  public List<LogRecord> getLogRecords(SessionId sessionId) throws IOException {
    LogFile logFile = sessionToLogFileMap.get(sessionId);
    if (logFile == null) {
      return new ArrayList<>();
    }

    List<LogRecord> logRecords = new ArrayList<>();
    try {
      logFile.openLogReader();
      ObjectInputStream logObjInStream = logFile.getLogReader();
      LogRecord tmpLogRecord;
      while (null != (tmpLogRecord = (LogRecord) logObjInStream
          .readObject())) {
        logRecords.add(tmpLogRecord);
      }
    } catch (IOException | ClassNotFoundException ex) {
      logFile.closeLogReader();
      return logRecords;
    }
    logFile.closeLogReader();
    return logRecords;
  }

  public void removeLogFile(SessionId sessionId) {
    LogFile logFile = sessionToLogFileMap.get(sessionId);
    sessionToLogFileMap.remove(sessionId);
    if (logFile == null) {
      return;
    }
    try {
      logFile.removeLogFile();
    } catch (IOException e) {
      throw new RuntimeException(e);
    }
  }

  static class LogFile {
    private final String logName;
    private ObjectOutputStream logWriter;
    private ObjectInputStream logReader;

    public LogFile(String logName) {
      this.logName = logName;
    }

    public void openLogWriter() throws IOException {
      logWriter = new ObjectOutputStream(new FileOutputStream(logName));
    }

    public void closeLogWriter() throws IOException {
      if (logWriter != null) {
        logWriter.close();
      }
    }

    public void openLogReader() throws IOException {
      logReader = new ObjectInputStream(new FileInputStream(logName));
    }

    public void closeLogReader() throws IOException {
      if (logReader != null) {
        logReader.close();
      }
    }

    public ObjectOutputStream getLogWriter() {
      return logWriter;
    }

    public ObjectInputStream getLogReader() {
      return logReader;
    }

    public void removeLogFile() throws IOException {
      if (logName != null) {
        closeLogReader();
        closeLogWriter();
        if (!new File(logName).delete()) {
          LOG.warning("Unable to delete " + logName);
        }
      }
    }
  }
}
