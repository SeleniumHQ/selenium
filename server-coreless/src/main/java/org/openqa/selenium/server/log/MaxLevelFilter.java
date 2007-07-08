package org.openqa.selenium.server.log;

import java.util.logging.Filter;
import java.util.logging.Level;
import java.util.logging.LogRecord;

public class MaxLevelFilter implements Filter {

    Level maxLevel;
    public MaxLevelFilter(Level maxLevel) {
        this.maxLevel = maxLevel;
    }
    
    public boolean isLoggable(LogRecord record) {
        return record.getLevel().intValue() <= maxLevel.intValue();
    }

}
