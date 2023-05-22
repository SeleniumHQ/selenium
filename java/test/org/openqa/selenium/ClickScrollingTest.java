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
import static org.openqa.selenium.support.ui.ExpectedConditions.presenceOfElementLocated;
import static org.openqa.selenium.support.ui.ExpectedConditions.titleIs;
import static org.openqa.selenium.testing.drivers.Browser.FIREFOX;
import static org.openqa.selenium.testing.drivers.Browser.HTMLUNIT;
import static org.openqa.selenium.testing.drivers.Browser.IE;
import static org.openqa.selenium.testing.drivers.Browser.SAFARI;

import org.junit.jupiter.api.Test;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JupiterTestBase;
import org.openqa.selenium.testing.NotYetImplemented;
import org.openqa.selenium.testing.SwitchToTopAfterTest;

@Ignore(value = HTMLUNIT, reason = "Scrolling requires rendering")
class ClickScrollingTest extends JupiterTestBase {

  @Test
  void testClickingOnAnchorScrollsPage() {
    String scrollScript = "";
    scrollScript += "var pageY;";
    scrollScript += "if (typeof(window.pageYOffset) == 'number') {";
    scrollScript += "  pageY = window.pageYOffset;";
    scrollScript += "} else {";
    scrollScript += "  pageY = document.documentElement.scrollTop;";
    scrollScript += "}";
    scrollScript += "return pageY;";

    driver.get(pages.macbethPage);

    driver.findElement(By.partialLinkText("last speech")).click();

    Object x = ((JavascriptExecutor) driver).executeScript(scrollScript);
    // Focusing on to click, but not actually following,
    // the link will scroll it in to view, which is a few pixels further than 0
    // According to documentation at
    // https://developer.mozilla.org/en-US/docs/Web/API/Window/pageYOffset
    // window.pageYOffset may not return integer value.
    // With the following changes in below we are checking the type of returned object and assigning
    // respectively
    // the value of 'yOffset'
    if (x instanceof Long) {
      long yOffset = (Long) x;
      assertThat(yOffset).describedAs("Did not scroll").isGreaterThan(300L);
    } else if (x instanceof Double) {
      double yOffset = (Double) x;
      assertThat(yOffset).describedAs("Did not scroll").isGreaterThan(300.0);
    }
  }

  @Test
  void testShouldScrollToClickOnAnElementHiddenByOverflow() {
    String url = appServer.whereIs("click_out_of_bounds_overflow.html");
    driver.get(url);

    WebElement link = driver.findElement(By.id("link"));
    link.click();
  }

  @Test
  void testShouldBeAbleToClickOnAnElementHiddenByOverflow() {
    driver.get(appServer.whereIs("scroll.html"));

    WebElement link = driver.findElement(By.id("line8"));
    // This used to throw a MoveTargetOutOfBoundsException - we don't expect it to
    link.click();
    assertThat(driver.findElement(By.id("clicked")).getText()).isEqualTo("line8");
  }

  @Test
  @Ignore(
      value = FIREFOX,
      reason = "horizontal scroll bar gets in the way",
      issue = "https://github.com/mozilla/geckodriver/issues/2013")
  public void testShouldBeAbleToClickOnAnElementHiddenByDoubleOverflow() {
    driver.get(appServer.whereIs("scrolling_tests/page_with_double_overflow_auto.html"));

    driver.findElement(By.id("link")).click();
    wait.until(titleIs("Clicked Successfully!"));
  }

  @Test
  void testShouldBeAbleToClickOnAnElementHiddenByYOverflow() {
    driver.get(appServer.whereIs("scrolling_tests/page_with_y_overflow_auto.html"));

    driver.findElement(By.id("link")).click();
    wait.until(titleIs("Clicked Successfully!"));
  }

  @Test
  @Ignore(value = IE, issue = "716")
  @Ignore(
      value = FIREFOX,
      reason = "horizontal scroll bar gets in the way",
      issue = "https://github.com/mozilla/geckodriver/issues/2013")
  public void testShouldBeAbleToClickOnAnElementPartiallyHiddenByOverflow() {
    driver.get(appServer.whereIs("scrolling_tests/page_with_partially_hidden_element.html"));

    driver.findElement(By.id("btn")).click();
    wait.until(titleIs("Clicked Successfully!"));
  }

  @Test
  void testShouldNotScrollOverflowElementsWhichAreVisible() {
    driver.get(appServer.whereIs("scroll2.html"));
    WebElement list = driver.findElement(By.tagName("ul"));
    WebElement item = list.findElement(By.id("desired"));
    item.click();
    long yOffset =
        (Long) ((JavascriptExecutor) driver).executeScript("return arguments[0].scrollTop;", list);
    assertThat(yOffset).describedAs("Should not have scrolled").isZero();
  }

  @Test
  @Ignore(
      value = FIREFOX,
      reason = "horizontal scroll bar gets in the way",
      issue = "https://github.com/mozilla/geckodriver/issues/2013")
  @NotYetImplemented(IE)
  public void testShouldNotScrollIfAlreadyScrolledAndElementIsInView() {
    driver.get(appServer.whereIs("scroll3.html"));
    driver.findElement(By.id("button2")).click();
    long scrollTop = getScrollTop();
    driver.findElement(By.id("button1")).click();
    assertThat(getScrollTop()).isEqualTo(scrollTop);
  }

