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

import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.not;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertThat;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;
import static org.junit.Assume.assumeFalse;
import static org.openqa.selenium.Platform.ANDROID;
import static org.openqa.selenium.support.ui.ExpectedConditions.not;
import static org.openqa.selenium.support.ui.ExpectedConditions.visibilityOf;
import static org.openqa.selenium.testing.Driver.HTMLUNIT;
import static org.openqa.selenium.testing.Driver.IE;
import static org.openqa.selenium.testing.Driver.MARIONETTE;
import static org.openqa.selenium.testing.Driver.PHANTOMJS;
import static org.openqa.selenium.testing.Driver.SAFARI;

import org.junit.Test;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JUnit4TestBase;
import org.openqa.selenium.testing.JavascriptEnabled;
import org.openqa.selenium.testing.NotYetImplemented;
import org.openqa.selenium.testing.TestUtilities;

import java.util.List;

public class VisibilityTest extends JUnit4TestBase {

  @Test
  public void testShouldAllowTheUserToTellIfAnElementIsDisplayedOrNot() {
    driver.get(pages.javascriptPage);

    assertThat(driver.findElement(By.id("displayed")).isDisplayed(),
               is(true));
    assertThat(driver.findElement(By.id("none")).isDisplayed(), is(false));
    assertThat(driver.findElement(By.id("suppressedParagraph")).isDisplayed(), is(false));
    assertThat(driver.findElement(By.id("hidden")).isDisplayed(), is(false));
  }

  @Test
  public void testVisibilityShouldTakeIntoAccountParentVisibility() {
    driver.get(pages.javascriptPage);

    WebElement childDiv = driver.findElement(By.id("hiddenchild"));
    WebElement hiddenLink = driver.findElement(By.id("hiddenlink"));

    assertFalse(childDiv.isDisplayed());
    assertFalse(hiddenLink.isDisplayed());
  }

  @Test
  public void testShouldCountElementsAsVisibleIfStylePropertyHasBeenSet() {
    driver.get(pages.javascriptPage);

    WebElement shown = driver.findElement(By.id("visibleSubElement"));

    assertTrue(shown.isDisplayed());
  }

  @JavascriptEnabled
  @Test
  public void testShouldModifyTheVisibilityOfAnElementDynamically() {
    driver.get(pages.javascriptPage);

    WebElement element = driver.findElement(By.id("hideMe"));

    assertTrue(element.isDisplayed());

    element.click();

    wait.until(not(visibilityOf(element)));

    assertFalse(element.isDisplayed());
  }

  @Test
  public void testHiddenInputElementsAreNeverVisible() {
    driver.get(pages.javascriptPage);

    WebElement shown = driver.findElement(By.name("hidden"));

    assertFalse(shown.isDisplayed());
  }

  @Test
  public void testShouldNotBeAbleToClickOnAnElementThatIsNotDisplayed() {
    driver.get(pages.javascriptPage);
    WebElement element = driver.findElement(By.id("unclickable"));

    try {
      element.click();
      fail("You should not be able to click on an invisible element");
    } catch (ElementNotVisibleException e) {
      // This is expected
    }
  }

  @Test
  public void testShouldNotBeAbleToTypeToAnElementThatIsNotDisplayed() {
    driver.get(pages.javascriptPage);
    WebElement element = driver.findElement(By.id("unclickable"));

    try {
      element.sendKeys("You don't see me");
      fail("You should not be able to send keyboard input to an invisible element");
    } catch (ElementNotVisibleException e) {
      // This is expected
    }

    assertThat(element.getAttribute("value"), is(not("You don't see me")));
  }

  @JavascriptEnabled // element.getSize() requires Javascript in HtmlUnit
  @Ignore(IE)
  @Test
  public void testZeroSizedDivIsShownIfDescendantHasSize() {
    driver.get(pages.javascriptPage);

    WebElement element = driver.findElement(By.id("zero"));
    Dimension size = element.getSize();

    assertEquals("Should have 0 width", 0, size.width);
    assertEquals("Should have 0 height", 0, size.height);
    assertTrue(element.isDisplayed());
  }

  @Test
  public void parentNodeVisibleWhenAllChildrenAreAbsolutelyPositionedAndOverflowIsHidden() {
    String url = appServer.whereIs("visibility-css.html");
    driver.get(url);

    WebElement element = driver.findElement(By.id("suggest"));
    assertTrue(element.isDisplayed());
  }

  @Ignore({IE, PHANTOMJS, SAFARI})
  @NotYetImplemented(HTMLUNIT)
  @Test
  public void testElementHiddenByOverflowXIsNotVisible() {
    String[] pages = new String[]{
        "overflow/x_hidden_y_hidden.html",
        "overflow/x_hidden_y_scroll.html",
        "overflow/x_hidden_y_auto.html",
    };
    for (String page: pages) {
      driver.get(appServer.whereIs(page));
      WebElement right = driver.findElement(By.id("right"));
      assertFalse(page, right.isDisplayed());
      WebElement bottomRight = driver.findElement(By.id("bottom-right"));
      assertFalse(page, bottomRight.isDisplayed());
    }
  }

