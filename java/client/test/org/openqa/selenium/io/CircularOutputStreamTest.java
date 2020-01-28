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

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.Test;

import java.io.ByteArrayOutputStream;
import java.io.PrintStream;
import java.io.PrintWriter;

public class CircularOutputStreamTest {
  @Test
  public void testShouldReturnTheEntireWrittenContentIfSmallerThanTheBufferSize() throws Exception {
    String expected = "foo";
    int maxSize = expected.getBytes().length;

    try (CircularOutputStream os = new CircularOutputStream(maxSize)) {
      os.write(expected.getBytes());

      String seen = os.toString();

      assertThat(seen).isEqualTo(expected);
    }
  }

  @Test
  public void testShouldReturnJustTheWrittenOutputIfBufferIsTooLarge() throws Exception {
    String expected = "foo";
    // Note, this makes the buffer larger than what we write to it
    int maxSize = expected.getBytes().length + 1;

    try (CircularOutputStream os = new CircularOutputStream(maxSize)) {
      os.write(expected.getBytes());

      String seen = os.toString();

      assertThat(seen).isEqualTo(expected);
    }
  }

  @Test
  public void testShouldTruncateOutputToMatchTheSizeOfTheBuffer() throws Exception {
    String expected = "oo";
    int maxSize = expected.getBytes().length;

    try (CircularOutputStream os = new CircularOutputStream(maxSize)) {
      os.write("foo".getBytes());

      String seen = os.toString();

      assertThat(seen).isEqualTo(expected);
    }
  }

  @Test
  public void testShouldReturnContentInTheCorrectOrder() throws Exception {
    String expected = "234";
    int maxSize = expected.getBytes().length;

    try (CircularOutputStream os = new CircularOutputStream(maxSize)) {
      os.write("1234".getBytes());

      String seen = os.toString();

      assertThat(seen).isEqualTo(expected);
    }
  }

  @Test
  public void testLongerMultiLineOutputPreservesJustTheEnd() {
    int maxSize = 64;

    ByteArrayOutputStream baos = new ByteArrayOutputStream();
    PrintStream bps = new PrintStream(baos, true);
    Throwable throwable = new Throwable();
    throwable.printStackTrace(bps);
    String expected = baos.toString();
    expected = expected.substring(expected.length() - maxSize);
    bps.close();

    CircularOutputStream os = new CircularOutputStream(maxSize);
    PrintStream cops = new PrintStream(os, true);
    throwable.printStackTrace(cops);
    String seen = os.toString();
    cops.close();

    assertThat(seen).isEqualTo(expected);
  }

  @Test
  public void testCircularness() {
    CircularOutputStream os = new CircularOutputStream(5);
    try (PrintWriter pw = new PrintWriter(os, true)) {

      pw.write("12345");
      pw.flush();
      assertThat(os.toString()).isEqualTo("12345");

      pw.write("6");
      pw.flush();
      assertThat(os.toString()).isEqualTo("23456");

      pw.write("789");
      pw.flush();
      assertThat(os.toString()).isEqualTo("56789");
    }
  }

  @Test
  public void testConcurrentWrites() throws InterruptedException {
    final int bytesToWrite = 10000;
    CircularOutputStream os = new CircularOutputStream(2 * bytesToWrite);

    Thread t1 = new Thread(new WriteChar(os, 'a', bytesToWrite));
    Thread t2 = new Thread(new WriteChar(os, 'b', bytesToWrite));
    t1.start();
    t2.start();
    t1.join();
    t2.join();

    int a = 0;
    int b = 0;
    for (char c : os.toString().toCharArray()) {
      if (c == 'a') {
        a++;
      } else if (c == 'b') {
        b++;
      }
    }
    assertThat(a).isEqualTo(bytesToWrite);
    assertThat(b).isEqualTo(bytesToWrite);
  }

  private static class WriteChar implements Runnable {
    private final CircularOutputStream stream;
    private final char c;
    private final int count;

    public WriteChar(CircularOutputStream stream, char c, int count) {
      this.stream = stream;
      this.c = c;
      this.count = count;
    }

    @Override
    public void run() {
      for (int i = 0; i < count; i++) {
        stream.write(c);
        Thread.yield();
      }
    }
  }
}
