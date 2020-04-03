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
import static org.junit.Assert.fail;
import static org.openqa.selenium.WaitingConditions.newWindowIsOpened;
import static org.openqa.selenium.WaitingConditions.pageSourceToContain;
import static org.openqa.selenium.support.ui.ExpectedConditions.titleIs;
import static org.openqa.selenium.testing.drivers.Browser.ALL;
import static org.openqa.selenium.testing.drivers.Browser.CHROME;
import static org.openqa.selenium.testing.drivers.Browser.CHROMIUMEDGE;
import static org.openqa.selenium.testing.drivers.Browser.EDGE;
import static org.openqa.selenium.testing.drivers.Browser.FIREFOX;
import static org.openqa.selenium.testing.drivers.Browser.IE;
import static org.openqa.selenium.testing.drivers.Browser.MARIONETTE;
import static org.openqa.selenium.testing.drivers.Browser.SAFARI;

import com.google.common.base.Throwables;

import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JUnit4TestBase;
import org.openqa.selenium.testing.NoDriverAfterTest;
import org.openqa.selenium.testing.NotYetImplemented;
import org.openqa.selenium.testing.SwitchToTopAfterTest;

import java.util.Set;

public class ClickTest extends JUnit4TestBase {

  @Before
  public void setUp() {
    driver.get(pages.clicksPage);
  }

  @Test
  public void testCanClickOnALinkAndFollowIt() {
    driver.findElement(By.id("normal")).click();

    wait.until(titleIs("XHTML Test Page"));
  }

  @Test
  public void testCanClickOnALinkThatOverflowsAndFollowIt() {
    driver.findElement(By.id("overflowLink")).click();

    wait.until(titleIs("XHTML Test Page"));
  }

  @Test
  public void testCanClickOnAnAnchorAndNotReloadThePage() {
    ((JavascriptExecutor) driver).executeScript("document.latch = true");

    driver.findElement(By.id("anchor")).click();

    Boolean samePage = (Boolean) ((JavascriptExecutor) driver)
        .executeScript("return document.latch");

    assertThat(samePage).as("Latch was reset").isTrue();
  }

  @SwitchToTopAfterTest
  @Test
  public void testCanClickOnALinkThatUpdatesAnotherFrame() {
    driver.switchTo().frame("source");

    driver.findElement(By.id("otherframe")).click();
    driver.switchTo().defaultContent().switchTo().frame("target");

    wait.until(pageSourceToContain("Hello WebDriver"));
  }

  @SwitchToTopAfterTest
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

  @SwitchToTopAfterTest
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

  @Test
  public void testCanClickOnAnElementWithTopSetToANegativeNumber() {
    String page = appServer.whereIs("styledPage.html");
    driver.get(page);
    WebElement searchBox = driver.findElement(By.name("searchBox"));
    searchBox.sendKeys("Cheese");
    driver.findElement(By.name("btn")).click();

    String log = driver.findElement(By.id("log")).getText();
    assertThat(log).isEqualTo("click");
  }

  @Test
  @NotYetImplemented(SAFARI)
  @NotYetImplemented(EDGE)
  public void testShouldSetRelatedTargetForMouseOver() {
    driver.get(pages.javascriptPage);

    driver.findElement(By.id("movable")).click();

    String log = driver.findElement(By.id("result")).getText();

    assertThat(log).isEqualTo("parent matches? true");
  }

  @Test
  @NotYetImplemented(SAFARI)
  public void testShouldClickOnFirstBoundingClientRectWithNonZeroSize() {
    driver.findElement(By.id("twoClientRects")).click();
    wait.until(titleIs("XHTML Test Page"));
  }

  @NoDriverAfterTest(failedOnly = true)
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

  @Test
  @Ignore(ALL)
  public void testShouldSetRelatedTargetForMouseOut() {
    fail("Must. Write. Meaningful. Test (but we don't fire mouse outs synthetically");
  }

  @Test
  @NotYetImplemented(SAFARI)
  public void testClickingLabelShouldSetCheckbox() {
    driver.get(pages.formPage);

    driver.findElement(By.id("label-for-checkbox-with-label")).click();

    assertThat(driver.findElement(By.id("checkbox-with-label")).isSelected()).isTrue();
  }

  @Test
  @NotYetImplemented(SAFARI)
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
  @NotYetImplemented(SAFARI)
  public void testCanClickOnALinkThatContainsTextWrappedInASpan() {
    driver.findElement(By.id("link-with-enclosed-span")).click();

    wait.until(titleIs("XHTML Test Page"));
  }

  @Test
  @NotYetImplemented(value = MARIONETTE, reason = "https://github.com/mozilla/geckodriver/issues/653")
  @NotYetImplemented(SAFARI)
  public void testCanClickOnALinkThatContainsEmbeddedBlockElements() {
    driver.findElement(By.id("embeddedBlock")).click();
    wait.until(titleIs("XHTML Test Page"));
  }

