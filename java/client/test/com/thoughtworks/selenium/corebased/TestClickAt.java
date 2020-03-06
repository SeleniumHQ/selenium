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

import org.junit.Ignore;
import org.junit.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.HasCapabilities;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WrapsDriver;
import org.openqa.selenium.remote.CapabilityType;

@Ignore()
public class TestClickAt extends InternalSelenseTestBase {
  @Test(timeout = 60000)
  public void testClickAt() throws Exception {
    selenium.open("test_click_page1.html");
    verifyEquals(selenium.getText("link"), "Click here for next page");
    selenium.clickAt("link", "0,0");
    selenium.waitForPageToLoad("30000");
    verifyEquals(selenium.getTitle(), "Click Page Target");
    selenium.click("previousPage");
    selenium.waitForPageToLoad("30000");
    selenium.clickAt("link", "10,5");
    selenium.waitForPageToLoad("30000");
    verifyEquals(selenium.getTitle(), "Click Page Target");
    selenium.click("previousPage");
    selenium.waitForPageToLoad("30000");
    verifyEquals(selenium.getTitle(), "Click Page 1");
    selenium.clickAt("linkWithEnclosedImage", "0,0");
    selenium.waitForPageToLoad("30000");
    verifyEquals(selenium.getTitle(), "Click Page Target");
    selenium.click("previousPage");
    selenium.waitForPageToLoad("30000");
    selenium.clickAt("linkWithEnclosedImage", "600,5");
    selenium.waitForPageToLoad("30000");
    verifyEquals(selenium.getTitle(), "Click Page Target");
    selenium.click("previousPage");
    selenium.waitForPageToLoad("30000");
    selenium.clickAt("enclosedImage", "0,0");
    selenium.waitForPageToLoad("30000");
    verifyEquals(selenium.getTitle(), "Click Page Target");
    selenium.click("previousPage");
    selenium.waitForPageToLoad("30000");
    // Pixel count is 0-based, not 1-based. In addition, current implementation
    // of Utils.getLocation adds 3 pixels to the x offset. Until that's fixed,
    // do not attempt to click at the edge of the image.
    selenium.clickAt("enclosedImage", "640,40");
    selenium.waitForPageToLoad("30000");
    verifyEquals(selenium.getTitle(), "Click Page Target");
    selenium.click("previousPage");
    selenium.waitForPageToLoad("30000");
    selenium.clickAt("extraEnclosedImage", "0,0");
    selenium.waitForPageToLoad("30000");
    verifyEquals(selenium.getTitle(), "Click Page Target");
    selenium.click("previousPage");
    selenium.waitForPageToLoad("30000");
    selenium.clickAt("extraEnclosedImage", "643,40");
    selenium.waitForPageToLoad("30000");
    verifyEquals(selenium.getTitle(), "Click Page Target");
    selenium.click("previousPage");
    selenium.waitForPageToLoad("30000");
    selenium.clickAt("linkToAnchorOnThisPage", "0,0");
    verifyEquals(selenium.getTitle(), "Click Page 1");
    selenium.clickAt("linkToAnchorOnThisPage", "10,5");
    verifyEquals(selenium.getTitle(), "Click Page 1");
    try {
      selenium.waitForPageToLoad("500");
      fail("expected failure");
    } catch (Throwable e) {
    }
    selenium.setTimeout("30000");
    selenium.clickAt("linkWithOnclickReturnsFalse", "0,0");
    Thread.sleep(300);
    verifyEquals(selenium.getTitle(), "Click Page 1");
    selenium.clickAt("linkWithOnclickReturnsFalse", "10,5");
    Thread.sleep(300);
    verifyEquals(selenium.getTitle(), "Click Page 1");

    if (isUsingNativeEvents()) {
      // Click outside the element and make sure we don't pass to the next page.
      selenium.clickAt("linkWithEnclosedImage", "650,0");
      selenium.waitForPageToLoad("30000");
      verifyEquals(selenium.getTitle(), "Click Page 1");
      selenium.clickAt("linkWithEnclosedImage", "660,20");
      selenium.waitForPageToLoad("30000");
      verifyEquals(selenium.getTitle(), "Click Page 1");
      selenium.setTimeout("5000");
    }
  }

  private boolean isUsingNativeEvents() {
    if (!(selenium instanceof WrapsDriver)) {
      return false;
    }

    WebDriver driver = ((WrapsDriver) selenium).getWrappedDriver();
    if (!(driver instanceof HasCapabilities)) {
      return false;
    }

    Capabilities capabilities = ((HasCapabilities) driver).getCapabilities();
    return capabilities.is(CapabilityType.HAS_NATIVE_EVENTS);
  }
}
