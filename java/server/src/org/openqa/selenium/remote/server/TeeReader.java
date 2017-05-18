package org.openqa.selenium.remote.server;

import java.io.IOException;
import java.io.Reader;
import java.io.Writer;

public class TeeReader extends Reader {

  private final Reader source;
  private final Writer[] sinks;

  public TeeReader(Reader source, Writer... sinks) {
    this.source = source;
    this.sinks = sinks;
  }

  @Override
  public int read(char[] cbuf, int off, int len) throws IOException {
    int read = source.read(cbuf, off, len);

    if (read != -1) {
      for (Writer sink : sinks) {
        sink.write(cbuf, off, read);
      }
    }
    return read;
  }

  @Override
  public void close() throws IOException {
    source.close();
    for (Writer sink : sinks) {
      sink.close();
    }
  }

  @Override
  public boolean markSupported() {
    return false;
  }
}
