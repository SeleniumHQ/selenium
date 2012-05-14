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

import static org.junit.Assert.assertEquals;

import org.junit.Test;

import java.io.ByteArrayOutputStream;
import java.io.PrintStream;
import java.io.PrintWriter;

public class CircularOutputStreamTest {
  @Test
  public void testShouldReturnTheEntireWrittenContentIfSmallerThanTheBufferSize() throws Exception {
    String expected = "foo";
    int maxSize = expected.getBytes().length;

    CircularOutputStream os = new CircularOutputStream(maxSize);
    os.write(expected.getBytes());

    String seen = os.toString();

    assertEquals(expected, seen);
  }

  @Test
  public void testShouldReturnJustTheWrittenOutputIfBufferIsTooLarge() throws Exception {
    String expected = "foo";
    // Note, this makes the buffer larger than what we write to it
    int maxSize = expected.getBytes().length + 1;

    CircularOutputStream os = new CircularOutputStream(maxSize);
    os.write(expected.getBytes());

    String seen = os.toString();

    assertEquals(expected, seen);
  }

  @Test
  public void testShouldTruncateOutputToMatchTheSizeOfTheBuffer() throws Exception {
    String expected = "oo";
    int maxSize = expected.getBytes().length;

    CircularOutputStream os = new CircularOutputStream(maxSize);
    os.write("foo".getBytes());

    String seen = os.toString();

    assertEquals(expected, seen);
  }

  @Test
  public void testShouldReturnContentInTheCorrectOrder() throws Exception {
    String expected = "234";
    int maxSize = expected.getBytes().length;

    CircularOutputStream os = new CircularOutputStream(maxSize);
    os.write("1234".getBytes());

    String seen = os.toString();

    assertEquals(expected, seen);
  }

  @Test
  public void testLongerMultiLineOutputPreservesJustTheEnd() throws Exception {
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

    assertEquals(expected, seen);
  }

  @Test
  public void testCircularness() {
    CircularOutputStream os = new CircularOutputStream(5);
    PrintWriter pw = new PrintWriter(os, true);

    pw.write("12345");
    pw.flush();
    assertEquals("12345", os.toString());

    pw.write("6");
    pw.flush();
    assertEquals("23456", os.toString());

    pw.write("789");
    pw.flush();
    assertEquals("56789", os.toString());
  }
}
