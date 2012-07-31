/*
Copyright 2012 Software Freedom Conservancy
Copyright 2011-2012 Selenium committers

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

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.interactions.MoveTargetOutOfBoundsException;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JUnit4TestBase;
import org.openqa.selenium.testing.JavascriptEnabled;
import org.openqa.selenium.testing.TestUtilities;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;
import static org.openqa.selenium.TestWaiter.waitFor;
import static org.openqa.selenium.WaitingConditions.windowHandleCountToBe;
import static org.openqa.selenium.testing.Ignore.Driver.ALL;
import static org.openqa.selenium.testing.Ignore.Driver.ANDROID;
import static org.openqa.selenium.testing.Ignore.Driver.CHROME;
import static org.openqa.selenium.testing.Ignore.Driver.HTMLUNIT;
import static org.openqa.selenium.testing.Ignore.Driver.IPHONE;
import static org.openqa.selenium.testing.Ignore.Driver.OPERA;
import static org.openqa.selenium.testing.Ignore.Driver.OPERA_MOBILE;
import static org.openqa.selenium.testing.Ignore.Driver.SAFARI;
import static org.openqa.selenium.testing.Ignore.Driver.SELENESE;

public class ClickTest extends JUnit4TestBase {

  @Before
  public void setUp() throws Exception {
    driver.get(pages.clicksPage);
  }

  @After
  public void tearDown() throws Exception {
    driver.switchTo().defaultContent();
  }

  @Test
  public void testCanClickOnALinkAndFollowIt() {
    driver.findElement(By.id("normal")).click();

    waitFor(WaitingConditions.pageTitleToBe(driver, "XHTML Test Page"));
  }

  @Ignore(value = {CHROME, OPERA, SELENESE},
          reason = "Not tested on these browsers.")
  @Test
  public void testCanClickOnALinkThatOverflowsAndFollowIt() {
    driver.findElement(By.id("overflowLink")).click();

    waitFor(WaitingConditions.pageTitleToBe(driver, "XHTML Test Page"));
  }

  @JavascriptEnabled
  @Test
  public void testCanClickOnAnAnchorAndNotReloadThePage() {
    ((JavascriptExecutor) driver).executeScript("document.latch = true");

    driver.findElement(By.id("anchor")).click();

    Boolean samePage = (Boolean) ((JavascriptExecutor) driver)
        .executeScript("return document.latch");

    assertEquals("Latch was reset", Boolean.TRUE, samePage);
  }

  @Ignore(value = {OPERA, ANDROID, OPERA_MOBILE},
          reason = "Opera: Incorrect runtime retrieved, Android: A bug in emulator JSC engine on " +
                   "2.2, works on devices.")
  @Test
  public void testCanClickOnALinkThatUpdatesAnotherFrame() {
    driver.switchTo().frame("source");

    driver.findElement(By.id("otherframe")).click();
    driver.switchTo().defaultContent().switchTo().frame("target");

    waitFor(WaitingConditions.pageSourceToContain(driver, "Hello WebDriver"));
  }

  @JavascriptEnabled
  @Ignore(value = {SELENESE, OPERA, ANDROID, OPERA_MOBILE},
          reason = "Opera: Incorrect runtime retrieved; " +
                   "Android: fails when running with other tests.")
  @Test
  public void testElementsFoundByJsCanLoadUpdatesInAnotherFrame() {
    driver.switchTo().frame("source");

    WebElement toClick = (WebElement) ((JavascriptExecutor) driver).executeScript(
        "return document.getElementById('otherframe');"
    );
    toClick.click();
    driver.switchTo().defaultContent().switchTo().frame("target");

    assertTrue("Target did not reload",
               driver.getPageSource().contains("Hello WebDriver"));
  }

  @JavascriptEnabled
  @Ignore(value = {SELENESE, OPERA, ANDROID, OPERA_MOBILE}, reason =
      "Opera: Incorrect runtime retrieved, Android: fails when running with other tests.")
  @Test
  public void testJsLoactedElementsCanUpdateFramesIfFoundSomehowElse() {
    driver.switchTo().frame("source");

    // Prime the cache of elements
    driver.findElement(By.id("otherframe"));

    // This _should_ return the same element
    WebElement toClick = (WebElement) ((JavascriptExecutor) driver).executeScript(
        "return document.getElementById('otherframe');"
    );
    toClick.click();
    driver.switchTo().defaultContent().switchTo().frame("target");

    assertTrue("Target did not reload",
               driver.getPageSource().contains("Hello WebDriver"));
  }

  @JavascriptEnabled
  @Test
  public void testCanClickOnAnElementWithTopSetToANegativeNumber() {
    String page = appServer.whereIs("styledPage.html");
    driver.get(page);
    WebElement searchBox = driver.findElement(By.name("searchBox"));
    searchBox.sendKeys("Cheese");
    driver.findElement(By.name("btn")).click();

    String log = driver.findElement(By.id("log")).getText();
    assertEquals("click", log);
  }

  @Ignore(ALL) //TODO(danielwh): Unignore
  @Test
  public void testShouldClickOnFirstBoundingClientRectWithNonZeroSize() {
    driver.findElement(By.id("twoClientRects")).click();
    waitFor(WaitingConditions.pageTitleToBe(driver, "XHTML Test Page"));
  }

  @JavascriptEnabled
  @Ignore(value = {ANDROID, CHROME, HTMLUNIT, OPERA, SELENESE}, reason = "Not implemented")
  @Test
  public void testShouldSetRelatedTargetForMouseOver() {
    driver.get(pages.javascriptPage);

    driver.findElement(By.id("movable")).click();

    String log = driver.findElement(By.id("result")).getText();

    // Note: It is not guaranteed that the relatedTarget property of the mouseover
    // event will be the parent, when using native events. Only check that the mouse
    // has moved to this element, not that the parent element was the related target.
    if (TestUtilities.isNativeEventsEnabled(driver)) {
      assertTrue("Should have moved to this element.", log.startsWith("parent matches?"));
    } else {
      assertEquals("parent matches? true", log);
    }
  }

  @JavascriptEnabled
  @NoDriverAfterTest
  @Ignore(value = {ANDROID, IPHONE, OPERA, SAFARI, SELENESE, OPERA_MOBILE},
          reason = "Doesn't support multiple windows; Safari: issue 3693")
  @Test
  public void testShouldOnlyFollowHrefOnce() {
    driver.get(pages.clicksPage);
    int windowHandlesBefore = driver.getWindowHandles().size();

    driver.findElement(By.id("new-window")).click();
    waitFor(windowHandleCountToBe(driver, windowHandlesBefore + 1));
  }

  @Ignore
  public void testShouldSetRelatedTargetForMouseOut() {
    fail("Must. Write. Meamingful. Test (but we don't fire mouse outs synthetically");
  }

  @Test
  public void testClickingLabelShouldSetCheckbox() {
    driver.get(pages.formPage);

    driver.findElement(By.id("label-for-checkbox-with-label")).click();

    assertTrue(
        "Should be selected",
        driver.findElement(By.id("checkbox-with-label")).isSelected());
  }

  @Test
  public void testCanClickOnALinkWithEnclosedImage() {
    driver.findElement(By.id("link-with-enclosed-image")).click();

    waitFor(WaitingConditions.pageTitleToBe(driver, "XHTML Test Page"));
  }

  @Test
  public void testCanClickOnAnImageEnclosedInALink() {
    driver.findElement(By.id("link-with-enclosed-image")).findElement(By.tagName("img")).click();

    waitFor(WaitingConditions.pageTitleToBe(driver, "XHTML Test Page"));
  }

  @Test
  public void testCanClickOnALinkThatContainsTextWrappedInASpan() {
    driver.findElement(By.id("link-with-enclosed-span")).click();

    waitFor(WaitingConditions.pageTitleToBe(driver, "XHTML Test Page"));
  }

  @Test
  public void testCanClickOnALinkThatContainsEmbeddedBlockElements() {
    driver.findElement(By.id("embeddedBlock")).click();
    waitFor(WaitingConditions.pageTitleToBe(driver, "XHTML Test Page"));
  }

  @Test
  public void testCanClickOnAnElementEnclosedInALink() {
    driver.findElement(By.id("link-with-enclosed-span")).findElement(By.tagName("span")).click();

    waitFor(WaitingConditions.pageTitleToBe(driver, "XHTML Test Page"));
  }

  // See http://code.google.com/p/selenium/issues/attachmentText?id=2700
  @Test
  public void testShouldBeAbleToClickOnAnElementInTheViewport() {
    String url = appServer.whereIs("click_out_of_bounds.html");

    driver.get(url);
    WebElement button = driver.findElement(By.id("button"));

    try {
      button.click();
    } catch (MoveTargetOutOfBoundsException e) {
      fail("Should not be out of bounds: " + e.getMessage());
    }
  }

  @Test
  public void testClicksASurroundingStrongTag() {
    driver.get(appServer.whereIs("ClickTest_testClicksASurroundingStrongTag.html"));
    driver.findElement(By.tagName("a")).click();
    waitFor(WaitingConditions.pageTitleToBe(driver, "XHTML Test Page"));
  }
}
