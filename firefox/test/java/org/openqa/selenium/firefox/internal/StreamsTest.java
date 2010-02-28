/*
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.

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

import org.junit.Test;

import java.io.IOException;

public class StreamsTest extends TestCase {

  @Test
  public void testStreamExtraction() throws IOException {
//    InputStream stream = new ByteArrayInputStream("foo".getBytes());
//    assertEquals("foo", new String(Streams.drainStream(stream)));
  }
  
  @Test
  public void testNullStreamIsQuiet() throws IOException {
    assertNull(Streams.drainStream(null));
  }
}
