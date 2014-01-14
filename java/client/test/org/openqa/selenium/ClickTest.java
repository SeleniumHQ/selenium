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

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;
import static org.junit.Assume.assumeFalse;
import static org.openqa.selenium.WaitingConditions.newWindowIsOpened;
import static org.openqa.selenium.WaitingConditions.pageSourceToContain;
import static org.openqa.selenium.support.ui.ExpectedConditions.titleIs;
import static org.openqa.selenium.testing.Ignore.Driver.ANDROID;
import static org.openqa.selenium.testing.Ignore.Driver.CHROME;
import static org.openqa.selenium.testing.Ignore.Driver.HTMLUNIT;
import static org.openqa.selenium.testing.Ignore.Driver.IE;
import static org.openqa.selenium.testing.Ignore.Driver.IPHONE;
import static org.openqa.selenium.testing.Ignore.Driver.MARIONETTE;
import static org.openqa.selenium.testing.Ignore.Driver.OPERA;
import static org.openqa.selenium.testing.Ignore.Driver.OPERA_MOBILE;
import static org.openqa.selenium.testing.Ignore.Driver.SAFARI;
import static org.openqa.selenium.testing.TestUtilities.isFirefox;
import static org.openqa.selenium.testing.TestUtilities.isNativeEventsEnabled;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.interactions.MoveTargetOutOfBoundsException;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JUnit4TestBase;
import org.openqa.selenium.testing.JavascriptEnabled;

