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

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.fail;
import static org.openqa.selenium.WaitingConditions.elementTextToEqual;
import static org.openqa.selenium.support.ui.ExpectedConditions.titleIs;
import static org.openqa.selenium.support.ui.ExpectedConditions.visibilityOfElementLocated;
import static org.openqa.selenium.testing.drivers.Browser.CHROME;
import static org.openqa.selenium.testing.drivers.Browser.EDGE;
import static org.openqa.selenium.testing.drivers.Browser.SAFARI;

import java.time.Duration;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JupiterTestBase;
import org.openqa.selenium.testing.NeedsFreshDriver;
import org.openqa.selenium.testing.NotYetImplemented;

public class PageLoadTimeOutTest extends JupiterTestBase {

  // Note: If this test ever fixed/enabled on Firefox, check if it also needs @NoDriverAfterTest OR
  // if @NoDriverAfterTest can be removed from some other tests in this class.
  @Test
  @NotYetImplemented(SAFARI)
  public void testPageLoadTimeoutCanBeChanged() {
    testPageLoadTimeoutIsEnforced(2);
    testPageLoadTimeoutIsEnforced(3);
  }

  @Test
  @NotYetImplemented(SAFARI)
  public void testCanHandleSequentialPageLoadTimeouts() {
    long pageLoadTimeout = 2;
    long pageLoadTimeBuffer = 10;
    driver.manage().timeouts().pageLoadTimeout(Duration.ofSeconds(2));
    assertPageLoadTimeoutIsEnforced(pageLoadTimeout, pageLoadTimeBuffer);
    assertPageLoadTimeoutIsEnforced(pageLoadTimeout, pageLoadTimeBuffer);
  }

  @Test
  void testShouldTimeoutIfAPageTakesTooLongToLoad() {
    try {
      testPageLoadTimeoutIsEnforced(2);
    } finally {
      driver.manage().timeouts().pageLoadTimeout(Duration.ofSeconds(300));
    }

    // Load another page after get() timed out but before test HTTP server served previous page.
    driver.get(pages.xhtmlTestPage);
    wait.until(titleIs("XHTML Test Page"));
  }

  @Test
  @Ignore(value = SAFARI, reason = "Flaky")
  public void testShouldTimeoutIfAPageTakesTooLongToLoadAfterClick() {
    driver.manage().timeouts().pageLoadTimeout(Duration.ofSeconds(2));

    driver.get(appServer.whereIs("page_with_link_to_slow_loading_page.html"));
    WebElement link = wait.until(visibilityOfElementLocated(By.id("link-to-slow-loading-page")));

    long start = System.currentTimeMillis();
    try {
      link.click();
      fail("I should have timed out");
    } catch (RuntimeException e) {
      long end = System.currentTimeMillis();

      assertThat(e).isInstanceOf(TimeoutException.class);

      int duration = (int) (end - start);
      assertThat(duration).isGreaterThan(2000);
      assertThat(duration).isLessThan(5000);
    } finally {
      driver.manage().timeouts().pageLoadTimeout(Duration.ofSeconds(300));
    }

    // Load another page after get() timed out but before test HTTP server served previous page.
    driver.get(pages.xhtmlTestPage);
    wait.until(titleIs("XHTML Test Page"));
  }

  @Test
  @Ignore(value = CHROME, reason = "Flaky")
  @Ignore(value = EDGE, reason = "Flaky")
  @NeedsFreshDriver
  public void testShouldTimeoutIfAPageTakesTooLongToRefresh() {
    // Get the sleeping servlet with a pause of 5 seconds
    String slowPage = appServer.whereIs("sleep?time=5");

    driver.get(slowPage);

    driver.manage().timeouts().pageLoadTimeout(Duration.ofSeconds(2));

    long start = System.currentTimeMillis();
    try {
      driver.navigate().refresh();
      fail("I should have timed out");
    } catch (RuntimeException e) {
      long end = System.currentTimeMillis();

      assertThat(e).isInstanceOf(TimeoutException.class);

      int duration = (int) (end - start);
      assertThat(duration).isGreaterThanOrEqualTo(2000);
      assertThat(duration).isLessThan(4000);
    } finally {
      driver.manage().timeouts().pageLoadTimeout(Duration.ofSeconds(300));
    }

    // Load another page after get() timed out but before test HTTP server served previous page.
    driver.get(pages.xhtmlTestPage);
    wait.until(titleIs("XHTML Test Page"));
  }

  @Test
  @NotYetImplemented(CHROME)
  @NotYetImplemented(EDGE)
  @NotYetImplemented(value = SAFARI)
  public void testShouldNotStopLoadingPageAfterTimeout() {
    try {
      testPageLoadTimeoutIsEnforced(1);
    } finally {
      driver.manage().timeouts().pageLoadTimeout(Duration.ofSeconds(300));
    }

    new WebDriverWait(driver, Duration.ofSeconds(30))
        .ignoring(StaleElementReferenceException.class)
        .until(elementTextToEqual(By.tagName("body"), "Slept for 11s"));
  }

  /**
   * Sets given pageLoadTimeout to the {@link #driver} and asserts that attempt to navigate to a
   * page that takes much longer (10 seconds longer) to load results in a TimeoutException.
   *
   * <p>Side effects: 1) {@link #driver} is configured to use given pageLoadTimeout, 2) test HTTP
   * server still didn't serve the page to browser (some browsers may still be waiting for the page
   * to load despite the fact that driver responded with the timeout).
   */
  private void testPageLoadTimeoutIsEnforced(long webDriverPageLoadTimeout) {
    // Test page will load this many seconds longer than WD pageLoadTimeout.
    long pageLoadTimeBuffer = 10;
    driver.manage().timeouts().pageLoadTimeout(Duration.ofSeconds(webDriverPageLoadTimeout));
    assertPageLoadTimeoutIsEnforced(webDriverPageLoadTimeout, pageLoadTimeBuffer);
  }

  private void assertPageLoadTimeoutIsEnforced(
      long webDriverPageLoadTimeout, long pageLoadTimeBuffer) {
    long start = System.currentTimeMillis();
    try {
      driver.get(
          appServer.whereIs("sleep?time=" + (webDriverPageLoadTimeout + pageLoadTimeBuffer)));
      fail("I should have timed out after " + webDriverPageLoadTimeout + " seconds");
    } catch (RuntimeException e) {
      long end = System.currentTimeMillis();

      assertThat(e).isInstanceOf(TimeoutException.class);

      long duration = end - start;
      assertThat(duration).isGreaterThanOrEqualTo(webDriverPageLoadTimeout * 1000);
      assertThat(duration).isLessThan((webDriverPageLoadTimeout + pageLoadTimeBuffer) * 1000);
    }
  }
}
