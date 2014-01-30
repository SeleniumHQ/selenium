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

import static org.hamcrest.Matchers.equalTo;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertThat;
import static org.junit.Assert.assertTrue;
import static org.junit.Assume.assumeFalse;
import static org.junit.Assume.assumeTrue;
import static org.openqa.selenium.WaitingConditions.elementValueToEqual;
import static org.openqa.selenium.support.ui.ExpectedConditions.titleIs;
import static org.openqa.selenium.testing.Ignore.Driver.ANDROID;
import static org.openqa.selenium.testing.Ignore.Driver.CHROME;
import static org.openqa.selenium.testing.Ignore.Driver.HTMLUNIT;
import static org.openqa.selenium.testing.Ignore.Driver.IE;
import static org.openqa.selenium.testing.Ignore.Driver.IPHONE;
import static org.openqa.selenium.testing.Ignore.Driver.MARIONETTE;
import static org.openqa.selenium.testing.Ignore.Driver.OPERA;
import static org.openqa.selenium.testing.Ignore.Driver.OPERA_MOBILE;
import static org.openqa.selenium.testing.Ignore.Driver.PHANTOMJS;
import static org.openqa.selenium.testing.Ignore.Driver.REMOTE;
import static org.openqa.selenium.testing.Ignore.Driver.SAFARI;
import static org.openqa.selenium.testing.TestUtilities.getEffectivePlatform;
import static org.openqa.selenium.testing.TestUtilities.isFirefox;
import static org.openqa.selenium.testing.TestUtilities.isInternetExplorer;
import static org.openqa.selenium.testing.TestUtilities.isNativeEventsEnabled;

import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.Keys;
import org.openqa.selenium.Platform;
import org.openqa.selenium.WaitingConditions;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JUnit4TestBase;
import org.openqa.selenium.testing.JavascriptEnabled;
import org.openqa.selenium.testing.TestUtilities;

import java.util.List;

/**
 * Tests combined input actions.
 */
@Ignore(value = {ANDROID, SAFARI, MARIONETTE},
    reason = "Safari: not implemented (issue 4136)",
    issues = {4136})
public class CombinedInputActionsTest extends JUnit4TestBase {

  @JavascriptEnabled
  @Test
  @Ignore({CHROME, IE, PHANTOMJS})
  public void testPlainClickingOnMultiSelectionList() {
    assumeTrue("Only works with native events on Linux",
               isNativeEventsEnabled(driver));

    driver.get(pages.formSelectionPage);

    List<WebElement> options = driver.findElements(By.tagName("option"));

    Actions actions = new Actions(driver);
    Action selectThreeOptions = actions.click(options.get(1))
        .click(options.get(2))
        .click(options.get(3))
        .build();

    selectThreeOptions.perform();

    WebElement showButton = driver.findElement(By.name("showselected"));
    showButton.click();

    WebElement resultElement = driver.findElement(By.id("result"));
    assertEquals("Should have picked the third option only.", "cheddar",
                 resultElement.getText());
  }

