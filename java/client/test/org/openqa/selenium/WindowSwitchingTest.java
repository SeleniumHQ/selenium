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

import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.instanceOf;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertThat;
import static org.junit.Assume.assumeFalse;
import static org.openqa.selenium.Platform.ANDROID;
import static org.openqa.selenium.WaitingConditions.newWindowIsOpened;
import static org.openqa.selenium.WaitingConditions.windowHandleCountToBe;
import static org.openqa.selenium.WaitingConditions.windowHandleCountToBeGreaterThan;
import static org.openqa.selenium.support.ui.ExpectedConditions.alertIsPresent;
import static org.openqa.selenium.testing.Driver.IE;
import static org.openqa.selenium.testing.Driver.MARIONETTE;
import static org.openqa.selenium.testing.TestUtilities.catchThrowable;

import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.TestRule;
import org.junit.rules.TestWatcher;
import org.junit.runner.Description;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JUnit4TestBase;
import org.openqa.selenium.testing.NoDriverAfterTest;
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
    assumeFalse(Browser.detect() == Browser.opera &&
                TestUtilities.getEffectivePlatform().is(Platform.WINDOWS));

    driver.get(pages.xhtmlTestPage);
    Set<String> currentWindowHandles = driver.getWindowHandles();

    driver.findElement(By.linkText("Open new window")).click();

    wait.until(newWindowIsOpened(currentWindowHandles));

    assertThat(driver.getTitle(), equalTo("XHTML Test Page"));

    driver.switchTo().window("result");
    assertThat(driver.getTitle(), equalTo("We Arrive Here"));

    driver.get(pages.iframePage);
    final String handle = driver.getWindowHandle();
    driver.findElement(By.id("iframe_page_heading"));
    driver.switchTo().frame("iframe1");
    assertThat(driver.getWindowHandle(), equalTo(handle));
  }

  @Test
  public void testShouldThrowNoSuchWindowException() {
    driver.get(pages.xhtmlTestPage);
    Throwable t = catchThrowable(() -> driver.switchTo().window("invalid name"));
    assertThat(t, instanceOf(NoSuchWindowException.class));
  }

  @NoDriverAfterTest(failedOnly = true)
  @Test
  public void testShouldThrowNoSuchWindowExceptionOnAnAttemptToGetItsHandle() {
    driver.get(pages.xhtmlTestPage);
    Set<String> currentWindowHandles = driver.getWindowHandles();

    driver.findElement(By.linkText("Open new window")).click();

    wait.until(newWindowIsOpened(currentWindowHandles));

    driver.switchTo().window("result");
    driver.close();

    Throwable t = catchThrowable(driver::getWindowHandle);
    assertThat(t, instanceOf(NoSuchWindowException.class));
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

    Throwable t = catchThrowable(driver::getTitle);
    assertThat(t, instanceOf(NoSuchWindowException.class));

    Throwable t2 = catchThrowable(() -> driver.findElement(By.tagName("body")));
    assertThat(t2, instanceOf(NoSuchWindowException.class));
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

    Throwable t = catchThrowable(body::getText);
    assertThat(t, instanceOf(NoSuchWindowException.class));
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

    assertEquals(3, allWindowHandles.size());
    assertEquals(3, allWindowTitles.size());
  }

  @Test
  public void testClickingOnAButtonThatClosesAnOpenWindowDoesNotCauseTheBrowserToHang()
      throws Exception {
    assumeFalse(Browser.detect() == Browser.opera &&
                TestUtilities.getEffectivePlatform().is(Platform.WINDOWS));

    driver.get(pages.xhtmlTestPage);
    Boolean isIEDriver = TestUtilities.isInternetExplorer(driver);
    Boolean isIE6 = TestUtilities.isIe6(driver);
    Set<String> currentWindowHandles = driver.getWindowHandles();

    driver.findElement(By.name("windowThree")).click();

    wait.until(newWindowIsOpened(currentWindowHandles));

    driver.switchTo().window("result");

    // TODO Remove sleep when https://code.google.com/p/chromedriver/issues/detail?id=1044 is fixed.
    if (TestUtilities.isChrome(driver) && TestUtilities.getEffectivePlatform(driver).is(ANDROID)) {
      Thread.sleep(1000);
    }

    wait.until(ExpectedConditions.presenceOfElementLocated(By.id("close"))).click();

    if (isIEDriver && !isIE6) {
      Alert alert = wait.until(alertIsPresent());
      alert.accept();
    }

    // If we make it this far, we're all good.
  }

  @Test
  public void testCanCallGetWindowHandlesAfterClosingAWindow() throws Exception {
    assumeFalse(Browser.detect() == Browser.opera &&
                TestUtilities.getEffectivePlatform().is(Platform.WINDOWS));

    driver.get(pages.xhtmlTestPage);

    Boolean isIEDriver = TestUtilities.isInternetExplorer(driver);
    Boolean isIE6 = TestUtilities.isIe6(driver);
    Set<String> currentWindowHandles = driver.getWindowHandles();

    driver.findElement(By.name("windowThree")).click();

    wait.until(newWindowIsOpened(currentWindowHandles));

    driver.switchTo().window("result");
    int allWindowHandles = driver.getWindowHandles().size();

    // TODO Remove sleep when https://code.google.com/p/chromedriver/issues/detail?id=1044 is fixed.
    if (TestUtilities.isChrome(driver) && TestUtilities.getEffectivePlatform(driver).is(ANDROID)) {
      Thread.sleep(1000);
    }

    wait.until(ExpectedConditions.presenceOfElementLocated(By.id("close"))).click();

    if (isIEDriver && !isIE6) {
      Alert alert = wait.until(alertIsPresent());
      alert.accept();
    }

    Set<String> allHandles = wait.until(windowHandleCountToBe(allWindowHandles - 1));

    assertEquals(currentWindowHandles.size(), allHandles.size());
  }

  @Test
  public void testCanObtainAWindowHandle() {
    driver.get(pages.xhtmlTestPage);
    assertNotNull(driver.getWindowHandle());
  }

  @Test
  public void testFailingToSwitchToAWindowLeavesTheCurrentWindowAsIs() {
    driver.get(pages.xhtmlTestPage);
    String current = driver.getWindowHandle();

    Throwable t = catchThrowable(() -> driver.switchTo().window("i will never exist"));
    assertThat(t, instanceOf(NoSuchWindowException.class));

    String newHandle = driver.getWindowHandle();
    assertEquals(current, newHandle);
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
    assertEquals(2, allWindowHandles.size());

    allWindowHandles.stream().filter(anObject -> ! mainHandle.equals(anObject)).forEach(handle -> {
      driver.switchTo().window(handle);
      driver.close();
    });

    assertEquals(1, driver.getWindowHandles().size());
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
    assertEquals(2, allWindowHandles.size());

    allWindowHandles.stream().filter(anObject -> ! mainHandle.equals(anObject)).forEach(handle -> {
      driver.switchTo().window(handle);
      driver.close();
    });

    driver.switchTo().window(mainHandle);

    String newHandle = driver.getWindowHandle();
    assertEquals(mainHandle, newHandle);

    assertEquals(1, driver.getWindowHandles().size());
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

}
