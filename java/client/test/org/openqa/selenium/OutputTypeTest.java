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
package org.openqa.selenium;

import org.junit.Test;

import java.io.File;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

public class OutputTypeTest {
  public static final String TEST_BASE64 = "ABADABAD";
  public static final byte[] TEST_BYTES = new byte[] {0, 16, 3, 0, 16, 3};

  @Test
  public void testBase64() {
    assertEquals(TEST_BASE64, OutputType.BASE64.convertFromBase64Png(TEST_BASE64));
  }

  @Test
  public void testBytes() {
    byte[] bytes = OutputType.BYTES
        .convertFromBase64Png(TEST_BASE64);
    assertEquals(TEST_BYTES.length, bytes.length);
    for (int i = 0; i < TEST_BYTES.length; i++) {
      assertEquals("index " + i, TEST_BYTES[i], bytes[i]);
    }
  }

  @Test
  public void testFiles() {
    File tmpFile = OutputType.FILE
        .convertFromBase64Png(TEST_BASE64);
    assertTrue(tmpFile.exists());
    assertEquals(TEST_BYTES.length, tmpFile.length());
    tmpFile.delete();
  }
}
