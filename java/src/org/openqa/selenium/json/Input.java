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
import java.io.Reader;
import java.io.UncheckedIOException;
import org.openqa.selenium.internal.Require;

/**
 * Similar to a {@link Reader} but with the ability to peek a single character ahead.
 *
 * <p>For the sake of providing a useful {@link #toString()} implementation, keeps the most recently
 * read characters in the input buffer.
 */
class Input {
  /** end-of-file indicator (0xFFFD) */
  public static final char EOF = (char) -1; // NOTE: Produces Unicode replacement character (0xFFFD)

  /** the number of chars to buffer */
  private static final int BUFFER_SIZE = 4096;

  /** the number of chars to remember, safe to set to 0 */
  private static final int MEMORY_SIZE = 128;

  private final Reader source;

  /** a buffer used to minimize read calls and to keep the chars to remember */
  private final char[] buffer;

  /** the filled area in the buffer */
  private int filled;

  /** the last position read in the buffer */
  private int position;

  /**
   * Initialize a new instance of the {@link Input} class with the specified source.
   *
   * @param source {@link Reader} object that supplies the input to be processed
   */
  public Input(Reader source) {
    this.source = Require.nonNull("Source", source);
    this.buffer = new char[BUFFER_SIZE + MEMORY_SIZE];
    this.filled = 0;
    this.position = -1;
  }

  /**
   * Extract the next character from the input without consuming it.
   *
   * @return the next input character; {@link #EOF} if input is exhausted
   */
  public char peek() {
    return fill() ? buffer[position + 1] : EOF;
  }

  /**
   * Read and consume the next character from the input.
   *
   * @return the next input character; {@link #EOF} if input is exhausted
   */
  public char read() {
    return fill() ? buffer[++position] : EOF;
  }

  /**
   * Return a string containing the most recently consumed input characters.
   *
   * @return {@link String} with up to 128 consumed input characters
   */
  @Override
  public String toString() {
    int offset;
    int length;

    if (position < MEMORY_SIZE) {
      offset = 0;
      length = position + 1;
    } else {
      offset = position + 1 - MEMORY_SIZE;
      length = MEMORY_SIZE;
    }

    String last = "Last " + length + " characters read: " + new String(buffer, offset, length);
    int next = Math.min(MEMORY_SIZE, filled - (offset + length));

    if (next > 0) {
      if (next > 128) {
        next = 128;
      }
      return last
          + ", next "
          + next
          + " characters to read: "
          + new String(buffer, offset + length, next);
    }

    return last;
  }

  /**
   * If all buffered input has been consumed, read the next chunk into the buffer.<br>
   * <b>NOTE</b>: The last 128 character of consumed input is retained for debug output.
   *
   * @return {@code true} if new input is available; {@code false} if input is exhausted
   * @throws UncheckedIOException if an I/O exception is encountered
   */
  private boolean fill() {
    // do we need to fill the buffer?
    while (filled == position + 1) {
      try {
        // free the buffer, keep only the chars to remember
        int shift = filled - MEMORY_SIZE;
        if (shift > 0) {
          position -= shift;
          filled -= shift;

          System.arraycopy(buffer, shift, buffer, 0, filled);
        }

        // try to fill the buffer
        int n = source.read(buffer, filled, buffer.length - filled);

        if (n == -1) {
          // EOF reached
          return false;
        } else {
          // n might be 0, the outer loop will handle this
          filled += n;
        }
      } catch (IOException e) {
        throw new UncheckedIOException(e.getMessage(), e);
      }
    }

    return true;
  }
}
