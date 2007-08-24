package org.openqa.selenium.server.log;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.logging.Formatter;
import java.util.logging.Level;
import java.util.logging.LogRecord;

public class TerseFormatter extends Formatter {

    /**
     * The string to write at the beginning of all log headers (e.g. "[FINE core]")
     */
    private static final String PREFIX = "";

    /**
     * The string to write at the end of every log header (e.g. "[FINE core]").
     * It should includes the spaces between the header and the message body.
     */
    private static final String SUFFIX = " - ";

    /**
     * Buffer for formatting messages. We will reuse this
     * buffer in order to reduce memory allocations.
     */
    private final StringBuffer buffer;
    private SimpleDateFormat format;

    private boolean longForm;

    public TerseFormatter(boolean longForm) {
        buffer = new StringBuffer();
        buffer.append(PREFIX);
        format = new SimpleDateFormat("HH:mm:ss.SSS");
        this.longForm = longForm;
    }
    
    // DGF these have to be compile time constants to be used with switch
    private static final int FINE = 500;//Level.FINE.intValue();
    private static final int INFO = 800;//Level.INFO.intValue();
    private static final int WARNING = 900;//Level.WARNING.intValue();
    private static final int SEVERE = 1000;//Level.SEVERE.intValue();


    /**
     * Format the given log record and return the formatted string.
     *
     * @param record the log record to be formatted.
     * @return a formatted log record
     */
    public synchronized String format(final LogRecord record) {
        buffer.setLength(PREFIX.length());
        buffer.append(format.format(new Date(record.getMillis())));
        buffer.append(' ');
        buffer.append(levelToCommonsLevelName(record.getLevel()));
        if (longForm) {
            buffer.append(" [");
            buffer.append(record.getThreadID());
            buffer.append("] ");
            buffer.append(record.getLoggerName());
        }
        buffer.append(SUFFIX);
        buffer.append(formatMessage(record)).append('\n');
        if (record.getThrown() != null) {
            StringWriter trace = new StringWriter();
            record.getThrown().printStackTrace(new PrintWriter(trace));
            buffer.append(trace);
        }

        return buffer.toString();
    }
    
    private String levelToCommonsLevelName(Level level) {
        switch (level.intValue()) {
            case FINE:
                return "DEBUG";
            case INFO:
                return "INFO";
            case WARNING:
                return "WARN";
            case SEVERE:
                return "ERROR";
            default:
                return level.getLocalizedName();
        }
    }

}