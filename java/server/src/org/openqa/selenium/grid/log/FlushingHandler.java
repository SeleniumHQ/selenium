package org.openqa.selenium.grid.log;

import java.io.OutputStream;
import java.util.Objects;
import java.util.logging.LogRecord;
import java.util.logging.StreamHandler;

class FlushingHandler extends StreamHandler {

  private OutputStream out;

  FlushingHandler(OutputStream out) {
    setOutputStream(out);
  }

  @Override
  protected synchronized void setOutputStream(OutputStream out) throws SecurityException {
    super.setOutputStream(out);
    this.out = out;
  }

  @Override
  public synchronized void publish(LogRecord record) {
    super.publish(record);
    flush();
  }

  @Override
  public synchronized void close() throws SecurityException {
    // Avoid closing sysout or syserr
    if (Objects.equals(System.out, out) || Objects.equals(System.err, out)) {
      flush();
    } else {
      super.close();
    }
  }
}
