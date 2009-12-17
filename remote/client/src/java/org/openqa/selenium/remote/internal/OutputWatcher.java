package org.openqa.selenium.remote.internal;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

/**
 * Consumes all output from an {@link InputStream} and writes it to an
 * {@link OutputStream}.
 *
 * @author jmleyba@gmail.com (Jason Leyba)
 */
public class OutputWatcher implements Runnable {

  private final InputStream input;
  private final OutputStream output;

  public OutputWatcher(InputStream input, OutputStream output) {
    this.input = input;
    this.output = output;
  }

  public void run() {
    int read = 0;
    while (read != -1) {
      try {
        if (input.available() > 0) {
          read = input.read();
          output.write(read);
        }
      } catch (IOException ignored) {
        // This exception is thrown when the thread running this instance is interrupted.
        // Ignore the error and silently return.
        break;
      }
    }
  }
}
