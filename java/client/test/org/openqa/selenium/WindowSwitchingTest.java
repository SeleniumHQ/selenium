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

package org.openqa.selenium;

import static org.openqa.selenium.Ignore.Driver.FIREFOX;
import static org.openqa.selenium.Ignore.Driver.IE;
import static org.openqa.selenium.Ignore.Driver.IPHONE;
import static org.openqa.selenium.Ignore.Driver.OPERA;
import static org.openqa.selenium.Ignore.Driver.CHROME;
import static org.openqa.selenium.Ignore.Driver.REMOTE;
import static org.openqa.selenium.Ignore.Driver.SELENESE;
import static org.openqa.selenium.TestWaiter.waitFor;
import static org.openqa.selenium.WaitingConditions.elementToExist;
import static org.openqa.selenium.WaitingConditions.windowHandleCountToBe;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.equalTo;

import java.util.HashSet;
import java.util.Set;

@Ignore(value = {IPHONE}, reason = "The iPhone only supports one window")
public class WindowSwitchingTest extends AbstractDriverTestCase {

  @Ignore({SELENESE})
  public void testShouldSwitchFocusToANewWindowWhenItIsOpenedAndNotStopFutureOperations() {
    driver.get(pages.xhtmlTestPage);
    String current = driver.getWindowHandle();

    driver.findElement(By.linkText("Open new window")).click();

    sleepBecauseWindowsTakeTimeToOpen();

    assertThat(driver.getTitle(), equalTo("XHTML Test Page"));

    driver.switchTo().window("result");
    assertThat(driver.getTitle(), equalTo("We Arrive Here"));

    driver.get(pages.iframePage);
    final String handle = driver.getWindowHandle();
    driver.findElement(By.id("iframe_page_heading"));
    driver.switchTo().frame("iframe1");
    assertThat(driver.getWindowHandle(), equalTo(handle));

    driver.switchTo().window(current);
  }

  @Ignore({SELENESE, OPERA})
  public void testShouldThrowNoSuchWindowException() {
    driver.get(pages.xhtmlTestPage);
    String current = driver.getWindowHandle();

    try {
      driver.switchTo().window("invalid name");
      fail("NoSuchWindowException expected");
    } catch (NoSuchWindowException e) {
      // Expected.
    }

    driver.switchTo().window(current);
  }

  @Ignore({FIREFOX, OPERA, CHROME, REMOTE, SELENESE})
  public void testShouldThrowNoSuchWindowExceptionIfAWindowIsClosed() {
    driver.get(pages.xhtmlTestPage);
    String current = driver.getWindowHandle();

    driver.findElement(By.linkText("Open new window")).click();

    sleepBecauseWindowsTakeTimeToOpen();

    driver.switchTo().window("result");
    driver.close();

    try {
      driver.getWindowHandle();
      fail("NoSuchWindowException expected");
    } catch (NoSuchWindowException e) {
      // Expected.
    }

    driver.switchTo().window(current);
  }

  @NeedsFreshDriver
  @NoDriverAfterTest
  @Ignore({IE, FIREFOX, OPERA, REMOTE, SELENESE})
  public void testShouldBeAbleToIterateOverAllOpenWindows() throws Exception {
    driver.get(pages.xhtmlTestPage);
    driver.findElement(By.name("windowOne")).click();
    driver.findElement(By.name("windowTwo")).click();

    Set<String> allWindowHandles = driver.getWindowHandles();

    // There should be three windows. We should also see each of the window titles at least once.
    Set<String> seenHandles = new HashSet<String>();
    for (String handle : allWindowHandles) {
      assertFalse(seenHandles.contains(handle));
      driver.switchTo().window(handle);
      seenHandles.add(handle);
    }

    assertEquals(3, allWindowHandles.size());
  }

