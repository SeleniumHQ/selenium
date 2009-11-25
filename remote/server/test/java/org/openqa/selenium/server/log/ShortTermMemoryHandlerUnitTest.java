package org.openqa.selenium.server.log;

import junit.framework.TestCase;

import java.util.logging.LogRecord;
import java.util.logging.Level;
import java.util.logging.Formatter;

/**
 * {@link org.openqa.selenium.server.log.ShortTermMemoryHandler} unit test class.
 */
public class ShortTermMemoryHandlerUnitTest extends TestCase {

    public void testRecordsReturnsAnEmptyArrayWhenNoRecordHasBeenAdded() {
        final ShortTermMemoryHandler handler;

        handler = new ShortTermMemoryHandler(1, Level.FINEST, null);
        assertNotNull(handler.records());
        assertEquals(0, handler.records().length);
    }

    public void testRecordsReturnsTheAddedRecordWhenASingleOneIsPublished() {
        final ShortTermMemoryHandler handler;
        final LogRecord theLogRecord;

        handler = new ShortTermMemoryHandler(1, Level.FINEST, null);
        theLogRecord = new LogRecord(Level.INFO, "");
        handler.publish(theLogRecord);
        assertNotNull(handler.records());
        assertEquals(1, handler.records().length);
        assertEquals(theLogRecord, handler.records()[0]);
    }

    public void testRecordsIsEmptyWhenAddedRecordIsLowerThanTheMinimumLevel() {
        final ShortTermMemoryHandler handler;
        final LogRecord theLogRecord;

        handler = new ShortTermMemoryHandler(1, Level.INFO, null);
        theLogRecord = new LogRecord(Level.FINE, "");
        handler.publish(theLogRecord);
        assertNotNull(handler.records());
        assertEquals(0, handler.records().length);
    }

    public void testRecordsIsEmptyWhenAddedRecordIsEqualToTheMinimumLevel() {
        final ShortTermMemoryHandler handler;
        final LogRecord theLogRecord;

        handler = new ShortTermMemoryHandler(1, Level.INFO, null);
        theLogRecord = new LogRecord(Level.INFO, "");
        handler.publish(theLogRecord);
        assertNotNull(handler.records());
        assertEquals(1, handler.records().length);
        assertEquals(theLogRecord, handler.records()[0]);
    }

    public void testRecordsReturnsTheTwoAddedRecordWhenATwoRecordsArePublishedAndCapacityIsNotExceeded() {
        final ShortTermMemoryHandler handler;
        final LogRecord firstLogRecord;
        final LogRecord secondLogRecord;

        handler = new ShortTermMemoryHandler(2, Level.FINEST, null);
        firstLogRecord = new LogRecord(Level.INFO, "");
        secondLogRecord = new LogRecord(Level.INFO, "");
        handler.publish(firstLogRecord);
        handler.publish(secondLogRecord);
        assertNotNull(handler.records());
        assertEquals(2, handler.records().length);
        assertEquals(firstLogRecord, handler.records()[0]);
        assertEquals(secondLogRecord, handler.records()[1]);
    }

    public void testRecordsOnlyReturnsTheLastRecordWhenATwoRecordsArePublishedAndCapacityIsExceeded() {
        final ShortTermMemoryHandler handler;
        final LogRecord firstLogRecord;
        final LogRecord secondLogRecord;

        handler = new ShortTermMemoryHandler(1, Level.FINEST, null);
        firstLogRecord = new LogRecord(Level.INFO, "");
        secondLogRecord = new LogRecord(Level.INFO, "");
        handler.publish(firstLogRecord);
        handler.publish(secondLogRecord);
        assertNotNull(handler.records());
        assertEquals(1, handler.records().length);
        assertEquals(secondLogRecord, handler.records()[0]);
    }

    public void testRecordsOnlyReturnsTheLastTwoRecordsWhenThreeRecordsArePublishedAndCapacityIsExceeded() {
        final ShortTermMemoryHandler handler;
        final LogRecord firstLogRecord;
        final LogRecord secondLogRecord;
        final LogRecord thirdLogRecord;

        handler = new ShortTermMemoryHandler(2, Level.FINEST, null);
        firstLogRecord = new LogRecord(Level.INFO, "");
        secondLogRecord = new LogRecord(Level.INFO, "");
        thirdLogRecord = new LogRecord(Level.INFO, "");
        handler.publish(firstLogRecord);
        handler.publish(secondLogRecord);
        handler.publish(thirdLogRecord);
        assertNotNull(handler.records());
        assertEquals(2, handler.records().length);
        assertEquals(secondLogRecord, handler.records()[0]);
        assertEquals(thirdLogRecord, handler.records()[1]);
    }

    public void testRecordsOnlyReturnsTheLastRecordWhenThreeRecordsArePublishedAndCapacityIsOne() {
        final ShortTermMemoryHandler handler;
        final LogRecord firstLogRecord;
        final LogRecord secondLogRecord;
        final LogRecord thirdLogRecord;

        handler = new ShortTermMemoryHandler(1, Level.FINEST, null);
        firstLogRecord = new LogRecord(Level.INFO, "");
        secondLogRecord = new LogRecord(Level.INFO, "");
        thirdLogRecord = new LogRecord(Level.INFO, "");
        handler.publish(firstLogRecord);
        handler.publish(secondLogRecord);
        handler.publish(thirdLogRecord);
        assertNotNull(handler.records());
        assertEquals(1, handler.records().length);
        assertEquals(thirdLogRecord, handler.records()[0]);
    }

    public void testAfterCloseAllRecordsAreCleared() {
        final ShortTermMemoryHandler handler;
        final LogRecord firstLogRecord;
        final LogRecord secondLogRecord;

        handler = new ShortTermMemoryHandler(2, Level.FINEST, null);
        firstLogRecord = new LogRecord(Level.INFO, "");
        secondLogRecord = new LogRecord(Level.INFO, "");
        handler.publish(firstLogRecord);
        handler.publish(secondLogRecord);
        handler.close();
        assertNotNull(handler.records());
        assertEquals(0, handler.records().length);
    }

    public void testFormattedRecordsReturnsAnEmptyStringWhenThereIsNoRecord() {
        final ShortTermMemoryHandler handler;

        handler = new ShortTermMemoryHandler(1, Level.INFO, null);
        assertEquals("", handler.formattedRecords());

    }

    public void testFormattedRecords() {
        final ShortTermMemoryHandler handler;
        final LogRecord firstLogRecord;
        final LogRecord secondLogRecord;
        final Formatter formatter;

        formatter = new Formatter() {
            public String format(LogRecord record) {
                return "[FORMATTED] " + record.getMessage();
            }
        };
        handler = new ShortTermMemoryHandler(2, Level.INFO, formatter);
        firstLogRecord = new LogRecord(Level.INFO, "First log message");
        secondLogRecord = new LogRecord(Level.INFO, "Second log message");
        handler.publish(firstLogRecord);
        handler.publish(secondLogRecord);
        assertEquals("[FORMATTED] First log message\n" +
                     "[FORMATTED] Second log message\n", handler.formattedRecords());

    }

}
