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

package com.thoughtworks.selenium;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;

@Disabled("Test page does not load")
public class I18nTest extends InternalSelenseTestBase {

  @BeforeEach
  public void navigateToPage() {
    selenium.open("../tests/html/test_locators.html");
  }

  @Test
  public void testRomance() {
    String expected =
      "\u00FC\u00F6\u00E4\u00DC\u00D6\u00C4 \u00E7\u00E8\u00E9 \u00BF\u00F1 \u00E8\u00E0\u00F9\u00F2";
    String id = "romance";
    verifyText(expected, id);
  }

  @Test
  public void testKorean() {
    String expected = "\uC5F4\uC5D0";
    String id = "korean";
    verifyText(expected, id);
  }

  @Test
  public void testChinese() {
    String expected = "\u4E2D\u6587";
    String id = "chinese";
    verifyText(expected, id);
  }

  @Test
  public void testJapanese() {
    String expected = "\u307E\u3077";
    String id = "japanese";
    verifyText(expected, id);
  }

  @Test
  public void testDangerous() {
    String expected = "&%?\\+|,%*";
    String id = "dangerous";
    verifyText(expected, id);
  }

  @Test
  public void testDangerousLabels() {
    String[] labels = selenium.getSelectOptions("dangerous-labels");
    Assertions.assertEquals(3, labels.length, "Wrong number of labels");
    Assertions.assertEquals("veni, vidi, vici", labels[0], "mangled label");
    Assertions.assertEquals("c:\\foo\\bar", labels[1], "mangled label");
    Assertions.assertEquals("c:\\I came, I \\saw\\, I conquered", labels[2], "mangled label");
  }

  private void verifyText(String expected, String id) {
    assertTrue(selenium.isTextPresent(expected));
    String actual = selenium.getText(id);
    Assertions.assertEquals(expected, actual, id + " characters didn't match");
  }


}
