package org.openqa.selenium.server.log;

import java.util.logging.LogRecord;
import java.util.logging.StreamHandler;

/**
 * java.util.logging Log Handler logging everything to standard output.
 */
public class StdOutHandler extends StreamHandler {
    
    /*
     * DGF - would be nice to subclass ConsoleHandler, if it weren't for java bug 4827381
     *
     * http://bugs.sun.com/bugdatabase/view_bug.do?bug_id=4827381
     */

    public StdOutHandler() {
        super();
        setOutputStream(System.out);
    }


    public void publish(LogRecord record) {
        super.publish(record);
        flush();
    }
    
}
