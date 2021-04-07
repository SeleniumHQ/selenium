// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

package org.openqa.selenium.io;

import java.io.OutputStream;
import java.nio.charset.Charset;

/**
 * Captures the last N bytes of output.
 */
public class CircularOutputStream extends OutputStream {
  private static final int DEFAULT_SIZE = 4096;
  private int start;
  private int end;
  private boolean filled = false;
  private byte[] buffer;

  public CircularOutputStream(int maxSize) {
    buffer = new byte[maxSize];
  }

  public CircularOutputStream() {
    this(DEFAULT_SIZE);
  }

  @Override
  public synchronized void write(int b) {
    if (end == buffer.length) {
      filled = true;
      end = 0;
    }

    if (filled && end == start) {
      start = start == buffer.length - 1 ? 0 : start + 1;
    }

    buffer[end++] = (byte) b;
  }

  @Override
  public String toString() {
    int size = filled ? buffer.length : end;
    byte[] toReturn = new byte[size];

    // Handle the partially filled array as a special case
    if (!filled) {
      System.arraycopy(buffer, 0, toReturn, 0, end);
      return new String(toReturn, Charset.defaultCharset());
    }

    int copyStart = buffer.length - start;
    if (copyStart == buffer.length) {
      copyStart = 0;
    }

    System.arraycopy(buffer, start, toReturn, 0, copyStart);
    System.arraycopy(buffer, 0, toReturn, copyStart, end);
    return new String(toReturn, Charset.defaultCharset());
  }
}