  @Ignore(PHANTOMJS)
  @NotYetImplemented(HTMLUNIT)
  @Test
  public void testElementHiddenByOverflowYIsNotVisible() {
    String[] pages = new String[]{
        "overflow/x_hidden_y_hidden.html",
        "overflow/x_scroll_y_hidden.html",
        "overflow/x_auto_y_hidden.html",
    };
    for (String page: pages) {
      driver.get(appServer.whereIs(page));
      WebElement bottom = driver.findElement(By.id("bottom"));
      assertFalse(page, bottom.isDisplayed());
      WebElement bottomRight = driver.findElement(By.id("bottom-right"));
      assertFalse(page, bottomRight.isDisplayed());
    }
  }

  @Ignore({IE})
  @Test
  public void testElementScrollableByOverflowXIsVisible() {
    String[] pages = new String[]{
        "overflow/x_scroll_y_hidden.html",
        "overflow/x_scroll_y_scroll.html",
        "overflow/x_scroll_y_auto.html",
        "overflow/x_auto_y_hidden.html",
        "overflow/x_auto_y_scroll.html",
        "overflow/x_auto_y_auto.html",
    };
    for (String page: pages) {
      driver.get(appServer.whereIs(page));
      WebElement right = driver.findElement(By.id("right"));
      assertTrue(page, right.isDisplayed());
    }
  }

  @Ignore({IE, SAFARI})
  @Test
  public void testElementScrollableByOverflowYIsVisible() {
    String[] pages = new String[]{
        "overflow/x_hidden_y_scroll.html",
        "overflow/x_scroll_y_scroll.html",
        "overflow/x_auto_y_scroll.html",
        "overflow/x_hidden_y_auto.html",
        "overflow/x_scroll_y_auto.html",
        "overflow/x_auto_y_auto.html",
    };
    for (String page: pages) {
      driver.get(appServer.whereIs(page));
      WebElement bottom = driver.findElement(By.id("bottom"));
      assertTrue(page, bottom.isDisplayed());
    }
  }

  @Test
  public void testElementScrollableByOverflowXAndYIsVisible() {
    String[] pages = new String[]{
        "overflow/x_scroll_y_scroll.html",
        "overflow/x_scroll_y_auto.html",
        "overflow/x_auto_y_scroll.html",
        "overflow/x_auto_y_auto.html",
    };
    for (String page: pages) {
      driver.get(appServer.whereIs(page));
      WebElement bottomRight = driver.findElement(By.id("bottom-right"));
      assertTrue(page, bottomRight.isDisplayed());
    }
  }

  @Test
  public void tooSmallAWindowWithOverflowHiddenIsNotAProblem() {
    // Browser window cannot be resized on ANDROID (and most mobile platforms
    // though others aren't defined in org.openqa.selenium.Platform).
    assumeFalse(TestUtilities.getEffectivePlatform(driver).is(ANDROID));
    WebDriver.Window window = driver.manage().window();
    Dimension originalSize = window.getSize();

    try {
      // Short in the Y dimension
      window.setSize(new Dimension(1024, 500));

      String url = appServer.whereIs("overflow-body.html");
      driver.get(url);

      WebElement element = driver.findElement(By.name("resultsFrame"));
      assertTrue(element.isDisplayed());
    } finally {
      window.setSize(originalSize);
    }
  }

  @Test
  @Ignore(IE)
  public void shouldShowElementNotVisibleWithHiddenAttribute() {
    String url = appServer.whereIs("hidden.html");
    driver.get(url);
    WebElement element = driver.findElement(By.id("singleHidden"));
    assertFalse(element.isDisplayed());
  }

  @Test
  @Ignore(IE)
  @NotYetImplemented(HTMLUNIT)
  public void testShouldShowElementNotVisibleWhenParentElementHasHiddenAttribute() {
    String url = appServer.whereIs("hidden.html");
    driver.get(url);

    WebElement element = driver.findElement(By.id("child"));
    assertFalse(element.isDisplayed());
  }

  /**
   * @see <a href="http://code.google.com/p/selenium/issues/detail?id=1610">
   *      http://code.google.com/p/selenium/issues/detail?id=1610</a>
   */
  @Ignore({IE, MARIONETTE})
  @JavascriptEnabled // element.getCssValue() requires Javascript in HtmlUnit
  @Test
  public void testShouldBeAbleToClickOnElementsWithOpacityZero() {
    driver.get(pages.clickJacker);

    WebElement element = driver.findElement(By.id("clickJacker"));
    assertEquals("Precondition failed: clickJacker should be transparent",
                 "0", element.getCssValue("opacity"));
    element.click();
    assertEquals("1", element.getCssValue("opacity"));
  }

  @Ignore(MARIONETTE)
  @Test
  public void testShouldBeAbleToSelectOptionsFromAnInvisibleSelect() {
    driver.get(pages.formPage);

    WebElement select = driver.findElement(By.id("invisi_select"));

    List<WebElement> options = select.findElements(By.tagName("option"));
    WebElement apples = options.get(0);
    WebElement oranges = options.get(1);

    assertTrue("Apples should be selected", apples.isSelected());
    assertFalse("Oranges should be selected", oranges.isSelected());

    oranges.click();
    assertFalse("Apples should not be selected", apples.isSelected());
    assertTrue("Oranges should be selected", oranges.isSelected());
  }

  @Test
  public void testCorrectlyDetectMapElementsAreShown() {
    driver.get(pages.mapVisibilityPage);

    final WebElement area = driver.findElement(By.id("mtgt_unnamed_0"));

    boolean isShown = area.isDisplayed();
    assertTrue("The element and the enclosing map should be considered shown.", isShown);
  }

}
