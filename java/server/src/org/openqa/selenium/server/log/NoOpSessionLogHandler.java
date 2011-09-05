package org.openqa.selenium.server.log;

import java.io.IOException;
import java.util.logging.LogRecord;

/**
 * @author Kristian Rosenvold
 */
public class NoOpSessionLogHandler extends PerSessionLogHandler {

  @Override
  public void attachToCurrentThread(String sessionId) {
  }

  @Override
  public void transferThreadTempLogsToSessionLogs(String sessionId) {
  }

  @Override
  public void detachFromCurrentThread() {
  }

  @Override
  public void removeSessionLogs(String sessionId) {
  }

  @Override
  public void clearThreadTempLogs() {
  }

  @Override
  public String getLog(String sessionId) throws IOException {
    return null;
  }

  @Override
  public void publish(LogRecord record) {
  }

  @Override
  public void flush() {
  }

  @Override
  public void close() throws SecurityException {
  }
}
