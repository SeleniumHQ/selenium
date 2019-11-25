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
import com.thoughtworks.selenium.SeleniumException;

import org.junit.Test;

public class TestCursorPosition extends InternalSelenseTestBase {
  @Test
  public void testCursorPosition() {
    selenium.open("test_type_page1.html");
    try {
      assertEquals(selenium.getCursorPosition("username"), "8");
      fail("expected failure");
    } catch (Throwable e) {
    }
    selenium.windowFocus();
    verifyEquals(selenium.getValue("username"), "");
    selenium.type("username", "TestUser");
    selenium.setCursorPosition("username", "0");

    Number position = 0;
    try {
      position = selenium.getCursorPosition("username");
    } catch (SeleniumException e) {
      if (!isWindowInFocus(e)) {
        return;
      }
    }
    verifyEquals(position.toString(), "0");
    selenium.setCursorPosition("username", "-1");
    verifyEquals(selenium.getCursorPosition("username"), "8");
    selenium.refresh();
    selenium.waitForPageToLoad("30000");
    try {
      assertEquals(selenium.getCursorPosition("username"), "8");
      fail("expected failure");
    } catch (Throwable e) {
    }
  }

  private boolean isWindowInFocus(SeleniumException e) {
    if (e.getMessage().contains("There is no cursor on this page")) {
      System.out.println("Test failed because window does not have focus");
      return false;
    }
    return true;
  }
}