  // TODO: Check if this could work in any browser without native events.
  @JavascriptEnabled
  @Test
  @Ignore({CHROME, IE, OPERA, OPERA_MOBILE})
  public void testShiftClickingOnMultiSelectionList() {
    assumeTrue("Only works with native events on Linux",
               isNativeEventsEnabled(driver) && getEffectivePlatform().is(Platform.LINUX));

    driver.get(pages.formSelectionPage);

    List<WebElement> options = driver.findElements(By.tagName("option"));

    Actions actions = new Actions(driver);
    Action selectThreeOptions = actions.click(options.get(1))
        .keyDown(Keys.SHIFT)
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

  // TODO: Check if this could work in any browser without native events.
  @JavascriptEnabled
  @Test
  @Ignore({CHROME, HTMLUNIT, IE, OPERA, OPERA_MOBILE, PHANTOMJS})
  public void testControlClickingOnMultiSelectionList() {
    assumeTrue("Only works with native events on Linux",
               isNativeEventsEnabled(driver) && getEffectivePlatform().is(Platform.LINUX));

    driver.get(pages.formSelectionPage);

    List<WebElement> options = driver.findElements(By.tagName("option"));

    Actions actions = new Actions(driver);
    Action selectThreeOptions = actions.click(options.get(1))
        .keyDown(Keys.CONTROL)
        .click(options.get(3))
        .keyUp(Keys.CONTROL)
        .build();

    selectThreeOptions.perform();

    WebElement showButton = driver.findElement(By.name("showselected"));
    showButton.click();

    WebElement resultElement = driver.findElement(By.id("result"));
    assertEquals("Should have picked the first and the third options.", "roquefort cheddar",
                 resultElement.getText());
  }

  @JavascriptEnabled
  @Ignore({ANDROID, IE, REMOTE, IPHONE, OPERA, PHANTOMJS})
  @Test
  public void testControlClickingOnCustomMultiSelectionList() {
    assumeFalse("Does not works with native events on Windows",
                isNativeEventsEnabled(driver) && getEffectivePlatform().is(Platform.WINDOWS));

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

    wait.until(ExpectedConditions.presenceOfElementLocated(By.id("normal")));
    WebElement link = driver.findElement(By.id("normal"));

    new Actions(driver)
        .click(link)
        .perform();

    wait.until(titleIs("XHTML Test Page"));
  }

  @Ignore({IPHONE})
  @Test
  public void testCanClickOnLinks() {
    navigateToClicksPageAndClickLink();
  }

  @Ignore(
      value = {HTMLUNIT, IPHONE},
      reason = "HtmlUnit: Advanced mouse actions only implemented in rendered browsers")
  @Test
  public void testCanClickOnLinksWithAnOffset() {
    driver.get(pages.clicksPage);

    wait.until(ExpectedConditions.presenceOfElementLocated(By.id("normal")));
    WebElement link = driver.findElement(By.id("normal"));

    new Actions(driver)
        .moveToElement(link, 1, 1)
        .click()
        .perform();

    wait.until(titleIs("XHTML Test Page"));
  }

  /**
   * This test demonstrates the following problem: When the representation of
   * the mouse in the driver keeps the wrong state, mouse movement will end
   * up at the wrong coordinates.
   */
  @Ignore({IPHONE, HTMLUNIT})
  @Test
  public void testMouseMovementWorksWhenNavigatingToAnotherPage() {
    navigateToClicksPageAndClickLink();

    WebElement linkId = driver.findElement(By.id("linkId"));
    new Actions(driver)
        .moveToElement(linkId, 1, 1)
        .click()
        .perform();

    wait.until(titleIs("We Arrive Here"));
  }

  @Ignore({HTMLUNIT, OPERA, OPERA_MOBILE})
  @Test
  public void testChordControlCutAndPaste() {
    assumeFalse("FIXME: macs don't have CONRTROL key", getEffectivePlatform().is(Platform.MAC));
    assumeFalse("Windows: native events library  does not support storing modifiers state yet",
                isNativeEventsEnabled(driver) && getEffectivePlatform().is(Platform.WINDOWS) &&
                (isInternetExplorer(driver) || isFirefox(driver)));
    assumeFalse("FIXME: Fails in Firefox on Linux with native events",
                isFirefox(driver) &&
                isNativeEventsEnabled(driver) &&
                getEffectivePlatform().is(Platform.LINUX));

    driver.get(pages.javascriptPage);

    WebElement element = driver.findElement(By.id("keyReporter"));

    new Actions(driver)
        .sendKeys(element, "abc def")
        .perform();

    wait.until(elementValueToEqual(element, "abc def"));

    //TODO: Figure out why calling sendKey(Key.CONTROL + "a") and then
    //sendKeys("x") does not work on Linux.
    new Actions(driver)
        .sendKeys(Keys.CONTROL + "a" + "x")
        .perform();

    // Release keys before next step.
    new Actions(driver).sendKeys(Keys.NULL).perform();

    wait.until(elementValueToEqual(element, ""));

    new Actions(driver)
        .sendKeys(Keys.CONTROL + "v")
        .sendKeys("v")
        .perform();

    new Actions(driver).sendKeys(Keys.NULL).perform();

    wait.until(elementValueToEqual(element, "abc defabc def"));
  }

  @Ignore({HTMLUNIT, OPERA, IE})
  @Test
  public void testCombiningShiftAndClickResultsInANewWindow() {
    assumeFalse("Does not works with native events on Windows",
                isNativeEventsEnabled(driver) && getEffectivePlatform().is(Platform.WINDOWS));

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

  @Ignore({HTMLUNIT, OPERA, OPERA_MOBILE, IPHONE, IE})
  @Test
  public void testHoldingDownShiftKeyWhileClicking() {
    assumeFalse("Does not works with native events on Windows",
               isNativeEventsEnabled(driver) && getEffectivePlatform().is(Platform.WINDOWS));

    driver.get(pages.clickEventPage);

    WebElement toClick = driver.findElement(By.id("eventish"));

    new Actions(driver).keyDown(Keys.SHIFT).click(toClick).keyUp(Keys.SHIFT).perform();

    WebElement shiftInfo =
        wait.until(ExpectedConditions.presenceOfElementLocated(By.id("shiftKey")));
    assertThat(shiftInfo.getText(), equalTo("true"));
  }

  @JavascriptEnabled
  @Test
  @Ignore(value = {OPERA, OPERA_MOBILE, SAFARI, MARIONETTE}, issues = {4136})
  public void canClickOnASuckerFishStyleMenu() throws InterruptedException {
    driver.get(pages.javascriptPage);

    // This test passes on IE. When running in Firefox on Windows, the test
    // will fail if the mouse cursor is not in the window. Solution: Maximize.
    if ((TestUtilities.getEffectivePlatform().is(Platform.WINDOWS)) &&
        TestUtilities.isFirefox(driver) && TestUtilities.isNativeEventsEnabled(driver)) {
      driver.manage().window().maximize();
    }

    // Move to a different element to make sure the mouse is not over the
    // element with id 'item1' (from a previous test).
    new Actions(driver).moveToElement(driver.findElement(By.id("dynamo"))).build().perform();

    WebElement element = driver.findElement(By.id("menu1"));

    final WebElement item = driver.findElement(By.id("item1"));
    assertEquals("", item.getText());

    ((JavascriptExecutor) driver).executeScript("arguments[0].style.background = 'green'", element);
    new Actions(driver).moveToElement(element).build().perform();

    // Intentionally wait to make sure hover persists.
    Thread.sleep(2000);

    item.click();

    WebElement result = driver.findElement(By.id("result"));
    wait.until(WaitingConditions.elementTextToContain(result, "item 1"));
  }

  @JavascriptEnabled
  @Test
  @Ignore(value = {SAFARI, MARIONETTE}, issues = {4136})
  public void testCanClickOnSuckerFishMenuItem() throws Exception {
    driver.get(pages.javascriptPage);

    WebElement element = driver.findElement(By.id("menu1"));

    new Actions(driver).moveToElement(element).build().perform();

    WebElement target = driver.findElement(By.id("item1"));

    assertTrue(target.isDisplayed());
    target.click();

    String text = driver.findElement(By.id("result")).getText();
    assertTrue(text.contains("item 1"));
  }

}
