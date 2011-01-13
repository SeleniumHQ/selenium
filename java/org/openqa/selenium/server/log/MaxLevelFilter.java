package org.openqa.selenium.server.log;

import java.util.logging.Filter;
import java.util.logging.Level;
import java.util.logging.LogRecord;

/**
 * java.util.logging Filter providing finer grain control over
 * what is logged, beyond the control provided by log levels.
 * <p>
 * This filter will log all log records whose level is equal or
 * lower than a maximum level.
 */
public class MaxLevelFilter implements Filter {

    private final Level maxLevel;

    public MaxLevelFilter(Level maxLevel) {
        this.maxLevel = maxLevel;
    }
    
    public boolean isLoggable(LogRecord record) {
        return record.getLevel().intValue() <= maxLevel.intValue();
    }

}
