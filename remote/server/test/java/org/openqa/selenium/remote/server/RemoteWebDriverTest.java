/*
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package org.openqa.selenium.remote.server;

import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.browserlaunchers.CapabilityType;
import org.openqa.selenium.remote.Augmenter;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.remote.ScreenshotException;
import org.openqa.selenium.AbstractDriverTestCase;
import org.openqa.selenium.By;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.JavascriptEnabled;
import org.openqa.selenium.JavascriptExecutor;

import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;
import static org.openqa.selenium.OutputType.BASE64;

public class RemoteWebDriverTest extends AbstractDriverTestCase {
  public void testShouldBeAbleToGrabASnapshotOnException() {
    driver.get(pages.simpleTestPage);

    try {
      driver.findElement(By.id("doesnayexist"));
      fail();
    } catch (NoSuchElementException e) {
      assertTrue(e.getCause() instanceof ScreenshotException);
      assertTrue(((ScreenshotException) e.getCause()).getBase64EncodedScreenshot().length() > 0);
    }
  }

  /**
   * Issue 248
   * @see <a href="http://code.google.com/p/webdriver/issues/detail?id=248">Issue 248</a>
   */
  @JavascriptEnabled
  public void testShouldBeAbleToCallIsJavascriptEnabled() {
    assertTrue(((JavascriptExecutor) driver).isJavascriptEnabled());
  }

  public void testCanAugmentWebDriverInstanceIfNecessary() {
    if (!(driver instanceof RemoteWebDriver)) {
      System.out.println("Skipping test: driver is not a remote webdriver");
      return;
    }

    RemoteWebDriver remote = (RemoteWebDriver) driver;
    Boolean screenshots = (Boolean) remote.getCapabilities()
        .getCapability(CapabilityType.TAKES_SCREENSHOT);
    if (screenshots == null || !screenshots) {
      System.out.println("Skipping test: remote driver cannot take screenshots");
    }

    driver.get(pages.formPage);
    WebDriver toUse = new Augmenter().augment(driver);
    String screenshot = ((TakesScreenshot) toUse).getScreenshotAs(BASE64);

    assertTrue(screenshot.length() > 0);
  }
}
