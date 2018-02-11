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

package org.openqa.selenium;

import org.junit.Test;
import org.openqa.selenium.testing.JUnit4TestBase;

/**
 * Bug 126 identified an instance where the HtmlUnitDriver threw a NullPointerException, {@see <a
 * href=http://code.google.com/p/webdriver/issues/detail?id=126>link to bug 126 </a>} This testsuite
 * calls various methods to confirm the expected NPEs happen, once HtmlUnitDriver (and any others if
 * necessary) is fixed they'll serve as regression tests :)
 */
public class ObjectStateAssumptionsTest extends JUnit4TestBase {

  @Test
  public void testUninitializedWebDriverDoesNotThrowNPE() {
    try {
      variousMethodCallsToCheckAssumptions();
    } catch (NullPointerException npe) {
      throw new IllegalStateException("Assumptions broken for a fresh WebDriver instance", npe);
    } catch (WebDriverException e) {
      // this is fine.
    } catch (UnsupportedOperationException e) {
      // This is okay too.
    }
  }

  /**
   * This test case differs from @see testUninitializedWebDriverDoesNotThrowNPE as it initializes
   * WebDriver with an initial call to get(). It also should not fail.
   */
  @Test
  public void testInitializedWebDriverDoesNotThrowNPE() {
    driver.get(pages.simpleTestPage);
    try {
      variousMethodCallsToCheckAssumptions();
    } catch (NullPointerException npe) {
      throw new IllegalStateException(
          "Assumptions broken for WebDriver instance after get() called", npe);
    }
  }

  /**
   * Add the various method calls you want to try here...
   */
  private void variousMethodCallsToCheckAssumptions() {
    driver.getCurrentUrl();
    driver.getTitle();
    driver.getPageSource();
    By byHtml = By.xpath("//html");
    driver.findElement(byHtml);
    driver.findElements(byHtml);
  }

  /**
   * Test the various options, again for an uninitialized driver, NPEs are thrown.
   */
  @Test
  public void testOptionsForUninitializedWebDriver() {
    WebDriver.Options options = driver.manage();
    try {
      options.getCookies();
    } catch (NullPointerException npe) {
      throw new IllegalStateException("Assumptions broken for a fresh WebDriver instance", npe);
    }
  }
}
