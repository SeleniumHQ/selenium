package org.openqa.selenium.firefox.internal;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.Reader;
import java.io.Writer;

public class Cleanly {
  public static void close(InputStream toClose) {
    if (toClose == null) return;

    try {
      toClose.close();
    } catch (IOException e) {
      // nothing that can done. Ignoring.
    }
  }

  public static void close(OutputStream toClose) {
    if (toClose == null) return;

    try {
      toClose.close();
    } catch (IOException e) {
      // nothing that can done. Ignoring.
    }
  }

  public static void close(Reader reader) {
    if (reader == null) return;

    try {
      reader.close();
    } catch (IOException e) {
      // nothing that can done. Ignoring.
    }
  }

  public static void close(Writer reader) {
    if (reader == null) return;

    try {
      reader.close();
    } catch (IOException e) {
      // nothing that can done. Ignoring.
    }
  }
}
