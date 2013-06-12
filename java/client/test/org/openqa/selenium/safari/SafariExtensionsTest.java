/*
Copyright 2013 Selenium committers

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

package org.openqa.selenium.safari;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.assertFalse;
import org.openqa.selenium.testing.InProject;

import org.openqa.selenium.By;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.safari.SafariOptions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.TimeoutException;

import org.junit.AfterClass;
import org.junit.Test;

import java.io.File;

public class SafariExtensionsTest extends SafariTestBase {

  @AfterClass
  public static void quitDriver() {
    SafariTestBase.quitDriver();
  }

  private void createRegularSession() {
    quitDriver();

    DesiredCapabilities capabilities = DesiredCapabilities.safari();
    driver = actuallyCreateDriver(capabilities);
    driver.get(pages.blankPage);
  }

  private void createSessionWithExtension() {
    quitDriver();

    DesiredCapabilities capabilities = DesiredCapabilities.safari();
    File extensionFile = InProject.locate(
        "java/client/test/org/openqa/selenium/safari/setAttribute.safariextz");
    SafariOptions safariOptions = new SafariOptions();
    safariOptions.addExtensions(extensionFile);
    capabilities.setCapability(SafariOptions.CAPABILITY, safariOptions);

    driver = actuallyCreateDriver(capabilities);
    driver.get(pages.blankPage);
  }

  private boolean isCustomExtensionInstalled() {
    try {
      // The dummy extension sets a HTML attribute on the <html> element.
      By by = By.cssSelector("html[istestsafariextzinstalled759='yes']");
      (new WebDriverWait(driver, 2))
        .until(ExpectedConditions.presenceOfElementLocated(by));
      return true; // attribute found
    } catch (TimeoutException e) {}
    return false; // attribute not found
  }

  @Test
  public void shouldStartWithoutCustomExtensionByDefault() {
    createRegularSession();
    assertFalse(isCustomExtensionInstalled());
  }

  @Test
  public void shouldStartWithCustomExtensionIfRequested() {
    createSessionWithExtension();
    assertTrue(isCustomExtensionInstalled());
  }

  @Test
  public void shouldRemoveExtensionOnDriverQuit() {
    createSessionWithExtension();
    assertTrue(isCustomExtensionInstalled());

    createRegularSession();
    assertFalse(isCustomExtensionInstalled());
  }
}
