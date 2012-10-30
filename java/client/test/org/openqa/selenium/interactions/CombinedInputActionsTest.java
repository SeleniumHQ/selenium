/*
Copyright 2007-2010 Selenium committers

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

package org.openqa.selenium.interactions;

import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.Platform;
import org.openqa.selenium.WaitingConditions;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JUnit4TestBase;
import org.openqa.selenium.testing.JavascriptEnabled;

import java.util.List;

import static org.hamcrest.Matchers.equalTo;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertThat;
import static org.openqa.selenium.TestWaiter.waitFor;
import static org.openqa.selenium.WaitingConditions.elementToExist;
import static org.openqa.selenium.testing.Ignore.Driver.ANDROID;
import static org.openqa.selenium.testing.Ignore.Driver.CHROME;
import static org.openqa.selenium.testing.Ignore.Driver.HTMLUNIT;
import static org.openqa.selenium.testing.Ignore.Driver.IE;
import static org.openqa.selenium.testing.Ignore.Driver.IPHONE;
import static org.openqa.selenium.testing.Ignore.Driver.OPERA;
import static org.openqa.selenium.testing.Ignore.Driver.OPERA_MOBILE;
import static org.openqa.selenium.testing.Ignore.Driver.REMOTE;
import static org.openqa.selenium.testing.Ignore.Driver.SAFARI;
import static org.openqa.selenium.testing.Ignore.Driver.SELENESE;
import static org.openqa.selenium.testing.TestUtilities.getEffectivePlatform;
import static org.openqa.selenium.testing.TestUtilities.isFirefox;
import static org.openqa.selenium.testing.TestUtilities.isInternetExplorer;
import static org.openqa.selenium.testing.TestUtilities.isNativeEventsEnabled;

/**
 * Tests combined input actions.
 */
@Ignore(value = {ANDROID, CHROME, SAFARI},
    reason = "Safari: not implemented (issue 4136)",
    issues = {4136})
public class CombinedInputActionsTest extends JUnit4TestBase {

  // TODO: Check if this could work in any browser without native events.
  @JavascriptEnabled
  @Test
  public void testClickingOnFormElements() {
    if (!isNativeEventsEnabled(driver) || (!getEffectivePlatform().is(Platform.LINUX))) {
      System.out.println("Skipping testClickingOnFormElements: Only works with native events" +
          " on Linux.");
      return;
    }
    driver.get(pages.formSelectionPage);

    List<WebElement> options = driver.findElements(By.tagName("option"));

    Actions actions = new Actions(driver);
    Action selectThreeOptions = actions.click(options.get(1))
        .keyDown(Keys.SHIFT)
        .click(options.get(2))
        .click(options.get(3))
        .keyUp(Keys.SHIFT)
        .build();

    selectThreeOptions.perform();

    WebElement showButton = driver.findElement(By.name("showselected"));
    showButton.click();

    WebElement resultElement = driver.findElement(By.id("result"));
    assertEquals("Should have picked the last three options.", "roquefort parmigiano cheddar",
        resultElement.getText());
  }

  @JavascriptEnabled
  @Ignore({ANDROID, IE, REMOTE, IPHONE, SELENESE, OPERA})
  @Test
  public void testSelectingMultipleItems() {
    if (!isNativeEventsEnabled(driver) || (!getEffectivePlatform().is(Platform.LINUX))) {
      System.out.println("Skipping testClickingOnFormElements: Only works with native events" +
          " on Linux.");
      return;
    }

    driver.get(pages.selectableItemsPage);

    WebElement reportingElement = driver.findElement(By.id("infodiv"));

    assertEquals("no info", reportingElement.getText());

    List<WebElement> listItems = driver.findElements(By.tagName("li"));

    Actions actions = new Actions(driver);
    Action selectThreeItems = actions.keyDown(Keys.CONTROL)
        .click(listItems.get(1))
        .click(listItems.get(3))
        .click(listItems.get(5))
        .keyUp(Keys.CONTROL)
        .build();

    selectThreeItems.perform();

    assertEquals("#item2 #item4 #item6", reportingElement.getText());

    // Now click on another element, make sure that's the only one selected.
    actions = new Actions(driver);
    actions.click(listItems.get(6)).build().perform();
    assertEquals("#item7", reportingElement.getText());
  }

  private void navigateToClicksPageAndClickLink() {
    driver.get(pages.clicksPage);

    waitFor(elementToExist(driver, "normal"));
    WebElement link = driver.findElement(By.id("normal"));

    new Actions(driver)
        .click(link)
        .perform();

    waitFor(WaitingConditions.pageTitleToBe(driver, "XHTML Test Page"));
  }