import java.util.Set;

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

    wait.until(titleIs("XHTML Test Page"));
  }

  @Ignore(value = {OPERA, MARIONETTE}, reason = "Not tested.")
  @Test
  public void testCanClickOnALinkThatOverflowsAndFollowIt() {
    driver.findElement(By.id("overflowLink")).click();

    wait.until(titleIs("XHTML Test Page"));
  }

  @JavascriptEnabled
  @Test
  @Ignore(MARIONETTE)
  public void testCanClickOnAnAnchorAndNotReloadThePage() {
    ((JavascriptExecutor) driver).executeScript("document.latch = true");

    driver.findElement(By.id("anchor")).click();

    Boolean samePage = (Boolean) ((JavascriptExecutor) driver)
        .executeScript("return document.latch");

    assertEquals("Latch was reset", Boolean.TRUE, samePage);
  }

  @Ignore(value = {OPERA, ANDROID, OPERA_MOBILE, MARIONETTE},
          reason = "Opera: Incorrect runtime retrieved, Android: A bug in emulator JSC engine on " +
                   "2.2, works on devices.")
  @Test
  public void testCanClickOnALinkThatUpdatesAnotherFrame() {
    driver.switchTo().frame("source");

    driver.findElement(By.id("otherframe")).click();
    driver.switchTo().defaultContent().switchTo().frame("target");

    wait.until(pageSourceToContain("Hello WebDriver"));
  }

  @JavascriptEnabled
  @Ignore(value = {OPERA, ANDROID, OPERA_MOBILE, MARIONETTE},
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

    wait.until(pageSourceToContain("Hello WebDriver"));
  }

  @JavascriptEnabled
  @Ignore(value = {OPERA, ANDROID, OPERA_MOBILE, MARIONETTE}, reason =
      "Opera: Incorrect runtime retrieved, Android: fails when running with other tests.")
  @Test
  public void testJsLocatedElementsCanUpdateFramesIfFoundSomehowElse() {
    driver.switchTo().frame("source");

    // Prime the cache of elements
    driver.findElement(By.id("otherframe"));

    // This _should_ return the same element
    WebElement toClick = (WebElement) ((JavascriptExecutor) driver).executeScript(
        "return document.getElementById('otherframe');"
    );
    toClick.click();
    driver.switchTo().defaultContent().switchTo().frame("target");

    wait.until(pageSourceToContain("Hello WebDriver"));
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

  @Ignore(value = {ANDROID, CHROME, IPHONE, SAFARI, OPERA_MOBILE}, reason = "Not tested")
  @Test
  public void testShouldClickOnFirstBoundingClientRectWithNonZeroSize() {
    driver.findElement(By.id("twoClientRects")).click();
    wait.until(titleIs("XHTML Test Page"));
  }

  @JavascriptEnabled
  @Ignore(value = {ANDROID, CHROME, OPERA, MARIONETTE}, reason = "Not implemented")
  @Test
  public void testShouldSetRelatedTargetForMouseOver() {
    driver.get(pages.javascriptPage);

    driver.findElement(By.id("movable")).click();

    String log = driver.findElement(By.id("result")).getText();

    // Note: It is not guaranteed that the relatedTarget property of the mouseover
    // event will be the parent, when using native events. Only check that the mouse
    // has moved to this element, not that the parent element was the related target.
    if (isNativeEventsEnabled(driver)) {
      assertTrue("Should have moved to this element.", log.startsWith("parent matches?"));
    } else {
      assertEquals("parent matches? true", log);
    }
  }

  @JavascriptEnabled
  @NoDriverAfterTest
  @Ignore(value = {ANDROID, IPHONE, OPERA, SAFARI, OPERA_MOBILE},
          reason = "Doesn't support multiple windows; Safari: issue 3693")
  @Test
  public void testShouldOnlyFollowHrefOnce() {
    driver.get(pages.clicksPage);
    String current = driver.getWindowHandle();
    Set<String> currentWindowHandles = driver.getWindowHandles();

    try {
      driver.findElement(By.id("new-window")).click();
      String newWindowHandle = wait.until(newWindowIsOpened(currentWindowHandles));
      driver.switchTo().window(newWindowHandle);
      driver.close();
    } finally {
      driver.switchTo().window(current);
    }
  }

  @Ignore
  public void testShouldSetRelatedTargetForMouseOut() {
    fail("Must. Write. Meaningful. Test (but we don't fire mouse outs synthetically");
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

    wait.until(titleIs("XHTML Test Page"));
  }

  @Test
  public void testCanClickOnAnImageEnclosedInALink() {
    driver.findElement(By.id("link-with-enclosed-image")).findElement(By.tagName("img")).click();

    wait.until(titleIs("XHTML Test Page"));
  }

  @Test
  public void testCanClickOnALinkThatContainsTextWrappedInASpan() {
    driver.findElement(By.id("link-with-enclosed-span")).click();

    wait.until(titleIs("XHTML Test Page"));
  }

  @Test
  public void testCanClickOnALinkThatContainsEmbeddedBlockElements() {
    driver.findElement(By.id("embeddedBlock")).click();
    wait.until(titleIs("XHTML Test Page"));
  }

  @Test
  public void testCanClickOnAnElementEnclosedInALink() {
    driver.findElement(By.id("link-with-enclosed-span")).findElement(By.tagName("span")).click();

    wait.until(titleIs("XHTML Test Page"));
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
    wait.until(titleIs("XHTML Test Page"));
  }

  @Test
  @Ignore(value = {IE, OPERA, OPERA_MOBILE, ANDROID, IPHONE, MARIONETTE}, reason
      = "Opera, IE: failed, others: not tested")
  public void testCanClickAnImageMapArea() {
    driver.get(appServer.whereIs("click_tests/google_map.html"));
    driver.findElement(By.id("rectG")).click();
    wait.until(titleIs("Target Page 1"));

    driver.get(appServer.whereIs("click_tests/google_map.html"));
    driver.findElement(By.id("circleO")).click();
    wait.until(titleIs("Target Page 2"));

    driver.get(appServer.whereIs("click_tests/google_map.html"));
    driver.findElement(By.id("polyLE")).click();
    wait.until(titleIs("Target Page 3"));
  }

  @Test
  @Ignore(value = {HTMLUNIT, OPERA, OPERA_MOBILE, ANDROID, IPHONE, MARIONETTE}, reason
      = "Not tested against these browsers")
  public void testShouldBeAbleToClickOnAnElementGreaterThanTwoViewports() {
    String url = appServer.whereIs("click_too_big.html");
    driver.get(url);

    WebElement element = driver.findElement(By.id("click"));

    element.click();

    wait.until(titleIs("clicks"));
  }

  @Test
  @Ignore(value = {CHROME, HTMLUNIT, OPERA, OPERA_MOBILE, ANDROID, IPHONE, MARIONETTE}, reason
      = "Chrome: failed, Firefox: failed with native events, others: not tested")
  public void testShouldBeAbleToClickOnAnElementInFrameGreaterThanTwoViewports() {
    assumeFalse(isFirefox(driver) && isNativeEventsEnabled(driver));

    String url = appServer.whereIs("click_too_big_in_frame.html");
    driver.get(url);

    WebElement frame = driver.findElement(By.id("iframe1"));
    driver.switchTo().frame(frame);

    WebElement element = driver.findElement(By.id("click"));
    element.click();

    wait.until(titleIs("clicks"));
  }

  @Test
  @Ignore(value = {OPERA, OPERA_MOBILE}, reason = "Opera: failed")
  public void testShouldBeAbleToClickOnRTLLanguageLink() {
    String url = appServer.whereIs("click_rtl.html");
    driver.get(url);

    WebElement element = driver.findElement(By.id("ar_link"));
    element.click();

    wait.until(titleIs("clicks"));
  }

  @Test
  @Ignore(value = {HTMLUNIT, OPERA, OPERA_MOBILE, ANDROID, IPHONE, MARIONETTE}, reason
      = "not tested")
  public void testShouldBeAbleToClickOnLinkInAbsolutelyPositionedFooter() {
    String url = appServer.whereIs("fixedFooterNoScroll.html");
    driver.get(url);

    WebElement element = driver.findElement(By.id("link"));
    element.click();

    wait.until(titleIs("XHTML Test Page"));
  }

  @Test
  @Ignore(value = {HTMLUNIT, OPERA, OPERA_MOBILE, ANDROID, IPHONE, MARIONETTE}, reason
      = "not tested")
  public void testShouldBeAbleToClickOnLinkInAbsolutelyPositionedFooterInQuirksMode() {
    String url = appServer.whereIs("fixedFooterNoScrollQuirksMode.html");
    driver.get(url);

    WebElement element = driver.findElement(By.id("link"));
    element.click();

    wait.until(titleIs("XHTML Test Page"));
  }

  @JavascriptEnabled
  @Test
  public void testShouldBeAbleToClickOnLinksWithNoHrefAttribute() {
    driver.get(pages.javascriptPage);

    WebElement element = driver.findElement(By.linkText("No href"));
    element.click();

    wait.until(titleIs("Changed"));
  }

  @JavascriptEnabled
  @Test
  @Ignore(value = {OPERA, OPERA_MOBILE, ANDROID, IPHONE, MARIONETTE},
          reason = "Opera: fails, others: not tested")
  public void testShouldBeAbleToClickOnALinkThatWrapsToTheNextLine() {
    driver.get(appServer.whereIs("click_tests/link_that_wraps.html"));

    driver.findElement(By.id("link")).click();

    wait.until(titleIs("Submitted Successfully!"));
  }

  @JavascriptEnabled
  @Test
  @Ignore(value = {OPERA, OPERA_MOBILE, ANDROID, IPHONE, MARIONETTE},
          reason = "Opera: fails, others: not tested")
  public void testShouldBeAbleToClickOnASpanThatWrapsToTheNextLine() {
    assumeFalse(isFirefox(driver) && isNativeEventsEnabled(driver));
    driver.get(appServer.whereIs("click_tests/span_that_wraps.html"));

    driver.findElement(By.id("span")).click();

    wait.until(titleIs("Submitted Successfully!"));
  }

}
