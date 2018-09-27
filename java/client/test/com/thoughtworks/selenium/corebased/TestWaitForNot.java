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

import org.junit.Test;

import java.util.regex.Pattern;

public class TestWaitForNot extends InternalSelenseTestBase {
  @Test
  public void testWaitForNot() throws Exception {
    selenium.open("../tests/html/test_async_event.html");
    assertEquals(selenium.getValue("theField"), "oldValue");
    selenium.click("theButton");
    assertEquals(selenium.getValue("theField"), "oldValue");
    for (int second = 0;; second++) {
      if (second >= 60) fail("timeout");
      try {
        if (!Pattern.compile("oldValu[aei]").matcher(selenium.getValue("theField")).find()) break;
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
        if (!Pattern.compile("Some te[xyz]t").matcher(selenium.getText("theSpan")).find()) break;
      } catch (Exception e) {
      }
      Thread.sleep(1000);
    }

    verifyEquals(selenium.getText("theSpan"), "Some new text");
  }
}
