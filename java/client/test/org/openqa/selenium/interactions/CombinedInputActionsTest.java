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

package org.openqa.selenium.interactions;

import static org.hamcrest.Matchers.equalTo;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertThat;
import static org.junit.Assert.assertTrue;
import static org.junit.Assume.assumeFalse;
import static org.openqa.selenium.WaitingConditions.elementValueToEqual;
import static org.openqa.selenium.support.ui.ExpectedConditions.presenceOfElementLocated;
import static org.openqa.selenium.support.ui.ExpectedConditions.titleIs;
import static org.openqa.selenium.testing.Driver.CHROME;
import static org.openqa.selenium.testing.Driver.FIREFOX;
import static org.openqa.selenium.testing.Driver.HTMLUNIT;
import static org.openqa.selenium.testing.Driver.IE;
import static org.openqa.selenium.testing.Driver.MARIONETTE;
import static org.openqa.selenium.testing.Driver.PHANTOMJS;
import static org.openqa.selenium.testing.Driver.REMOTE;
import static org.openqa.selenium.testing.Driver.SAFARI;
import static org.openqa.selenium.testing.TestUtilities.getEffectivePlatform;
import static org.openqa.selenium.testing.TestUtilities.getIEVersion;
import static org.openqa.selenium.testing.TestUtilities.isInternetExplorer;
import static org.openqa.selenium.testing.TestUtilities.isNativeEventsEnabled;

import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.Keys;
import org.openqa.selenium.Platform;
import org.openqa.selenium.Point;
import org.openqa.selenium.testing.SwitchToTopAfterTest;
import org.openqa.selenium.WaitingConditions;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JUnit4TestBase;
import org.openqa.selenium.testing.JavascriptEnabled;
import org.openqa.selenium.testing.NotYetImplemented;

import java.util.List;

/**
 * Tests combined input actions.
 */
@Ignore(value = {SAFARI, MARIONETTE},
    reason = "Safari: not implemented (issue 4136)",
    issues = {4136})
public class CombinedInputActionsTest extends JUnit4TestBase {

  @JavascriptEnabled
  @Test
  @Ignore({CHROME, IE, FIREFOX, PHANTOMJS})
  @NotYetImplemented(HTMLUNIT)
  public void testPlainClickingOnMultiSelectionList() {
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

  @JavascriptEnabled
  @Test
  @Ignore({CHROME, IE, FIREFOX})
  @NotYetImplemented(HTMLUNIT)
  public void testShiftClickingOnMultiSelectionList() {
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

  @JavascriptEnabled
  @Test
  @Ignore({CHROME, IE, FIREFOX, PHANTOMJS})
  @NotYetImplemented(HTMLUNIT)
  public void testControlClickingOnMultiSelectionList() {
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
  @Ignore({IE, REMOTE, PHANTOMJS})
  @Test
  public void testControlClickingOnCustomMultiSelectionList() {
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

    wait.until(presenceOfElementLocated(By.id("normal")));
    WebElement link = driver.findElement(By.id("normal"));

    new Actions(driver)
        .click(link)
        .perform();

    wait.until(titleIs("XHTML Test Page"));
  }

  @Ignore(value = {PHANTOMJS, SAFARI}, reason = "Not tested")
  @SwitchToTopAfterTest
  @Test
  public void canMoveMouseToAnElementInAnIframeAndClick() {
    driver.get(appServer.whereIs("click_tests/click_in_iframe.html"));

    wait.until(presenceOfElementLocated(By.id("ifr")));
    driver.switchTo().frame("ifr");

    WebElement link = driver.findElement(By.id("link"));

    new Actions(driver)
        .moveToElement(link)
        .click()
        .perform();

    wait.until(titleIs("Submitted Successfully!"));
  }

  @Test
  public void testCanClickOnLinks() {
    navigateToClicksPageAndClickLink();
  }

  @NotYetImplemented(HTMLUNIT)
  @Test
  public void testCanClickOnLinksWithAnOffset() {
    driver.get(pages.clicksPage);

    wait.until(presenceOfElementLocated(By.id("normal")));
    WebElement link = driver.findElement(By.id("normal"));

    new Actions(driver)
        .moveToElement(link, 1, 1)
        .click()
        .perform();

    wait.until(titleIs("XHTML Test Page"));
  }

  @NotYetImplemented(HTMLUNIT)
  @Test
  public void testClickAfterMoveToAnElementWithAnOffsetShouldUseLastMousePosition() {
    driver.get(pages.clickEventPage);

    WebElement element = driver.findElement(By.id("eventish"));
    Point location = element.getLocation();

    new Actions(driver)
        .moveToElement(element, 20, 10)
        .click()
        .perform();

    wait.until(presenceOfElementLocated(By.id("pageX")));

    int x;
    int y;
    if (isInternetExplorer(driver) && getIEVersion(driver) < 10) {
      x = Integer.parseInt(driver.findElement(By.id("clientX")).getText());
      y = Integer.parseInt(driver.findElement(By.id("clientY")).getText());
    } else {
      x = Integer.parseInt(driver.findElement(By.id("pageX")).getText());
      y = Integer.parseInt(driver.findElement(By.id("pageY")).getText());
    }

    assertTrue(fuzzyPositionMatching(location.getX() + 20, location.getY() + 10, x, y));
  }

  private boolean fuzzyPositionMatching(int expectedX, int expectedY, int actualX, int actualY) {
    // Everything within 5 pixels range is OK
    final int ALLOWED_DEVIATION = 5;
    return Math.abs(expectedX - actualX) < ALLOWED_DEVIATION &&
           Math.abs(expectedY - actualY) < ALLOWED_DEVIATION;
  }

  /**
   * This test demonstrates the following problem: When the representation of
   * the mouse in the driver keeps the wrong state, mouse movement will end
   * up at the wrong coordinates.
   */
  @NotYetImplemented(HTMLUNIT)
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

  @NotYetImplemented(HTMLUNIT)
  @Test
  public void testChordControlCutAndPaste() {
    assumeFalse("FIXME: macs don't have CONRTROL key", getEffectivePlatform().is(Platform.MAC));
    assumeFalse("Windows: native events library  does not support storing modifiers state yet",
                isNativeEventsEnabled(driver) && getEffectivePlatform().is(Platform.WINDOWS) &&
                isInternetExplorer(driver));

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

  @Ignore(IE)
  @NotYetImplemented(HTMLUNIT)
  @Test
  public void testCombiningShiftAndClickResultsInANewWindow() {
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

  @Ignore({IE, HTMLUNIT})
  @Test
  public void testHoldingDownShiftKeyWhileClicking() {
    driver.get(pages.clickEventPage);

    WebElement toClick = driver.findElement(By.id("eventish"));

    new Actions(driver).keyDown(Keys.SHIFT).click(toClick).keyUp(Keys.SHIFT).perform();

    WebElement shiftInfo =
        wait.until(presenceOfElementLocated(By.id("shiftKey")));
    assertThat(shiftInfo.getText(), equalTo("true"));
  }

  @JavascriptEnabled
  @Test
  @Ignore(value = {SAFARI, MARIONETTE}, issues = {4136})
  @NotYetImplemented(HTMLUNIT) // broken in 2.20
  public void canClickOnASuckerFishStyleMenu() throws InterruptedException {
    driver.get(pages.javascriptPage);

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
  @NotYetImplemented(HTMLUNIT) // broken in 2.20
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
