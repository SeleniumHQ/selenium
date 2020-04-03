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
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.junit.Assume.assumeFalse;
import static org.openqa.selenium.Platform.ANDROID;
import static org.openqa.selenium.WaitingConditions.newWindowIsOpened;
import static org.openqa.selenium.WaitingConditions.windowHandleCountToBe;
import static org.openqa.selenium.WaitingConditions.windowHandleCountToBeGreaterThan;
import static org.openqa.selenium.support.ui.ExpectedConditions.alertIsPresent;
import static org.openqa.selenium.testing.TestUtilities.getEffectivePlatform;
import static org.openqa.selenium.testing.drivers.Browser.EDGE;
import static org.openqa.selenium.testing.drivers.Browser.FIREFOX;
import static org.openqa.selenium.testing.drivers.Browser.HTMLUNIT;
import static org.openqa.selenium.testing.drivers.Browser.IE;
import static org.openqa.selenium.testing.drivers.Browser.MARIONETTE;
import static org.openqa.selenium.testing.drivers.Browser.OPERA;
import static org.openqa.selenium.testing.drivers.Browser.OPERABLINK;
import static org.openqa.selenium.testing.drivers.Browser.SAFARI;
import static org.openqa.selenium.testing.TestUtilities.isIe6;
import static org.openqa.selenium.testing.TestUtilities.isInternetExplorer;

import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.TestRule;
import org.junit.rules.TestWatcher;
import org.junit.runner.Description;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JUnit4TestBase;
import org.openqa.selenium.testing.NoDriverAfterTest;
import org.openqa.selenium.testing.NotYetImplemented;
import org.openqa.selenium.testing.SwitchToTopAfterTest;
import org.openqa.selenium.testing.TestUtilities;
import org.openqa.selenium.testing.drivers.Browser;

import java.util.Set;
import java.util.stream.Collectors;

public class WindowSwitchingTest extends JUnit4TestBase {

  @Rule
  public final TestRule switchToMainWindow = new TestWatcher() {
    private String mainWindow;

    @Override
    protected void starting(Description description) {
      super.starting(description);
      mainWindow = driver.getWindowHandle();
    }

    @Override
    protected void finished(Description description) {
      try {
        driver.getWindowHandles().stream().filter(handle -> ! mainWindow.equals(handle))
            .forEach(handle -> driver.switchTo().window(handle).close());
      } catch (Exception ignore) {
      }
      try {
        driver.switchTo().window(mainWindow);
      } catch (Exception ignore) {
      }
      super.finished(description);
    }
  };

  @SwitchToTopAfterTest
  @NoDriverAfterTest(failedOnly = true)
  @Test
  public void testShouldSwitchFocusToANewWindowWhenItIsOpenedAndNotStopFutureOperations() {
    assumeFalse(Browser.detect() == Browser.OPERA &&
                getEffectivePlatform(driver).is(Platform.WINDOWS));

    driver.get(pages.xhtmlTestPage);
    Set<String> currentWindowHandles = driver.getWindowHandles();

    driver.findElement(By.linkText("Open new window")).click();

    wait.until(newWindowIsOpened(currentWindowHandles));

    assertThat(driver.getTitle()).isEqualTo("XHTML Test Page");

    driver.switchTo().window("result");
    assertThat(driver.getTitle()).isEqualTo("We Arrive Here");

    driver.get(pages.iframePage);
    final String handle = driver.getWindowHandle();
    driver.findElement(By.id("iframe_page_heading"));
    driver.switchTo().frame("iframe1");
    assertThat(driver.getWindowHandle()).isEqualTo(handle);
  }

  @Test
  public void testShouldThrowNoSuchWindowException() {
    driver.get(pages.xhtmlTestPage);
    assertThatExceptionOfType(NoSuchWindowException.class)
        .isThrownBy(() -> driver.switchTo().window("invalid name"));
  }

  @NoDriverAfterTest(failedOnly = true)
  @Test
  @NotYetImplemented(SAFARI)
  public void testShouldThrowNoSuchWindowExceptionOnAnAttemptToGetItsHandle() {
    driver.get(pages.xhtmlTestPage);
    Set<String> currentWindowHandles = driver.getWindowHandles();

    driver.findElement(By.linkText("Open new window")).click();

    wait.until(newWindowIsOpened(currentWindowHandles));

    driver.switchTo().window("result");
    driver.close();

    assertThatExceptionOfType(NoSuchWindowException.class).isThrownBy(driver::getWindowHandle);
  }

