package org.openqa.selenium.server.log;

import junit.framework.TestCase;

import java.io.IOException;
import java.util.logging.LogRecord;
import java.util.logging.Level;
import java.util.logging.Formatter;

/**
 * {@link org.openqa.selenium.server.log.PerSessionLogHandler} unit test class.
 */
public class PerSessionLogHandlerUnitTest extends TestCase {
    private static final int CAPACITY = 1;

    public void testThreadToSessionMappingOnInitialNullSession() throws IOException {
        final PerSessionLogHandler handler;
        final Formatter formatter;

        formatter = new Formatter() {
            public String format(LogRecord record) {
                return "[FORMATTED] " + record.getMessage();
            }
        };

        handler = new PerSessionLogHandler(CAPACITY, Level.INFO, formatter);
        LogRecord firstRecord = new LogRecord(Level.INFO, "First Log Record");
        LogRecord secondRecord = new LogRecord(Level.INFO, "Second Log Record");

        handler.publish(firstRecord);
        handler.copyThreadTempLogsToSessionLogs("session-1", Thread
                .currentThread().getId());
        handler.setThreadToSessionMapping(Thread.currentThread().getId(),
                "session-1");
        handler.publish(secondRecord);
        String logs = handler.getLog("session-1");
        
        assertEquals(
                "\n<RC_Logs RC_Session_ID=session-1>\n[FORMATTED] First Log Record[FORMATTED] Second Log Record\n</RC_Logs>\n",
                logs);
    }

    public void testThreadToSessionMappingOnTwoInitialNullSessions() throws IOException {
        final PerSessionLogHandler handler;
        final Formatter formatter;

        formatter = new Formatter() {
            public String format(LogRecord record) {
                return "[FORMATTED] " + record.getMessage();
            }
        };

        handler = new PerSessionLogHandler(CAPACITY, Level.INFO, formatter);
        LogRecord firstRecord = new LogRecord(Level.INFO, "First Log Record");
        LogRecord secondRecord = new LogRecord(Level.INFO, "Second Log Record");

        LogRecord anotherRecord = new LogRecord(Level.INFO,
                "Another Log Record");
        LogRecord oneMoreRecord = new LogRecord(Level.INFO,
                "One More Log Record");

        handler.publish(firstRecord);
        handler.copyThreadTempLogsToSessionLogs("session-1", Thread
                .currentThread().getId());
        handler.setThreadToSessionMapping(Thread.currentThread().getId(),
                "session-1");
        handler.publish(secondRecord);
        handler.clearThreadToSessionMapping(Thread.currentThread().getId());
        handler.publish(anotherRecord);
        handler.copyThreadTempLogsToSessionLogs("session-2", Thread
                .currentThread().getId());
        handler.setThreadToSessionMapping(Thread.currentThread().getId(),
                "session-2");
        handler.publish(oneMoreRecord);
        String logs = handler.getLog("session-1");
        assertEquals(
                "\n<RC_Logs RC_Session_ID=session-1>\n[FORMATTED] First Log Record[FORMATTED] Second Log Record\n</RC_Logs>\n",
                logs);
        logs = handler.getLog("session-2");
        assertEquals(
                "\n<RC_Logs RC_Session_ID=session-2>\n[FORMATTED] Another Log Record[FORMATTED] One More Log Record\n</RC_Logs>\n",
                logs);
    }

    public void testThreadToSessionMappingAndClearMapping() throws IOException {
        final PerSessionLogHandler handler;
        final Formatter formatter;

        formatter = new Formatter() {
            public String format(LogRecord record) {
                return "[FORMATTED] " + record.getMessage();
            }
        };

        handler = new PerSessionLogHandler(CAPACITY, Level.INFO, formatter);
        LogRecord firstSessionLog = new LogRecord(Level.INFO,
                "First Session Related Log Record");
        LogRecord secondSessionLog = new LogRecord(Level.INFO,
                "Second Session Related Log Record");

        // set logs for session-1
        handler.setThreadToSessionMapping(Thread.currentThread().getId(),
                "session-one");
        handler.publish(firstSessionLog);
        handler.clearThreadToSessionMapping(Thread.currentThread().getId());

        // set logs for session-2
        handler.setThreadToSessionMapping(Thread.currentThread().getId(),
                "session-two");
        handler.publish(secondSessionLog);
        handler.clearThreadToSessionMapping(Thread.currentThread().getId());

        // assert logs for session-1
        assertEquals("\n<RC_Logs RC_Session_ID=session-one>\n[FORMATTED] First Session Related Log Record\n</RC_Logs>\n", handler
                .getLog("session-one"));
        // assert logs for session-2
        assertEquals("\n<RC_Logs RC_Session_ID=session-two>\n[FORMATTED] Second Session Related Log Record\n</RC_Logs>\n", handler
                .getLog("session-two"));
    }

}
