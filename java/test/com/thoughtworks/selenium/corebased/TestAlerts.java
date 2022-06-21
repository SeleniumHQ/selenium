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

import org.junit.jupiter.api.Test;

import java.util.regex.Pattern;

public class TestAlerts extends InternalSelenseTestBase {
  @Test
  public void testAlerts() throws Exception {
    selenium.open("test_verify_alert.html");
    verifyFalse(selenium.isAlertPresent());
    assertFalse(selenium.isAlertPresent());
    selenium.click("oneAlert");
    verifyTrue(selenium.isAlertPresent());
    for (int second = 0;; second++) {
      if (second >= 60) fail("timeout");
      try {
        if (selenium.isAlertPresent()) break;
      } catch (Exception e) {
      }
      Thread.sleep(1000);
    }

    assertTrue(selenium.isAlertPresent());
    verifyEquals(selenium.getAlert(), "Store Below 494 degrees K!");
    selenium.click("multipleLineAlert");
    verifyEquals(selenium.getAlert(), "This alert spans multiple lines");
    selenium.click("oneAlert");
    String myVar = selenium.getAlert();
    verifyEquals(selenium.getExpression(myVar), "Store Below 494 degrees K!");
    selenium.click("twoAlerts");
    verifyTrue(selenium.getAlert().matches("^[\\s\\S]* 220 degrees C!$"));
    verifyTrue(Pattern.compile("^Store Below 429 degrees F!").matcher(selenium.getAlert()).find());
    selenium.click("alertAndLeave");
    selenium.waitForPageToLoad("30000");
    verifyEquals(selenium.getAlert(), "I'm Melting! I'm Melting!");
    selenium.open("test_verify_alert.html");
    try {
      assertEquals(selenium.getAlert(), "noAlert");
      fail("expected failure");
    } catch (Throwable e) {
    }
    selenium.click("oneAlert");
    try {
      assertEquals(selenium.getAlert(), "wrongAlert");
      fail("expected failure");
    } catch (Throwable e) {
    }
    selenium.click("twoAlerts");
    try {
      assertEquals(selenium.getAlert(), "Store Below 429 degrees F!");
      fail("expected failure");
    } catch (Throwable e) {
    }
    try {
      assertEquals(selenium.getAlert(), "Store Below 220 degrees C!");
      fail("expected failure");
    } catch (Throwable e) {
    }
    selenium.click("oneAlert");
    try {
      selenium.open("../tests/html/test_verify_alert.html");
      fail("expected failure");
    } catch (Throwable e) {
    }
  }
}
