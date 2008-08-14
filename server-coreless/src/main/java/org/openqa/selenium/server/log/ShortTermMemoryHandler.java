package org.openqa.selenium.server.log;

import java.util.logging.LogRecord;
import java.util.ArrayList;

/**
 * Handler who keeps in memory the last N records as is so that then
 * can be retrieved "as is" on demand.
 */
public class ShortTermMemoryHandler extends java.util.logging.Handler {

    private final LogRecord[] lastRecords;
    private final int capacity;
    private int currentIndex;


    public ShortTermMemoryHandler(int capacity) {
        this.capacity = capacity;
        this.lastRecords = new LogRecord[capacity];
        this.currentIndex = 0;
    }

    
    public void publish(LogRecord record) {
        lastRecords[currentIndex] = record;
        currentIndex++;
        if (currentIndex >= capacity) {
            currentIndex = 0;
        }
    }

    public void flush() {
        /* NOOP */
    }

    public void close() throws SecurityException {
        for (int i = 0; i < capacity; i++) {
            lastRecords[i] = null;
        }
    }

    public LogRecord[] records() {
        final ArrayList<LogRecord> validRecords;

        validRecords = new ArrayList<LogRecord>(capacity);
        for (int i = currentIndex; i < capacity; i++) {
            if (null != lastRecords[i]) {
                validRecords.add(lastRecords[i]);
            }
        }
        for (int i = 0; i < currentIndex; i++) {
            if (null != lastRecords[i]) {
                validRecords.add(lastRecords[i]);
            }
        }
        return validRecords.toArray(new LogRecord[validRecords.size()]);
    }
    
}
