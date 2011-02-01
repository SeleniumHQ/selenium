package org.openqa.selenium.server.log;

import java.util.logging.LogRecord;
import java.util.logging.Formatter;
import java.util.logging.Level;
import java.util.ArrayList;
import java.io.StringWriter;


/**
 * Handler who keeps in memory the last N records as is so that then
 * can be retrieved "as is" on demand.
 */
public class ShortTermMemoryHandler extends java.util.logging.Handler {

    private final LogRecord[] lastRecords;
    private final int capacity;
    private final Formatter formatter;
    private int minimumLevel;
    private int currentIndex;

    /**
     * New handler keeping track of the last N records above a specific log level.
     *
     * @param capacity        Maximum number of records to keep in memory (i.e. N).
     * @param minimumLevel    Only keep track of records whose level is equal or greater than minimumLevel.
     * @param formatter       Formmatter to use when retrieving log messages.
     */
    public ShortTermMemoryHandler(int capacity, Level minimumLevel, Formatter formatter) {
        this.capacity = capacity;
        this.formatter = formatter;
        this.minimumLevel = minimumLevel.intValue();
        this.lastRecords = new LogRecord[capacity];
        this.currentIndex = 0;
    }

    
    public void publish(LogRecord record) {
        if (record.getLevel().intValue() < minimumLevel) {
            return;
        }
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

    public synchronized LogRecord[] records() {
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

    public String formattedRecords() {
        final StringWriter writer;

        writer = new StringWriter();
        for (LogRecord record : records()) {
            writer.append(formatter.format(record));
            writer.append("\n");
        }
        return writer.toString();
    }
    
}
