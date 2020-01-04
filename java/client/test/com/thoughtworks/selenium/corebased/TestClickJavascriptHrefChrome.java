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

public class TestClickJavascriptHrefChrome extends InternalSelenseTestBase {
  @Test
  public void testClickJavascriptHrefChrome() {
    selenium.open("test_click_javascript_chrome_page.html");
    selenium.click("id=a");
    verifyEquals(selenium.getAlert(), "a");
    selenium.click("id=b");
    verifyEquals(selenium.getAlert(), "b");
    selenium.click("id=c");
    verifyEquals(selenium.getAlert(), "c");
    selenium.click("id=d");
    verifyFalse(selenium.isElementPresent("id=d"));
    selenium.click("id=e");
    verifyEquals(selenium.getAlert(), "e");
    verifyFalse(selenium.isElementPresent("id=e"));
    selenium.click("id=f");
    selenium.waitForPopUp("f-window", "10000");
    selenium.selectWindow("name=f-window");
    verifyTrue(selenium.isElementPresent("id=visibleParagraph"));
    selenium.close();
    selenium.selectWindow("");

    // TODO(simon): re-enable this part of the test
    // selenium.click("id=g");
    // verifyEquals(selenium.getAlert(), "g");
    // selenium.waitForPopUp("g-window", "10000");
    // selenium.selectWindow("name=g-window");
    // verifyTrue(selenium.isElementPresent("id=visibleParagraph"));
    // selenium.close();
    // selenium.selectWindow("");
    selenium.click("id=h");
    selenium.waitForPageToLoad("30000");
    verifyEquals(selenium.getAlert(), "h");
    verifyTrue(selenium.isElementPresent("id=visibleParagraph"));
  }
}