  @NoDriverAfterTest(failedOnly = true)
  @Test
  public void testShouldThrowNoSuchWindowExceptionOnAnyOperationIfAWindowIsClosed() {
    driver.get(pages.xhtmlTestPage);
    Set<String> currentWindowHandles = driver.getWindowHandles();

    driver.findElement(By.linkText("Open new window")).click();

    wait.until(newWindowIsOpened(currentWindowHandles));

    driver.switchTo().window("result");
    driver.close();

    assertThatExceptionOfType(NoSuchWindowException.class).isThrownBy(driver::getTitle);

    assertThatExceptionOfType(NoSuchWindowException.class)
        .isThrownBy(() -> driver.findElement(By.tagName("body")));
  }

  @NoDriverAfterTest(failedOnly = true)
  @Test
  public void testShouldThrowNoSuchWindowExceptionOnAnyElementOperationIfAWindowIsClosed() {
    driver.get(pages.xhtmlTestPage);
    Set<String> currentWindowHandles = driver.getWindowHandles();

    driver.findElement(By.linkText("Open new window")).click();

    wait.until(newWindowIsOpened(currentWindowHandles));

    driver.switchTo().window("result");
    WebElement body = driver.findElement(By.tagName("body"));
    driver.close();

    assertThatExceptionOfType(NoSuchWindowException.class).isThrownBy(body::getText);
  }

  @NoDriverAfterTest
  @Test
  @Ignore(IE)
  public void testShouldBeAbleToIterateOverAllOpenWindows() {
    driver.get(pages.xhtmlTestPage);
    String original = driver.getWindowHandle();
    driver.findElement(By.name("windowOne")).click();
    driver.switchTo().window(original);
    driver.findElement(By.name("windowTwo")).click();

    wait.until(windowHandleCountToBeGreaterThan(2));

    Set<String> allWindowHandles = driver.getWindowHandles();

    // There should be three windows. We should also see each of the window titles at least once.
    Set<String> allWindowTitles = allWindowHandles.stream().map(handle -> {
      driver.switchTo().window(handle);
      return driver.getTitle();
    }).collect(Collectors.toSet());

    assertThat(allWindowHandles).hasSize(3);
    assertThat(allWindowTitles).hasSize(3);
  }

  @Test
  public void testClickingOnAButtonThatClosesAnOpenWindowDoesNotCauseTheBrowserToHang()
      throws Exception {
    assumeFalse(Browser.detect() == Browser.OPERA &&
                getEffectivePlatform(driver).is(Platform.WINDOWS));

    driver.get(pages.xhtmlTestPage);
    Set<String> currentWindowHandles = driver.getWindowHandles();

    driver.findElement(By.name("windowThree")).click();

    wait.until(newWindowIsOpened(currentWindowHandles));

    driver.switchTo().window("result");

    // TODO Remove sleep when https://bugs.chromium.org/p/chromedriver/issues/detail?id=1044 is fixed.
    if (TestUtilities.isChrome(driver) && getEffectivePlatform(driver).is(ANDROID)) {
      Thread.sleep(1000);
    }

    wait.until(ExpectedConditions.presenceOfElementLocated(By.id("close"))).click();

    if (isInternetExplorer(driver) && !isIe6(driver)) {
      Alert alert = wait.until(alertIsPresent());
      alert.accept();
    }

    // If we make it this far, we're all good.
  }

  @Test
  @Ignore(SAFARI)
  @Ignore(EDGE)
  public void testCanCallGetWindowHandlesAfterClosingAWindow() throws Exception {
    assumeFalse(Browser.detect() == Browser.OPERA &&
                getEffectivePlatform(driver).is(Platform.WINDOWS));
    boolean isNewIE = isInternetExplorer(driver) && !isIe6(driver);

    driver.get(pages.xhtmlTestPage);

    Set<String> currentWindowHandles = driver.getWindowHandles();

    driver.findElement(By.name("windowThree")).click();

    wait.until(newWindowIsOpened(currentWindowHandles));

    driver.switchTo().window("result");
    int allWindowHandles = driver.getWindowHandles().size();
    assertThat(allWindowHandles).isEqualTo(currentWindowHandles.size() + 1);

    // TODO Remove sleep when https://bugs.chromium.org/p/chromedriver/issues/detail?id=1044 is fixed.
    if (TestUtilities.isChrome(driver) && getEffectivePlatform(driver).is(ANDROID)) {
      Thread.sleep(1000);
    }

    wait.until(ExpectedConditions.presenceOfElementLocated(By.id("close"))).click();

    if (isNewIE) {
      Alert alert = wait.until(alertIsPresent());
      alert.accept();
    }

    Set<String> allHandles = wait.until(windowHandleCountToBe(allWindowHandles - 1));

    assertThat(allHandles).hasSameSizeAs(currentWindowHandles);
  }