  @Test
  void testShouldBeAbleToClickRadioButtonScrolledIntoView() {
    driver.get(appServer.whereIs("scroll4.html"));
    driver.findElement(By.id("radio")).click();
    // If we don't throw, we're good
  }

  @Test
  @Ignore(value = IE, reason = "IE has special overflow handling")
  @NotYetImplemented(SAFARI)
  public void testShouldScrollOverflowElementsIfClickPointIsOutOfViewButElementIsInView() {
    driver.get(appServer.whereIs("scroll5.html"));
    driver.findElement(By.id("inner")).click();
    assertThat(driver.findElement(By.id("clicked")).getText()).isEqualTo("clicked");
  }

  @SwitchToTopAfterTest
  @Test
  @NotYetImplemented(SAFARI)
  @Ignore(
      value = FIREFOX,
      reason = "frame not scrolled into view",
      issue = "https://bugzilla.mozilla.org/show_bug.cgi?id=1314462")
  public void testShouldBeAbleToClickElementInAFrameThatIsOutOfView() {
    driver.get(appServer.whereIs("scrolling_tests/page_with_frame_out_of_view.html"));
    driver.switchTo().frame("frame");
    WebElement element = driver.findElement(By.name("checkbox"));
    element.click();
    assertThat(element.isSelected()).isTrue();
  }

  @SwitchToTopAfterTest
  @Test
  void testShouldBeAbleToClickElementThatIsOutOfViewInAFrame() {
    driver.get(appServer.whereIs("scrolling_tests/page_with_scrolling_frame.html"));
    driver.switchTo().frame("scrolling_frame");
    WebElement element = driver.findElement(By.name("scroll_checkbox"));
    element.click();
    assertThat(element.isSelected()).isTrue();
  }

  @SwitchToTopAfterTest
  @Test
  @NotYetImplemented(SAFARI)
  public void testShouldBeAbleToClickElementThatIsOutOfViewInAFrameThatIsOutOfView() {
    driver.get(appServer.whereIs("scrolling_tests/page_with_scrolling_frame_out_of_view.html"));
    driver.switchTo().frame("scrolling_frame");
    WebElement element = driver.findElement(By.name("scroll_checkbox"));
    element.click();
    assertThat(element.isSelected()).isTrue();
  }

  @SwitchToTopAfterTest
  @Test
  @Ignore(
      value = FIREFOX,
      reason = "horizontal scroll bar gets in the way",
      issue = "https://github.com/mozilla/geckodriver/issues/2013")
  public void testShouldBeAbleToClickElementThatIsOutOfViewInANestedFrame() {
    driver.get(appServer.whereIs("scrolling_tests/page_with_nested_scrolling_frames.html"));
    driver.switchTo().frame("scrolling_frame");
    driver.switchTo().frame("nested_scrolling_frame");
    WebElement element = driver.findElement(By.name("scroll_checkbox"));
    element.click();
    assertThat(element.isSelected()).isTrue();
  }

  @SwitchToTopAfterTest
  @Test
  @Ignore(
      value = FIREFOX,
      reason = "horizontal scroll bar gets in the way",
      issue = "https://github.com/mozilla/geckodriver/issues/2013")
  @NotYetImplemented(SAFARI)
  public void testShouldBeAbleToClickElementThatIsOutOfViewInANestedFrameThatIsOutOfView() {
    driver.get(
        appServer.whereIs("scrolling_tests/page_with_nested_scrolling_frames_out_of_view.html"));
    driver.switchTo().frame("scrolling_frame");
    driver.switchTo().frame("nested_scrolling_frame");
    WebElement element = driver.findElement(By.name("scroll_checkbox"));
    element.click();

    assertThat(element.isSelected()).isTrue();
  }

  @Test
  void testShouldNotScrollWhenGettingElementSize() {
    driver.get(appServer.whereIs("scroll3.html"));
    long scrollTop = getScrollTop();
    driver.findElement(By.id("button1")).getSize();
    assertThat(getScrollTop()).isEqualTo(scrollTop);
  }

  private long getScrollTop() {
    wait.until(presenceOfElementLocated(By.tagName("body")));
    return (Long) ((JavascriptExecutor) driver).executeScript("return document.body.scrollTop;");
  }

  @SwitchToTopAfterTest
  @Test
  @NotYetImplemented(SAFARI)
  @Ignore(
      value = FIREFOX,
      reason = "frame not scrolled into view",
      issue = "https://bugzilla.mozilla.org/show_bug.cgi?id=1314462")
  public void testShouldBeAbleToClickElementInATallFrame() {
    driver.get(appServer.whereIs("scrolling_tests/page_with_tall_frame.html"));
    driver.switchTo().frame("tall_frame");
    WebElement element = driver.findElement(By.name("checkbox"));
    element.click();
    assertThat(element.isSelected()).isTrue();
  }
}