  @Ignore(value = {IE, SELENESE, OPERA},
      reason = "IE: can show a dialog 'The web page you are viewing is trying to close the window'")
  public void testClickingOnAButtonThatClosesAnOpenWindowDoesNotCauseTheBrowserToHang() {
    driver.get(pages.xhtmlTestPage);

    String currentHandle = driver.getWindowHandle();

    driver.findElement(By.name("windowThree")).click();

    driver.switchTo().window("result");

    try {
      waitFor(elementToExist(driver, "close"));
      driver.findElement(By.id("close")).click();
      // If we make it this far, we're all good.
    } finally {
      driver.switchTo().window(currentHandle);
      driver.findElement(By.id("linkId"));
    }
  }

  @Ignore({IE, SELENESE, OPERA})
  @JavascriptEnabled
  public void testCanCallGetWindowHandlesAfterClosingAWindow() {
    driver.get(pages.xhtmlTestPage);

    String currentHandle = driver.getWindowHandle();

    driver.findElement(By.name("windowThree")).click();

    driver.switchTo().window("result");
    int currentWindowHandles = driver.getWindowHandles().size();

    try {
      waitFor(elementToExist(driver, "close")).click();
      Set<String> allHandles = waitFor(windowHandleCountToBe(driver, currentWindowHandles - 1));

      assertEquals(1, allHandles.size());
    } finally {
      driver.switchTo().window(currentHandle);
    }
  }

  @Ignore({SELENESE})
  public void testCanObtainAWindowHandle() {
    driver.get(pages.xhtmlTestPage);

    String currentHandle = driver.getWindowHandle();

    assertNotNull(currentHandle);
  }

  @Ignore({SELENESE})
  public void testFailingToSwitchToAWindowLeavesTheCurrentWindowAsIs() {
    driver.get(pages.xhtmlTestPage);
    String current = driver.getWindowHandle();

    try {
      driver.switchTo().window("i will never exist");
      fail("Should not be ablt to change to a non-existant window");
    } catch (NoSuchWindowException e) {
      // expected
    }

    String newHandle = driver.getWindowHandle();

    assertEquals(current, newHandle);
  }

  @NeedsFreshDriver
  @NoDriverAfterTest
  @Ignore(value = {SELENESE})
  public void testCanCloseWindowWhenMultipleWindowsAreOpen() {
    driver.get(pages.xhtmlTestPage);
    driver.findElement(By.name("windowOne")).click();

    sleepBecauseWindowsTakeTimeToOpen();

    Set<String> allWindowHandles = driver.getWindowHandles();

    // There should be two windows. We should also see each of the window titles at least once.
    assertEquals(2, allWindowHandles.size());
    String handle1 = (String) allWindowHandles.toArray()[1];
    driver.switchTo().window(handle1);
    driver.close();
    allWindowHandles = driver.getWindowHandles();
    assertEquals(1, allWindowHandles.size());
  }

  @NeedsFreshDriver
  @NoDriverAfterTest
  @Ignore(value = {SELENESE})
  public void testCanCloseWindowAndSwitchBackToMainWindow() {
    driver.get(pages.xhtmlTestPage);
    driver.findElement(By.name("windowOne")).click();

    sleepBecauseWindowsTakeTimeToOpen();

    Set<String> allWindowHandles = driver.getWindowHandles();

    // There should be two windows. We should also see each of the window titles at least once.
    assertEquals(2, allWindowHandles.size());
    String mainHandle = (String) allWindowHandles.toArray()[0];
    String handle1 = (String) allWindowHandles.toArray()[1];
    driver.switchTo().window(handle1);
    driver.close();
    driver.switchTo().window(mainHandle);

    String newHandle = driver.getWindowHandle();
    assertEquals(mainHandle, newHandle);
  }

  private void sleepBecauseWindowsTakeTimeToOpen() {
    try {
      Thread.sleep(1000);
    } catch (InterruptedException e) {
      fail("Interrupted");
    }
  }

  @NeedsFreshDriver
  @NoDriverAfterTest
  @Ignore({SELENESE, OPERA})
  public void testClosingOnlyWindowShouldNotCauseTheBrowserToHang() {
    driver.get(pages.xhtmlTestPage);
    driver.close();
  }
}
