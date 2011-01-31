package org.openqa.selenium.server.log;

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

class LogFile {
    private String logName;
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
            new File(logName).delete();
        }
    }
}

public class SessionLogsToFileRepository {
    private Map<String, LogFile> sessionToLogFileMap;

    public SessionLogsToFileRepository() {
        sessionToLogFileMap = new HashMap<String, LogFile>();
    }

    /**
     * This creates log file object which represents logs in file form. This
     * opens ObjectOutputStream which is used to write logRecords to log file
     * and opens a ObjectInputStream which is used to read logRecords from the
     * file.
     * 
     * @param sessionId
     *            session-id for the log file entry needs to be created.
     * @throws IOException
     */
    private void createLogFileAndAddToMap(String sessionId) throws IOException {
        File rcLogFile;
        // create logFile;
        rcLogFile = File.createTempFile(sessionId, ".rclog");
        rcLogFile.deleteOnExit();
        LogFile logFile = new LogFile(rcLogFile.getAbsolutePath());
        sessionToLogFileMap.put(sessionId, logFile);
    }

    /**
     * This creates a mapping between session and file representation of logs if
     * doesnt exist already. Writes the log records to the log file. This does
     * *NOT* flush the logs to file. This does *NOT* clear the records after
     * writing to file.
     * 
     * @param sessionId
     *            session-id to which the log records belong
     * @param records
     *            logRecords that need to be stored
     * @throws IOException 
     */
    synchronized public void flushRecordsToLogFile(String sessionId,
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
     * This returns the log records storied in the corresponding log file. This
     * does *NOT* clear the log records in the file.
     * 
     * @param sessionId
     *            session-id for which the file logs needs to be returned.
     * @return
     * @throws IOException 
     */
    public List<LogRecord> getLogRecords(String sessionId) throws IOException {
        LogFile logFile = sessionToLogFileMap.get(sessionId);
        if (logFile == null) {
            return new ArrayList<LogRecord>();
        }
        logFile.openLogReader();
        ObjectInputStream logObjInStream = logFile.getLogReader();
        List<LogRecord> logRecords = new ArrayList<LogRecord>();
        try {
            LogRecord tmpLogRecord;
            while (null != (tmpLogRecord = (LogRecord) logObjInStream
                    .readObject())) {
                logRecords.add(tmpLogRecord);
            }
        } catch (IOException ex) {
            logFile.closeLogReader();
            return logRecords;
        } catch (ClassNotFoundException e) {
            logFile.closeLogReader();
            return logRecords;
        }
        logFile.closeLogReader();
        return logRecords;
    }

    public void removeLogFile(String sessionId) throws IOException {
        LogFile logFile = sessionToLogFileMap.get(sessionId);
        sessionToLogFileMap.remove(sessionId);
        if (logFile == null) {
            return;
        }
        logFile.removeLogFile();
    }
}