  @Test
  public void testCanClickOnAnElementEnclosedInALink() {
    driver.findElement(By.id("link-with-enclosed-span")).findElement(By.tagName("span")).click();

    wait.until(titleIs("XHTML Test Page"));
  }

  // See https://github.com/SeleniumHQ/selenium-google-code-issue-archive/issues/2700
  @Test
  public void testShouldBeAbleToClickOnAnElementInTheViewport() {
    String url = appServer.whereIs("click_out_of_bounds.html");

    driver.get(url);
    WebElement button = driver.findElement(By.id("button"));
    button.click();
  }

  @Test
  @NotYetImplemented(SAFARI)
  public void testClicksASurroundingStrongTag() {
    driver.get(appServer.whereIs("ClickTest_testClicksASurroundingStrongTag.html"));
    driver.findElement(By.tagName("a")).click();
    wait.until(titleIs("XHTML Test Page"));
  }

  @Test
  @Ignore(IE)
  @NotYetImplemented(value = MARIONETTE, reason = "https://bugzilla.mozilla.org/show_bug.cgi?id=1502636")
  @NotYetImplemented(SAFARI)
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
  @Ignore(FIREFOX)
  @NotYetImplemented(value = MARIONETTE, reason = "https://bugzilla.mozilla.org/show_bug.cgi?id=1422272")
  @NotYetImplemented(SAFARI)
  public void testShouldBeAbleToClickOnAnElementGreaterThanTwoViewports() {
    String url = appServer.whereIs("click_too_big.html");
    driver.get(url);

    WebElement element = driver.findElement(By.id("click"));

    element.click();

    wait.until(titleIs("clicks"));
  }

  @SwitchToTopAfterTest
  @Test
  @NotYetImplemented(SAFARI)
  public void testShouldBeAbleToClickOnAnElementInFrameGreaterThanTwoViewports() {
    String url = appServer.whereIs("click_too_big_in_frame.html");
    driver.get(url);

    WebElement frame = driver.findElement(By.id("iframe1"));
    driver.switchTo().frame(frame);

    WebElement element = driver.findElement(By.id("click"));
    element.click();

    wait.until(titleIs("clicks"));
  }

  @Test
  public void testShouldBeAbleToClickOnRTLLanguageLink() {
    String url = appServer.whereIs("click_rtl.html");
    driver.get(url);

    WebElement element = driver.findElement(By.id("ar_link"));
    element.click();

    wait.until(titleIs("clicks"));
  }

  @Test
  public void testShouldBeAbleToClickOnLinkInAbsolutelyPositionedFooter() {
    String url = appServer.whereIs("fixedFooterNoScroll.html");
    driver.get(url);

    WebElement element = driver.findElement(By.id("link"));
    element.click();

    wait.until(titleIs("XHTML Test Page"));
  }

  @Test
  public void testShouldBeAbleToClickOnLinkInAbsolutelyPositionedFooterInQuirksMode() {
    String url = appServer.whereIs("fixedFooterNoScrollQuirksMode.html");
    driver.get(url);

    WebElement element = driver.findElement(By.id("link"));
    element.click();

    wait.until(titleIs("XHTML Test Page"));
  }

  @Test
  public void testShouldBeAbleToClickOnLinksWithNoHrefAttribute() {
    driver.get(pages.javascriptPage);

    WebElement element = driver.findElement(By.linkText("No href"));
    element.click();

    wait.until(titleIs("Changed"));
  }

  @Test
  public void testShouldBeAbleToClickOnALinkThatWrapsToTheNextLine() {
    driver.get(appServer.whereIs("click_tests/link_that_wraps.html"));

    driver.findElement(By.id("link")).click();

    wait.until(titleIs("Submitted Successfully!"));
  }

  @Test
  public void testShouldBeAbleToClickOnASpanThatWrapsToTheNextLine() {
    driver.get(appServer.whereIs("click_tests/span_that_wraps.html"));

    driver.findElement(By.id("span")).click();

    wait.until(titleIs("Submitted Successfully!"));
  }

  @Test
  @Ignore(CHROME)
  @Ignore(CHROMIUMEDGE)
  @Ignore(IE)
  @Ignore(MARIONETTE)
  @NotYetImplemented(SAFARI)
  @NotYetImplemented(EDGE)
  public void testShouldBeAbleToClickOnAPartiallyOverlappedLinkThatWrapsToTheNextLine() {
    driver.get(appServer.whereIs("click_tests/wrapped_overlapping_elements.html"));

    driver.findElement(By.id("link")).click();

    wait.until(titleIs("Submitted Successfully!"));
  }

  @Test
  public void clickingOnADisabledElementIsANoOp() {
    driver.get(appServer.whereIs("click_tests/disabled_element.html"));

    WebElement element = driver.findElement(By.name("disabled"));

    try {
      element.click();
      // A failing implementation will throw an exception
    } catch (WebDriverException e) {
      fail("The click should have been a no-op.\n" + Throwables.getStackTraceAsString(e));
    }
  }
}
