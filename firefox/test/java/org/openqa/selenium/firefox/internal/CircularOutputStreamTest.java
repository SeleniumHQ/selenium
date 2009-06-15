/*
Copyright 2009 WebDriver committers
Copyright 2009 Google Inc.

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


package org.openqa.selenium.firefox.internal;

import junit.framework.TestCase;

import java.nio.charset.Charset;
import java.io.PrintStream;
import java.io.ByteArrayOutputStream;

public class CircularOutputStreamTest extends TestCase {

  private Charset utf8;

  @Override
  protected void setUp() throws Exception {
    super.setUp();

    utf8 = Charset.forName("UTF-8");
  }

  public void testShouldReturnTheEntireWrittenContentIfSmallerThanTheBufferSize() throws Exception {
    String expected = "foo";
    int maxSize = expected.getBytes(utf8).length;

    CircularOutputStream os = new CircularOutputStream(maxSize);
    os.write(expected.getBytes(utf8));

    String seen = os.toString(utf8);

    assertEquals(expected, seen);
  }
  
  public void testShouldReturnJustTheWrittenOutputIfBufferIsTooLarge() throws Exception {
    String expected = "foo";
    // Note, this makes the buffer larger than what we write to it
    int maxSize = expected.getBytes(utf8).length + 1;

    CircularOutputStream os = new CircularOutputStream(maxSize);
    os.write(expected.getBytes(utf8));

    String seen = os.toString(utf8);

    assertEquals(expected, seen);
  }

  public void testShouldTruncateOutputToMatchTheSizeOfTheBuffer() throws Exception {
    String expected = "oo";
    int maxSize = expected.getBytes(utf8).length;

    CircularOutputStream os = new CircularOutputStream(maxSize);
    os.write("foo".getBytes(utf8));

    String seen = os.toString(utf8);

    assertEquals(expected, seen);
  }

  public void testShouldReturnContentInTheCorrectOrder() throws Exception {
    String expected = "234";
    int maxSize = expected.getBytes(utf8).length;

    CircularOutputStream os = new CircularOutputStream(maxSize);
    os.write("1234".getBytes(utf8));

    String seen = os.toString(utf8);

    assertEquals(expected, seen);
  }

  public void testLongerMultiLineOutputPreservesJustTheEnd() throws Exception {
    int maxSize = 64;

    ByteArrayOutputStream baos = new ByteArrayOutputStream();
    PrintStream bps = new PrintStream(baos, true);
    Throwable throwable = new Throwable();
    throwable.printStackTrace(bps);
    String expected = baos.toString(utf8.toString());
    expected = expected.substring(expected.length() - maxSize);
    bps.close();

    CircularOutputStream os = new CircularOutputStream(maxSize);
    PrintStream cops = new PrintStream(os, true);
    throwable.printStackTrace(cops);
    String seen = os.toString(utf8);
    cops.close();

    assertEquals(expected, seen);
  }
}
