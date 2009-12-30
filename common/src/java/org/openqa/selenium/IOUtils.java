package org.openqa.selenium;

import java.io.IOException;
import java.io.InputStream;

public class IOUtils {
  private static final int BUFFER = 4096;

  public static String readFully(InputStream in) throws IOException {
    StringBuilder sb = new StringBuilder();
    byte[] buffer = new byte[BUFFER];
    int length;
    while ((length = in.read(buffer)) != -1) {
      sb.append(new String(buffer, 0, length, "UTF-8"));
    }

    in.close();

    return sb.toString();
  }

}
