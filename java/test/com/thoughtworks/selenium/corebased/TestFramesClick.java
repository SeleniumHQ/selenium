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

public class TestFramesClick extends InternalSelenseTestBase {
  @Test
  public void testFramesClick() throws Exception {
    selenium.open("Frames.html");
    selenium.selectFrame("mainFrame");
    selenium.open("test_click_page1.html");
    // Click a regular link
    verifyEquals(selenium.getText("link"), "Click here for next page");
    selenium.click("link");
    selenium.waitForPageToLoad("30000");
    verifyEquals(selenium.getTitle(), "Click Page Target");
    selenium.click("previousPage");
    selenium.waitForPageToLoad("30000");
    verifyEquals(selenium.getTitle(), "Click Page 1");
    // Click a link with an enclosed image
    selenium.click("linkWithEnclosedImage");
    selenium.waitForPageToLoad("30000");
    verifyEquals(selenium.getTitle(), "Click Page Target");
    selenium.click("previousPage");
    selenium.waitForPageToLoad("30000");
    // Click an image enclosed by a link
    selenium.click("enclosedImage");
    selenium.waitForPageToLoad("30000");
    verifyEquals(selenium.getTitle(), "Click Page Target");
    selenium.click("previousPage");
    selenium.waitForPageToLoad("30000");
    // Click a link with an href anchor target within this page
    selenium.click("linkToAnchorOnThisPage");
    verifyEquals(selenium.getTitle(), "Click Page 1");
    // Click a link where onclick returns false
    selenium.click("linkWithOnclickReturnsFalse");
    // Need a pause to give the page a chance to reload (so this test can fail)
    Thread.sleep(300);
    verifyEquals(selenium.getTitle(), "Click Page 1");
    selenium.setTimeout("5000");
    selenium.open("test_click_page1.html");
    // TODO Click a link with a target attribute
  }
}
