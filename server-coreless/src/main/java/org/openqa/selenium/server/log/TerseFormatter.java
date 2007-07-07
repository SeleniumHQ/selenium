package org.openqa.selenium.server.log;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.logging.Formatter;
import java.util.logging.LogRecord;

public class TerseFormatter extends Formatter {
    /**
     * An array of strings containing only white spaces. Strings' lengths are
     * equal to their index + 1 in the <code>spacesFactory</code> array.
     * For example, <code>spacesFactory[4]</code> contains a string of
     * length 5.  Strings are constructed only when first needed.
     */
    private static final String[] spacesFactory = new String[20];

    /**
     * The string to write at the begining of all log headers (e.g. "[FINE core]")
     */
    private static final String PREFIX = "";

    /**
     * The string to write at the end of every log header (e.g. "[FINE core]").
     * It should includes the spaces between the header and the message body.
     */
    private static final String SUFFIX = " - ";

    private final String lineSeparator = System.getProperty("line.separator", "\n");

    /**
     * The line separator for the message body. This line always begin with
     * {@link #lineSeparator}, followed by some amount of spaces in order to
     * align the message.
     */
    private String bodyLineSeparator = lineSeparator;

    /**
     * The minimum amount of spaces to use for writting level and module name
     * before the message.
     */
    private static final int MARGIN = 12;

    /**
     * Buffer for formatting messages. We will reuse this
     * buffer in order to reduce memory allocations.
     */
    private final StringBuffer buffer;
    private SimpleDateFormat format;
    private boolean compactStackTraces = true;

    public TerseFormatter() {
        buffer = new StringBuffer();
        buffer.append(PREFIX);
        format = new SimpleDateFormat("MM/dd hh:mm:ss a");
    }


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
        buffer.append(record.getLevel().getLocalizedName());
        int offset = buffer.length();
        int spacesOffset = MARGIN - offset;
        buffer.append(spaces(spacesOffset));
        String logger = record.getLoggerName();
        buffer.append(' ');
        if (logger.length() > 40) {
            buffer.append(logger.substring(logger.length() - 40));
        } else {
            buffer.append(logger);
            buffer.append(spaces(40 - logger.length()));
        }
        buffer.append(SUFFIX);

        final int margin = buffer.length();
        if (bodyLineSeparator.length() != lineSeparator.length() + margin) {
            bodyLineSeparator = lineSeparator + spaces(margin);
        }
        buffer.append(formatMessage(record)).append('\n');
        if (record.getThrown() != null) {
            StringWriter trace = new StringWriter();
            printStackTrace(record.getThrown(), new PrintWriter(trace));
            buffer.append(trace);
        }

//        if (record.getLevel().intValue() >= Level.WARNING.intValue()) {
//            LoggerContext context = LoggerContext.getContextInfo();
//            if (context != null) {
//                buffer.append("\n\tAdditional Information:\n");
//                if (context.getUrl() != null) {
//                    buffer.append("\tRequest URI: ").append(context.getUrl()).append("\n");
//                }
//                if (context.getUsername() != null) {
//                    buffer.append("\tUsername:    ").append(context.getUsername()).append("\n");
//                }
//            }
//        }

        return buffer.toString();
    }

    public void printStackTrace(Throwable thrown, PrintWriter s) {
        synchronized (s) {
            s.println(thrown);
            StackTraceElement[] trace = thrown.getStackTrace();
            boolean seenOurs = false;
            for (StackTraceElement aTrace : trace) {
                if (showTrace(aTrace)) {
                    seenOurs = true;
                    s.println("\tat " + aTrace);
                } else if (!seenOurs) {
                    s.println("\tat " + aTrace);
                }
            }

            Throwable ourCause = thrown.getCause();
            if (ourCause != null) {
                printStackTraceAsCause(ourCause, s, trace);
            }
        }
    }

    private void printStackTraceAsCause(Throwable ourCause, PrintWriter s,
                                        StackTraceElement[] causedTrace)
    {
        // assert Thread.holdsLock(s);

        // Compute number of frames in common between this and caused
        StackTraceElement[] trace = ourCause.getStackTrace();
        int m = trace.length-1, n = causedTrace.length-1;
        while (m >= 0 && n >=0 && trace[m].equals(causedTrace[n])) {
            m--; n--;
        }
        int framesInCommon = trace.length - 1 - m;

        s.println("Caused by: " + ourCause);
        boolean seenOurs = false;
        for (int i=0; i <= m; i++) {
            if (showTrace(trace[i])) {
                seenOurs = true;
                s.println("\tat " + trace[i]);
            } else if (!seenOurs) {
                s.println("\tat " + trace[i]);
            }
        }
        if (framesInCommon != 0)
            s.println("\t... " + framesInCommon + " more");

        // Recurse if we have a cause
        Throwable cause = ourCause.getCause();
        if (cause != null)
            printStackTraceAsCause(cause, s, trace);
    }

    private boolean showTrace(StackTraceElement trace) {
        return !compactStackTraces || trace.getClassName().startsWith("org.openqa");
    }

    /**
     * Returns a string of the specified length filled with white spaces.
     * This method tries to return a pre-allocated string if possible.
     *
     * @param length The string length. Negative values are clamped to 0.
     * @return A string of length <code>length</code> filled with white spaces.
     */
    public static String spaces(int length) {
        // No need to synchronize.  In the unlikely event of two threads
        // calling this method at the same time and the two calls creating a
        // new string, the String.intern() call will take care of
        // canonicalizing the strings.
        final int last = spacesFactory.length - 1;
        if (length < 0) length = 0;
        if (length <= last) {
            if (spacesFactory[length] == null) {
                if (spacesFactory[last] == null) {
                    char[] blanks = new char[last];
                    for (int i = 0; i < last; i++)
                        blanks[i] = ' ';
                    spacesFactory[last] = new String(blanks).intern();
                }
                spacesFactory[length] = spacesFactory[last].substring(0, length).intern();
            }
            return spacesFactory[length];
        } else {
            char[] blanks = new char[length];
            for (int i = 0; i < length; i++)
                blanks[i] = ' ';
            return new String(blanks);
        }
    }
}