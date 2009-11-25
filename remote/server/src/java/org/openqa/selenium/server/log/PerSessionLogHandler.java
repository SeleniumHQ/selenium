package org.openqa.selenium.server.log;

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
 * Handler which keeps in memory the log records per session so that users can
 * retrieve logs per session.
 */
public class PerSessionLogHandler extends java.util.logging.Handler {

    private final Map<String, List<LogRecord>> perSessionRecords;

    // Used to store log records that doesnt have associated session.
    // These records get mapped to session id once the session gets created
    // Useful for commands like: getNewBrowseSession() which doesnt have session
    // associated till the session gets created.
    private final Map<Long, List<LogRecord>> perThreadTempRecords;
    private final Formatter formatter;
    private int minimumLevel;
    private int currentIndex;
    private Map<Long, String> threadToSessionMap;
    private Map<String, Long> sessionToThreadMap;
    private SessionLogsToFileRepository logFileRepository;
    private int capacity;

    /**
     * New handler keeping track of log records per session.
     * 
     * @param minimumLevel
     *            Only keep track of records whose level is equal or greater
     *            than minimumLevel.
     * @param formatter
     *            Formatter to use when retrieving log messages.
     */
    public PerSessionLogHandler(int capacity, Level minimumLevel,
            Formatter formatter) {
        this.capacity = capacity;
        this.formatter = formatter;
        this.minimumLevel = minimumLevel.intValue();
        this.perSessionRecords = new HashMap<String, List<LogRecord>>();
        this.perThreadTempRecords = new HashMap<Long, List<LogRecord>>();
        this.currentIndex = 0;
        this.threadToSessionMap = new HashMap<Long, String>();
        this.sessionToThreadMap = new HashMap<String, Long>();
        this.logFileRepository = new SessionLogsToFileRepository();
        
    }
    
    @Override
    synchronized public void publish(LogRecord record) {
        long threadId = Thread.currentThread().getId();
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

    public void flush() {
        /* NOOP */
    }
    
    public void close() throws SecurityException {
        perSessionRecords.clear();
        perThreadTempRecords.clear();
    }

    public LogRecord[] records(String sessionId) throws IOException {
        List<LogRecord> logFileRecords = logFileRepository.getLogRecords(sessionId);
        List<LogRecord> records = perSessionRecords.get(sessionId);
        logFileRecords.addAll(records);
        return logFileRecords.toArray(new LogRecord[0]);
    }

    public String formattedRecords(String sessionId) throws IOException {
        final StringWriter writer;

        writer = new StringWriter();
        for (LogRecord record : records(sessionId)) {
            writer.append(formatter.format(record));
        }
        return writer.toString();
    }

    public void setThreadToSessionMapping(long threadId, String sessionId) {
        if (threadToSessionMap.get(threadId) == null
                || threadToSessionMap.get(threadId).equals(sessionId)) {
            threadToSessionMap.put(threadId, sessionId);
            sessionToThreadMap.put(sessionId, threadId);
        }
    }

    public void clearThreadToSessionMapping(long threadId) {
        String sessionId = threadToSessionMap.get(threadId);
        if (sessionId != null) {
            threadToSessionMap.remove(threadId);
            sessionToThreadMap.remove(sessionId);
        }
    }
    
    public void clearSessionLogRecords(String sessionId) throws IOException {
        Long threadId = sessionToThreadMap.get(sessionId);
        String sessionIdForThread = threadToSessionMap.get(threadId);
        if (threadId != null && sessionIdForThread != null && sessionIdForThread.equals(sessionId)) {
            threadToSessionMap.remove(threadId);
            sessionToThreadMap.remove(sessionId);
        }
        perSessionRecords.remove(sessionId);
        logFileRepository.removeLogFile(sessionId);
    }

    public void copyThreadTempLogsToSessionLogs(String sessionId, long threadId) {
        List<LogRecord> records = perThreadTempRecords.get(threadId);
        List<LogRecord> sessionRecords = new ArrayList<LogRecord>();

        if (perSessionRecords.get(sessionId) == null && records != null) {
            sessionRecords.addAll(records);
            perSessionRecords.put(sessionId, sessionRecords);
            perThreadTempRecords.remove(threadId);
        }
    }

    /**
     * This returns Selenium Remote Control logs associated with the sessionId.
     * @param sessionId session-id for which the RC logs will be returned.
     * @return String RC logs for the sessionId
     * @throws IOException 
     */
    public String getLog(String sessionId) throws IOException {
        // TODO(chandra): Provide option to clear logs after getLog()
        String logs = formattedRecords(sessionId);
        logs = "\n<RC_Logs RC_Session_ID=" + sessionId + ">\n" + logs
                + "\n</RC_Logs>\n";
        return logs;
    }
}
