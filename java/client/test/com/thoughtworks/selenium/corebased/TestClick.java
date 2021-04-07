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

public class TestClick extends InternalSelenseTestBase {
  @Test
  public void testClick() throws Exception {
    selenium.open("test_click_page1.html");
    verifyEquals(selenium.getText("link"), "Click here for next page");
    selenium.click("link");
    selenium.waitForPageToLoad("30000");
    verifyEquals(selenium.getTitle(), "Click Page Target");
    selenium.click("previousPage");
    selenium.waitForPageToLoad("30000");
    verifyEquals(selenium.getTitle(), "Click Page 1");
    selenium.click("linkWithEnclosedImage");
    selenium.waitForPageToLoad("30000");
    verifyEquals(selenium.getTitle(), "Click Page Target");
    selenium.click("previousPage");
    selenium.waitForPageToLoad("30000");
    selenium.click("enclosedImage");
    selenium.waitForPageToLoad("30000");
    verifyEquals(selenium.getTitle(), "Click Page Target");
    selenium.click("previousPage");
    selenium.waitForPageToLoad("30000");
    selenium.click("extraEnclosedImage");
    selenium.waitForPageToLoad("30000");
    verifyEquals(selenium.getTitle(), "Click Page Target");
    selenium.click("previousPage");
    selenium.waitForPageToLoad("30000");
    selenium.click("linkToAnchorOnThisPage");
    verifyEquals(selenium.getTitle(), "Click Page 1");
    try {
      selenium.waitForPageToLoad("500");
      fail("expected failure");
    } catch (Throwable e) {
    }
    selenium.setTimeout("30000");
    selenium.click("linkWithOnclickReturnsFalse");
    Thread.sleep(300);
    verifyEquals(selenium.getTitle(), "Click Page 1");
    selenium.setTimeout("5000");
    selenium.open("test_click_page1.html");
    selenium.doubleClick("doubleClickable");
    assertEquals(selenium.getAlert(), "double clicked!");
  }
}
