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

package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.InternalSelenseTestBase;

import org.junit.After;
import org.junit.Test;

import java.util.regex.Pattern;

public class TestWaitFor extends InternalSelenseTestBase {
  @Test
  public void testWaitFor() throws Exception {
    selenium.open("test_async_event.html");
    assertEquals(selenium.getValue("theField"), "oldValue");
    selenium.click("theButton");
    assertEquals(selenium.getValue("theField"), "oldValue");
    for (int second = 0;; second++) {
      if (second >= 60) fail("timeout");
      try {
        if (Pattern.compile("n[aeiou]wValue").matcher(selenium.getValue("theField")).find()) break;
      } catch (Exception e) {
      }
      Thread.sleep(1000);
    }

    verifyEquals(selenium.getValue("theField"), "newValue");
    assertEquals(selenium.getText("theSpan"), "Some text");
    selenium.click("theSpanButton");
    assertEquals(selenium.getText("theSpan"), "Some text");
    for (int second = 0;; second++) {
      if (second >= 60) fail("timeout");
      try {
        if (Pattern.compile("Some n[aeiou]w text").matcher(selenium.getText("theSpan")).find())
          break;
      } catch (Exception e) {
      }
      Thread.sleep(1000);
    }

    verifyEquals(selenium.getText("theSpan"), "Some new text");
    selenium.click("theAlertButton");
    for (int second = 0;; second++) {
      if (second >= 60) fail("timeout");
      try {
        if (Pattern.compile("An [aeiou]lert").matcher(selenium.getAlert()).find()) break;
      } catch (Exception e) {
      }
      Thread.sleep(1000);
    }

    selenium.open("test_reload_onchange_page.html");
    selenium.click("theLink");
    for (int second = 0;; second++) {
      if (second >= 60) fail("timeout");
      try {
        if ("Slow Loading Page".equals(selenium.getTitle())) break;
      } catch (Exception e) {
      }
      Thread.sleep(1000);
    }

    verifyEquals(selenium.getTitle(), "Slow Loading Page");
    selenium.setTimeout("500");
    try {
      for (int second = 0;; second++) {
        if (second >= 60) fail("timeout");
        try {
          if (selenium.isTextPresent("thisTextIsNotPresent")) break;
        } catch (Exception e) {
        }
        Thread.sleep(1000);
      }
      fail("expected failure");
    } catch (Throwable e) {
    }
  }

  @After
  public void resetTimeout() {
    selenium.setTimeout("30000");
  }
}
