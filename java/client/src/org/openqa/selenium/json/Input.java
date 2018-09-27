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

package org.openqa.selenium.json;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.CharBuffer;
import java.util.Objects;

/**
 * Similar to a {@link Readable} but with the ability to peek a single character ahead.
 * <p>
 * For the sake of providing a useful {@link #toString()} implementation, keeps a small circular
 * buffer of the most recently read characters.
 */
class Input {

  public static final char EOF = (char) -1;
  private final Readable source;
  private boolean read;
  private char peekedChar;
  private char[] lastRead = new char[128];
  private int insertAt = 0;
  private boolean filled = false;

  public Input(Readable source) {
    this.source = Objects.requireNonNull(source);
  }

  public char peek() {
    init();
    return peekedChar;
  }

  public char read() {
    init();
    read = false;
    append();
    return peekedChar;
  }

  @Override
  public String toString() {
    String preamble = "Last " + (filled ?  lastRead.length : insertAt) + " characters read: ";
    if (!filled) {
      return preamble + new String(lastRead, 0, insertAt);
    }

    // We filled the array. The insertion point would overwrite the first thing we should read.
    char[] buf = new char[lastRead.length];
    int lengthToRead = lastRead.length - insertAt;
    System.arraycopy(lastRead, insertAt, buf, 0, lengthToRead);
    System.arraycopy(lastRead, 0, buf, lengthToRead, insertAt);

    return preamble + new String(buf);
  }

  private void init() {
    if (read) {
      return;
    }

    CharBuffer buf = CharBuffer.allocate(1);
    int charsRead;
    try {
      charsRead = source.read(buf);
    } catch (IOException e) {
      throw new UncheckedIOException(e.getMessage(), e);
    }
    if (charsRead != 1) {
      peekedChar = EOF;
    } else {
      peekedChar = buf.array()[0];
    }
    read = true;
  }

  private void append() {
    if (peekedChar == Input.EOF) {
      return;
    }
    lastRead[insertAt] = peekedChar;
    insertAt = ++insertAt % lastRead.length;
    if (insertAt == 0) {
      filled = true;
    }
  }
}
