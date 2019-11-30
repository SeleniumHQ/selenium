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
import static org.openqa.selenium.support.ui.ExpectedConditions.not;
import static org.openqa.selenium.support.ui.ExpectedConditions.visibilityOf;
import static org.openqa.selenium.testing.drivers.Browser.HTMLUNIT;

import org.junit.Test;
import org.openqa.selenium.testing.JUnit4TestBase;
import org.openqa.selenium.testing.NotYetImplemented;
import org.openqa.selenium.testing.TestUtilities;

import java.util.List;

public class VisibilityTest extends JUnit4TestBase {

  @Test
  public void testShouldAllowTheUserToTellIfAnElementIsDisplayedOrNot() {
    driver.get(pages.javascriptPage);

    assertThat(driver.findElement(By.id("displayed")).isDisplayed()).isTrue();
    assertThat(driver.findElement(By.id("none")).isDisplayed()).isFalse();
    assertThat(driver.findElement(By.id("suppressedParagraph")).isDisplayed()).isFalse();
    assertThat(driver.findElement(By.id("hidden")).isDisplayed()).isFalse();
  }

  @Test
  public void testVisibilityShouldTakeIntoAccountParentVisibility() {
    driver.get(pages.javascriptPage);

    WebElement childDiv = driver.findElement(By.id("hiddenchild"));
    WebElement hiddenLink = driver.findElement(By.id("hiddenlink"));

    assertThat(childDiv.isDisplayed()).isFalse();
    assertThat(hiddenLink.isDisplayed()).isFalse();
  }

  @Test
  public void testShouldCountElementsAsVisibleIfStylePropertyHasBeenSet() {
    driver.get(pages.javascriptPage);

    WebElement shown = driver.findElement(By.id("visibleSubElement"));

    assertThat(shown.isDisplayed()).isTrue();
  }

  @Test
  public void testShouldModifyTheVisibilityOfAnElementDynamically() {
    driver.get(pages.javascriptPage);

    WebElement element = driver.findElement(By.id("hideMe"));

    assertThat(element.isDisplayed()).isTrue();

    element.click();

    wait.until(not(visibilityOf(element)));

    assertThat(element.isDisplayed()).isFalse();
  }

  @Test
  public void testHiddenInputElementsAreNeverVisible() {
    driver.get(pages.javascriptPage);

    WebElement shown = driver.findElement(By.name("hidden"));

    assertThat(shown.isDisplayed()).isFalse();
  }

  @Test
  public void testShouldNotBeAbleToClickOnAnElementThatIsNotDisplayed() {
    driver.get(pages.javascriptPage);
    WebElement element = driver.findElement(By.id("unclickable"));

    assertThatExceptionOfType(ElementNotInteractableException.class).isThrownBy(element::click);
  }

  @Test
  public void testShouldNotBeAbleToTypeToAnElementThatIsNotDisplayed() {
    driver.get(pages.javascriptPage);
    WebElement element = driver.findElement(By.id("unclickable"));

    assertThatExceptionOfType(ElementNotInteractableException.class)
        .isThrownBy(() -> element.sendKeys("You don't see me"));
    assertThat(element.getAttribute("value")).isNotEqualTo("You don't see me");
  }

  @Test
  public void testZeroSizedDivIsShownIfDescendantHasSize() {
    driver.get(pages.javascriptPage);

    WebElement element = driver.findElement(By.id("zero"));
    Dimension size = element.getSize();

    assertThat(size.width).isEqualTo(0);
    assertThat(size.height).isEqualTo(0);
    assertThat(element.isDisplayed()).isTrue();
  }

  @Test
  public void parentNodeVisibleWhenAllChildrenAreAbsolutelyPositionedAndOverflowIsHidden() {
    String url = appServer.whereIs("visibility-css.html");
    driver.get(url);

    WebElement element = driver.findElement(By.id("suggest"));
    assertThat(element.isDisplayed()).isTrue();
  }