  @Test
  public void testCanObtainAWindowHandle() {
    driver.get(pages.xhtmlTestPage);
    assertThat(driver.getWindowHandle()).isNotNull();
  }

  @Test
  public void testFailingToSwitchToAWindowLeavesTheCurrentWindowAsIs() {
    driver.get(pages.xhtmlTestPage);
    String current = driver.getWindowHandle();

    assertThatExceptionOfType(NoSuchWindowException.class)
        .isThrownBy(() -> driver.switchTo().window("i will never exist"));

    String newHandle = driver.getWindowHandle();
    assertThat(newHandle).isEqualTo(current);
  }

  @NoDriverAfterTest(failedOnly = true)
  @Test
  public void testCanCloseWindowWhenMultipleWindowsAreOpen() {
    driver.get(pages.xhtmlTestPage);
    String mainHandle = driver.getWindowHandle();

    Set<String> currentWindowHandles = driver.getWindowHandles();

    driver.findElement(By.name("windowOne")).click();

    wait.until(newWindowIsOpened(currentWindowHandles));

    Set<String> allWindowHandles = driver.getWindowHandles();

    // There should be two windows. We should also see each of the window titles at least once.
    assertThat(allWindowHandles).hasSize(2);

    allWindowHandles.stream().filter(anObject -> ! mainHandle.equals(anObject)).forEach(handle -> {
      driver.switchTo().window(handle);
      driver.close();
    });

    assertThat(driver.getWindowHandles()).hasSize(1);
  }

  @NoDriverAfterTest(failedOnly = true)
  @Test
  public void testCanCloseWindowAndSwitchBackToMainWindow() {
    driver.get(pages.xhtmlTestPage);

    Set<String> currentWindowHandles = driver.getWindowHandles();
    String mainHandle = driver.getWindowHandle();

    driver.findElement(By.name("windowOne")).click();

    wait.until(newWindowIsOpened(currentWindowHandles));

    Set<String> allWindowHandles = driver.getWindowHandles();

    // There should be two windows. We should also see each of the window titles at least once.
    assertThat(allWindowHandles).hasSize(2);

    allWindowHandles.stream().filter(anObject -> ! mainHandle.equals(anObject)).forEach(handle -> {
      driver.switchTo().window(handle);
      driver.close();
    });

    driver.switchTo().window(mainHandle);

    String newHandle = driver.getWindowHandle();
    assertThat(newHandle).isEqualTo(mainHandle);

    assertThat(driver.getWindowHandles()).hasSize(1);
  }

  @NoDriverAfterTest
  @Test
  public void testClosingOnlyWindowShouldNotCauseTheBrowserToHang() {
    driver.get(pages.xhtmlTestPage);
    driver.close();
  }

  @NoDriverAfterTest(failedOnly = true)
  @Test
  @Ignore(value = MARIONETTE, issue = "https://github.com/mozilla/geckodriver/issues/610")
  public void testShouldFocusOnTheTopMostFrameAfterSwitchingToAWindow() {
    driver.get(appServer.whereIs("window_switching_tests/page_with_frame.html"));

    Set<String> currentWindowHandles = driver.getWindowHandles();
    String mainWindow = driver.getWindowHandle();

    driver.findElement(By.id("a-link-that-opens-a-new-window")).click();
    wait.until(newWindowIsOpened(currentWindowHandles));

    driver.switchTo().frame("myframe");

    driver.switchTo().window("newWindow");
    driver.close();
    driver.switchTo().window(mainWindow);

    driver.findElement(By.name("myframe"));
  }

  @NoDriverAfterTest(failedOnly = true)
  @Test
  @NotYetImplemented(HTMLUNIT)
  @NotYetImplemented(OPERABLINK)
  @NotYetImplemented(EDGE)
  @Ignore(FIREFOX)
  @Ignore(OPERA)
  public void canOpenANewWindow() {
    driver.get(pages.xhtmlTestPage);

    String mainWindow = driver.getWindowHandle();
    driver.switchTo().newWindow(WindowType.TAB);

    assertThat(driver.getWindowHandles()).hasSize(2);

    // no wait, the command should block until the new window is ready
    String newHandle = driver.getWindowHandle();
    assertThat(newHandle).isNotEqualTo(mainWindow);

    driver.close();
    driver.switchTo().window(mainWindow);
  }
}
