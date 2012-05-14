/*
Copyright 2009 Selenium committers

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
 */

package org.openqa.selenium.remote.internal;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;

/**
 * Captures the last N bytes of output.
 */
public class CircularOutputStream extends OutputStream {
  private static final int DEFAULT_SIZE = 4096;
  private int start;
  private int end;
  private boolean filled = false;
  private byte[] buffer;
  private FileOutputStream out_log;

  public CircularOutputStream(File outputFile, int maxSize) {
    buffer = new byte[maxSize];
    if (outputFile != null) {
      try {
        out_log = new FileOutputStream(outputFile);
      } catch (FileNotFoundException e) {
        out_log = null;
      }
    }
  }

  public CircularOutputStream(File outputFile) {
    this(outputFile, DEFAULT_SIZE);
  }

  public CircularOutputStream(int maxSize) {
    this(null, maxSize);
  }

  @Override
  public void write(int b) throws IOException {
    if (end == buffer.length) {
      filled = true;
      end = 0;
    }

    if (filled && end == start) {
      start = start == buffer.length - 1 ? 0 : start + 1;
    }

    buffer[end++] = (byte) b;
    if (out_log != null) {
      out_log.write(b);
    }

  }

  @Override
  public String toString() {
    int size = filled ? buffer.length : end;
    byte[] toReturn = new byte[size];

    // Handle the partially filled array as a special case
    if (!filled) {
      System.arraycopy(buffer, 0, toReturn, 0, end);
      return new String(toReturn);
    }

    int copyStart = buffer.length - start;
    if (copyStart == buffer.length) {
      copyStart = 0;
    }

    System.arraycopy(buffer, start, toReturn, 0, copyStart);
    System.arraycopy(buffer, 0, toReturn, copyStart, end);
    return new String(toReturn);
  }
}
