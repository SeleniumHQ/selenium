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
import org.jspecify.annotations.Nullable;
import org.openqa.selenium.internal.Require;

/**
 * Similar to a {@link Reader} but with the ability to peek a single character ahead.
 *
 * <p>For the sake of providing a useful {@link #toString()} implementation, keeps the most recently
 * read characters in the input buffer.
 */
class Input {
  /**
   * End-of-input sentinel returned by {@link #peek()} and {@link #read()}.
   *
   * <p>Value {@code -1} mirrors {@link java.io.Reader#read()} and — unlike a {@code char} sentinel
   * — cannot collide with any valid UTF-16 code unit (including U+FFFF).
   */
  public static final int EOF = -1;

  /** the number of chars to buffer */
  private static final int BUFFER_SIZE = 16384;

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
   * @return the next input character as an unsigned UTF-16 code unit (0-65535); {@link #EOF} if
   *     input is exhausted
   */
  public int peek() {
    return fill() ? buffer[position + 1] : EOF;
  }

  /**
   * Read and consume the next character from the input.
   *
   * @return the next input character as an unsigned UTF-16 code unit (0-65535); {@link #EOF} if
   *     input is exhausted
   */
  public int read() {
    return fill() ? buffer[++position] : EOF;
  }

  /**
   * Attempt to consume the body of a JSON string (with the leading quote already consumed) directly
   * from the buffered input, including its closing quote.
   *
   * <p>This is the fast path for strings that contain no escape sequences and whose closing quote
   * is already buffered: the result is created straight from the buffer without copying through a
   * {@link StringBuilder}. When the string cannot be read this way, nothing is consumed.
   *
   * @return the string body; {@code null} if the caller must fall back to reading char by char
   */
  public @Nullable String readSimpleString() {
    if (!fill()) {
      return null;
    }

    int start = position + 1;
    for (int i = start; i < filled; i++) {
      char c = buffer[i];
      if (c == '"') {
        position = i;
        return new String(buffer, start, i - start);
      }
      if (c == '\\' || c < 0x20) {
        return null;
      }
    }

    return null;
  }

  /**
   * Consume characters that need no special handling within a JSON string, appending them to the
   * supplied builder in bulk. Stops before the next '"', '\\', or control character, which is left
   * unconsumed.
   *
   * @param sink {@link StringBuilder} that accumulates the string body
   * @return the unconsumed special character as an unsigned UTF-16 code unit; {@link #EOF} if input
   *     is exhausted
   */
  public int appendStringContent(StringBuilder sink) {
    while (fill()) {
      int start = position + 1;
      for (int i = start; i < filled; i++) {
        char c = buffer[i];
        if (c == '"' || c == '\\' || c < 0x20) {
          sink.append(buffer, start, i - start);
          position = i - 1;
          return c;
        }
      }
      sink.append(buffer, start, filled - start);
      position = filled - 1;
    }

    return EOF;
  }

  /**
   * Consume whitespace characters in bulk, leaving the first non-whitespace character unconsumed.
   */
  public void skipWhitespace() {
    while (fill()) {
      int start = position + 1;
      for (int i = start; i < filled; i++) {
        if (!Character.isWhitespace(buffer[i])) {
          position = i - 1;
          return;
        }
      }
      position = filled - 1;
    }
  }

  /**
   * Consume ASCII digits, appending them to the supplied builder in bulk. Stops before the first
   * non-digit character, which is left unconsumed.
   *
   * @param sink {@link StringBuilder} that accumulates the digits
   * @return the unconsumed non-digit character as an unsigned UTF-16 code unit; {@link #EOF} if
   *     input is exhausted
   */
  public int appendDigits(StringBuilder sink) {
    while (fill()) {
      int start = position + 1;
      for (int i = start; i < filled; i++) {
        char c = buffer[i];
        if (c < '0' || c > '9') {
          sink.append(buffer, start, i - start);
          position = i - 1;
          return c;
        }
      }
      sink.append(buffer, start, filled - start);
      position = filled - 1;
    }

    return EOF;
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