  @Ignore({SELENESE, IPHONE})
  @Test
  public void testCanClickOnLinks() {
    navigateToClicksPageAndClickLink();
  }

  @Ignore(
      value = {HTMLUNIT, IPHONE, SELENESE},
      reason = "HtmlUnit: Advanced mouse actions only implemented in rendered browsers")
  @Test
  public void testCanClickOnLinksWithAnOffset() {
    driver.get(pages.clicksPage);

    waitFor(elementToExist(driver, "normal"));
    WebElement link = driver.findElement(By.id("normal"));

    new Actions(driver)
        .moveToElement(link, 1, 1)
        .click()
        .perform();

    waitFor(WaitingConditions.pageTitleToBe(driver, "XHTML Test Page"));
  }

  /**
   * This test demonstrates the following problem: When the representation of
   * the mouse in the driver keeps the wrong state, mouse movement will end
   * up at the wrong coordinates.
   */
  @Ignore({SELENESE, IPHONE,HTMLUNIT})
  @Test
  public void testMouseMovementWorksWhenNavigatingToAnotherPage() {
    navigateToClicksPageAndClickLink();

    WebElement linkId = driver.findElement(By.id("linkId"));
    new Actions(driver)
        .moveToElement(linkId, 1, 1)
        .click()
        .perform();

    waitFor(WaitingConditions.pageTitleToBe(driver, "We Arrive Here"));
  }

  @Ignore({SELENESE, HTMLUNIT, OPERA, OPERA_MOBILE})
  @Test
  public void testChordControlCutAndPaste() {
    // FIXME: macs don't have CONRTROL key
    if (getEffectivePlatform().is(Platform.MAC)) {
      return;
    }

    if (getEffectivePlatform().is(Platform.WINDOWS) &&
        (isInternetExplorer(driver) || isFirefox(driver))) {
      System.out.println("Skipping testChordControlCutAndPaste on Windows: native events library" +
          " does not support storing modifiers state yet.");
      return;
    }

    driver.get(pages.javascriptPage);

    WebElement element = driver.findElement(By.id("keyReporter"));

    new Actions(driver)
        .sendKeys(element, "abc def")
        .perform();

    assertEquals("abc def", element.getAttribute("value"));

    //TODO: Figure out why calling sendKey(Key.CONTROL + "a") and then
    //sendKeys("x") does not work on Linux.
    new Actions(driver)
        .sendKeys(Keys.CONTROL + "a" + "x")
        .perform();

    // Release keys before next step.
    new Actions(driver).sendKeys(Keys.NULL).perform();

    assertEquals("", element.getAttribute("value"));

    new Actions(driver)
        .sendKeys(Keys.CONTROL + "v")
        .sendKeys("v")
        .perform();

    new Actions(driver).sendKeys(Keys.NULL).perform();

    assertEquals("abc defabc def", element.getAttribute("value"));
  }

  @Ignore({SELENESE, HTMLUNIT, OPERA, IE, SELENESE})
  @Test
  public void testCombiningShiftAndClickResultsInANewWindow() {
    if (!isNativeEventsEnabled(driver) || (!getEffectivePlatform().is(Platform.LINUX))) {
      System.out.println("Skipping testCombiningShiftAndClickResultsInANewWindow: " +
          "Only works with native events on Linux.");
      return;
    }

    driver.get(pages.linkedImage);
    WebElement link = driver.findElement(By.id("link"));
    String originalTitle = driver.getTitle();

    int nWindows = driver.getWindowHandles().size();
    new Actions(driver)
        .moveToElement(link)
        .keyDown(Keys.SHIFT)
        .click()
        .keyUp(Keys.SHIFT)
        .perform();

    assertEquals("Should have opened a new window.",
        nWindows + 1, driver.getWindowHandles().size());
    assertEquals("Should not have navigated away.", originalTitle, driver.getTitle());
  }

  @Ignore({SELENESE, HTMLUNIT, OPERA, OPERA_MOBILE, IPHONE, IE})
  @Test
  public void testHoldingDownShiftKeyWhileClicking() {
    if (!isNativeEventsEnabled(driver) || (!getEffectivePlatform().is(Platform.LINUX))) {
      System.out.println("Skipping testHoldingDownShiftKeyWhileClicking: " +
          "Only works with native events on Linux.");
      return;
    }

    driver.get(pages.clickEventPage);

    WebElement toClick = driver.findElement(By.id("eventish"));

    new Actions(driver).keyDown(Keys.SHIFT).click(toClick).keyUp(Keys.SHIFT).perform();

    WebElement shiftInfo = waitFor(elementToExist(driver, "shiftKey"));
    assertThat(shiftInfo.getText(), equalTo("true"));
  }
}
