/*
Copyright 2011 Selenium committers

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

package org.openqa.selenium.html5;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.junit.Assume.assumeTrue;

import static org.openqa.selenium.testing.Ignore.Driver.ANDROID;
import static org.openqa.selenium.testing.Ignore.Driver.CHROME;
import static org.openqa.selenium.testing.Ignore.Driver.HTMLUNIT;
import static org.openqa.selenium.testing.Ignore.Driver.IE;
import static org.openqa.selenium.testing.Ignore.Driver.IPHONE;
import static org.openqa.selenium.testing.Ignore.Driver.OPERA;
import static org.openqa.selenium.testing.Ignore.Driver.SAFARI;
import static org.openqa.selenium.testing.Ignore.Driver.SELENESE;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JUnit4TestBase;
import org.openqa.selenium.testing.TestUtilities;
import org.openqa.selenium.testing.drivers.WebDriverBuilder;

public class WebStorageControlTest extends JUnit4TestBase {

  private WebDriver localDriver;

  @Before
  public void checkIsFireFoxDriver() {
    assumeTrue(TestUtilities.isFirefox(driver));
  }

  @Ignore({ANDROID,CHROME,HTMLUNIT,IE,IPHONE,OPERA,SAFARI,SELENESE})
  @Test
  public void testDisableWebStorageCapability() {
    localDriver = createWebDriverWithWebStorage(false);
    assertFalse("Web storage is available but should not be", checkForWebStorage(localDriver));
  }

  @Ignore({ANDROID,CHROME,HTMLUNIT,IE,IPHONE,OPERA,SAFARI,SELENESE})
  @Test
  public void testEnableWebStorageCapability() {
    localDriver = createWebDriverWithWebStorage(true);
    assertTrue("Web storage is not available but should be", checkForWebStorage(localDriver));
  }

  @After
  public void quitDriver() {
    if (this.localDriver != null) {
      this.localDriver.quit();
      this.localDriver = null;
    }
  }

  private WebDriver createWebDriverWithWebStorage(boolean webStorageSupportOn) {
    DesiredCapabilities c = new DesiredCapabilities();
    c.setCapability(CapabilityType.SUPPORTS_WEB_STORAGE, webStorageSupportOn);
    WebDriverBuilder builder = new WebDriverBuilder().setCapabilities(c);
    return builder.get();
  }

  private boolean checkForWebStorage(WebDriver driver) {
    return (Boolean) ((JavascriptExecutor)driver).executeScript("return !!window.localStorage");
  }

}
