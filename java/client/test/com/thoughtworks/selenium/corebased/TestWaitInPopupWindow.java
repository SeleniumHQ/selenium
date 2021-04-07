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

public class TestWaitInPopupWindow extends InternalSelenseTestBase {
  @Test
  public void testWaitInPopupWindow() {
    selenium.open("test_select_window.html");
    selenium.click("popupPage");
    selenium.waitForPopUp("myPopupWindow", "5000");
    selenium.selectWindow("myPopupWindow");
    verifyEquals(selenium.getTitle(), "Select Window Popup");
    selenium.setTimeout("5000");
    selenium.click("link=Click to load new page");
    selenium.waitForPageToLoad("30000");
    verifyEquals(selenium.getTitle(), "Reload Page");
    selenium.setTimeout("30000");
    selenium.click("link=Click here");
    selenium.waitForPageToLoad("30000");
    verifyEquals(selenium.getTitle(), "Slow Loading Page");
    selenium.close();
    selenium.selectWindow("null");
  }
}