  @Test
  @NotYetImplemented(HTMLUNIT)
  public void testElementHiddenByOverflowXIsNotVisible() {
    String[] pages = new String[]{
        "overflow/x_hidden_y_hidden.html",
        "overflow/x_hidden_y_scroll.html",
        "overflow/x_hidden_y_auto.html",
    };
    for (String page: pages) {
      driver.get(appServer.whereIs(page));
      WebElement right = driver.findElement(By.id("right"));
      assertThat(right.isDisplayed()).as("On page %s", page).isFalse();
      WebElement bottomRight = driver.findElement(By.id("bottom-right"));
      assertThat(bottomRight.isDisplayed()).as("On page %s", page).isFalse();
    }
  }

  @Test
  @NotYetImplemented(HTMLUNIT)
  public void testElementHiddenByOverflowYIsNotVisible() {
    String[] pages = new String[]{
        "overflow/x_hidden_y_hidden.html",
        "overflow/x_scroll_y_hidden.html",
        "overflow/x_auto_y_hidden.html",
    };
    for (String page: pages) {
      driver.get(appServer.whereIs(page));
      WebElement bottom = driver.findElement(By.id("bottom"));
      assertThat(bottom.isDisplayed()).as("On page %s", page).isFalse();
      WebElement bottomRight = driver.findElement(By.id("bottom-right"));
      assertThat(bottomRight.isDisplayed()).as("On page %s", page).isFalse();
    }
  }

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
      assertThat(right.isDisplayed()).as("On page %s", page).isTrue();
    }
  }

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
      assertThat(bottom.isDisplayed()).as("On page %s", page).isTrue();
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
      assertThat(bottomRight.isDisplayed()).as("On page %s", page).isTrue();
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
      assertThat(element.isDisplayed()).isTrue();
    } finally {
      window.setSize(originalSize);
    }
  }

  @Test
  public void shouldShowElementNotVisibleWithHiddenAttribute() {
    String url = appServer.whereIs("hidden.html");
    driver.get(url);
    WebElement element = driver.findElement(By.id("singleHidden"));
    assertThat(element.isDisplayed()).isFalse();
  }

  @Test
  public void testShouldShowElementNotVisibleWhenParentElementHasHiddenAttribute() {
    String url = appServer.whereIs("hidden.html");
    driver.get(url);

    WebElement element = driver.findElement(By.id("child"));
    assertThat(element.isDisplayed()).isFalse();
  }

  /**
   * See https://github.com/SeleniumHQ/selenium-google-code-issue-archive/issues/1610
   */
  @Test
  public void testShouldBeAbleToClickOnElementsWithOpacityZero() {
    driver.get(pages.clickJacker);

    WebElement element = driver.findElement(By.id("clickJacker"));
    assertThat(element.getCssValue("opacity"))
        .describedAs("Precondition failed: clickJacker should be transparent").isEqualTo("0");
    element.click();
    assertThat(element.getCssValue("opacity")).isEqualTo("1");
  }

  @Test
  public void testShouldBeAbleToSelectOptionsFromAnInvisibleSelect() {
    driver.get(pages.formPage);

    WebElement select = driver.findElement(By.id("invisi_select"));

    List<WebElement> options = select.findElements(By.tagName("option"));
    WebElement apples = options.get(0);
    WebElement oranges = options.get(1);

    assertThat(apples.isSelected()).as("Apples").isTrue();
    assertThat(oranges.isSelected()).as("Oranges").isFalse();

    oranges.click();
    assertThat(apples.isSelected()).as("Apples").isFalse();
    assertThat(oranges.isSelected()).as("Oranges").isTrue();
  }

  @Test
  public void testCorrectlyDetectMapElementsAreShown() {
    driver.get(pages.mapVisibilityPage);

    final WebElement area = driver.findElement(By.id("mtgt_unnamed_0"));

    assertThat(area.isDisplayed()).as("The element and the enclosing map").isTrue();
  }

}
