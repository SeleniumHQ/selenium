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

/** Captures the last N bytes of output. */
public class CircularOutputStream extends OutputStream {
  private static final int DEFAULT_SIZE = 4096;
  private int end;
  private boolean filled = false;
  private final byte[] buffer;

  public CircularOutputStream(int maxSize) {
    buffer = new byte[maxSize];
  }

  public CircularOutputStream() {
    this(DEFAULT_SIZE);
  }

  @Override
  public void write(byte[] b) {
    // overridden to get rid of the IOException
    write(b, 0, b.length);
  }

  @Override
  public synchronized void write(byte[] b, int off, int len) {
    int bufferSize = buffer.length;

    while (len > 0) {
      int chunk = Math.min(bufferSize, len);

      if (bufferSize >= end + chunk) {
        System.arraycopy(b, off, buffer, end, chunk);
        end += chunk;
      } else {
        int space = bufferSize - end;
        System.arraycopy(b, off, buffer, end, space);
        filled = true;
        end = chunk - space;
        System.arraycopy(b, off + space, buffer, 0, end);
      }

      off += chunk;
      len -= chunk;
    }
  }

  @Override
  public synchronized void write(int b) {
    if (end == buffer.length) {
      filled = true;
      end = 0;
    }

    buffer[end++] = (byte) b;
  }

  @Override
  public void flush() {
    // overridden to get rid of the IOException
  }

  @Override
  public void close() {
    // overridden to get rid of the IOException
  }

  @Override
  public String toString() {
    return toString(Charset.defaultCharset());
  }

  public synchronized String toString(Charset encoding) {
    int size = filled ? buffer.length : end;
    byte[] toReturn = new byte[size];

    // Handle the partially filled array as a special case
    if (!filled) {
      System.arraycopy(buffer, 0, toReturn, 0, end);
      return new String(toReturn, encoding);
    }

    int n = buffer.length - end;
    System.arraycopy(buffer, end, toReturn, 0, n);
    System.arraycopy(buffer, 0, toReturn, n, end);
    return new String(toReturn, encoding);
  }
}
