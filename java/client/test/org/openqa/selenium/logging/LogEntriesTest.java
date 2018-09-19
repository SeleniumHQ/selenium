package org.openqa.selenium.logging;

import static org.junit.Assert.assertEquals;

import org.junit.Test;

import java.util.Arrays;
import java.util.Date;
import java.util.logging.Level;

/**
 * @author Valery Yatsynovich
 */
public class LogEntriesTest {

  @Test
  public void canFilterAllEntriesOfSpecifiedLevelAndAbove(){
    long now = System.currentTimeMillis();
    LogEntry debug = new LogEntry(Level.FINE, now, "debug");
    LogEntry info = new LogEntry(Level.INFO, now, "info");
    LogEntry warning = new LogEntry(Level.WARNING, now, "warning");
    LogEntry error = new LogEntry(Level.SEVERE, now, "error");

    LogEntries logEntries = new LogEntries(Arrays.asList(debug, info, warning, error));

    assertEquals(Arrays.asList(warning, error), logEntries.filter(Level.WARNING));
  }

  @Test
  public void canFilterAllEntriesOfSpecifiedLevelRange(){
    long now = System.currentTimeMillis();
    LogEntry debug = new LogEntry(Level.FINE, now, "debug");
    LogEntry info = new LogEntry(Level.INFO, now, "info");
    LogEntry warning = new LogEntry(Level.WARNING, now, "warning");
    LogEntry error = new LogEntry(Level.SEVERE, now, "error");

    LogEntries logEntries = new LogEntries(Arrays.asList(debug, info, warning, error));

    assertEquals(Arrays.asList(info, warning, error), logEntries.filter(Level.INFO, Level.SEVERE));
  }
}
