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

import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.Keys;
import org.openqa.selenium.Platform;
import org.openqa.selenium.Point;
import org.openqa.selenium.WaitingConditions;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JupiterTestBase;
import org.openqa.selenium.testing.NotYetImplemented;
import org.openqa.selenium.testing.SwitchToTopAfterTest;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assumptions.assumeFalse;
import static org.openqa.selenium.WaitingConditions.elementValueToEqual;
import static org.openqa.selenium.WaitingConditions.windowHandleCountToBe;
import static org.openqa.selenium.support.ui.ExpectedConditions.presenceOfElementLocated;
import static org.openqa.selenium.support.ui.ExpectedConditions.titleIs;
import static org.openqa.selenium.testing.TestUtilities.getEffectivePlatform;
import static org.openqa.selenium.testing.TestUtilities.getIEVersion;
import static org.openqa.selenium.testing.TestUtilities.isInternetExplorer;
import static org.openqa.selenium.testing.TestUtilities.isNativeEventsEnabled;
import static org.openqa.selenium.testing.drivers.Browser.CHROME;
import static org.openqa.selenium.testing.drivers.Browser.FIREFOX;
import static org.openqa.selenium.testing.drivers.Browser.HTMLUNIT;
import static org.openqa.selenium.testing.drivers.Browser.IE;
import static org.openqa.selenium.testing.drivers.Browser.SAFARI;

/**
 * Tests combined input actions.
 */
public class CombinedInputActionsTest extends JupiterTestBase {

  @Test
  @Ignore(IE)
  @NotYetImplemented(SAFARI)
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
    assertThat(resultElement.getText())
      .describedAs("Should have picked the third option only").isEqualTo("cheddar");
  }

  @Test
  @Ignore(IE)
  @NotYetImplemented(SAFARI)
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
    assertThat(resultElement.getText())
      .describedAs("Should have picked the last three options")
      .isEqualTo("roquefort parmigiano cheddar");
  }

  @Test
  @Ignore(IE)
  @NotYetImplemented(SAFARI)
  public void testMultipleInputs() {
    driver.get(pages.formSelectionPage);

    List<WebElement> options = driver.findElements(By.tagName("option"));

    Actions actions = new Actions(driver);
    Action selectThreeOptions = actions.setActivePointer(PointerInput.Kind.PEN, "default pen")
      .click(options.get(1))
      .keyDown(Keys.SHIFT)
      .click(options.get(1))
      .setActivePointer(PointerInput.Kind.MOUSE, "default mouse")
      .click(options.get(3))
      .keyUp(Keys.SHIFT)
      .build();

    selectThreeOptions.perform();

    WebElement showButton = driver.findElement(By.name("showselected"));
    showButton.click();

    WebElement resultElement = driver.findElement(By.id("result"));
    assertThat(resultElement.getText())
      .describedAs("Should have picked the last three options")
      .isEqualTo("roquefort parmigiano cheddar");
  }

  @Test
  @Ignore(IE)
  @Ignore(value = FIREFOX, travis = true)
  public void testControlClickingOnMultiSelectionList() {
    assumeFalse(getEffectivePlatform(driver).is(Platform.MAC),
      "FIXME: macs don't have CONTROL key");
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
    assertThat(resultElement.getText())
      .describedAs("Should have picked the first and the third options")
      .isEqualTo("roquefort cheddar");
  }

  @Test
  @Ignore(IE)
  @Ignore(value = FIREFOX, travis = true)
  public void testControlClickingOnCustomMultiSelectionList() {
    driver.get(pages.selectableItemsPage);
    Keys key = getEffectivePlatform(driver).is(Platform.MAC) ? Keys.COMMAND : Keys.CONTROL;

    WebElement reportingElement = driver.findElement(By.id("infodiv"));

    assertThat(reportingElement.getText()).isEqualTo("no info");

    List<WebElement> listItems = driver.findElements(By.tagName("li"));

    Actions actions = new Actions(driver);
    Action selectThreeItems = actions.keyDown(key)
      .click(listItems.get(1))
      .click(listItems.get(3))
      .click(listItems.get(5))
      .keyUp(key)
      .build();

    selectThreeItems.perform();

    assertThat(reportingElement.getText()).isEqualTo("#item2 #item4 #item6");

    // Now click on another element, make sure that's the only one selected.
    actions = new Actions(driver);
    actions.click(listItems.get(6)).build().perform();
    assertThat(reportingElement.getText()).isEqualTo("#item7");
  }

  @Test
  @Ignore(IE)
  @Ignore(value = FIREFOX, travis = true)
  public void testControlClickingWithMultiplePointers() {
    driver.get(pages.selectableItemsPage);

    Keys key = getEffectivePlatform(driver).is(Platform.MAC) ? Keys.COMMAND : Keys.CONTROL;
    WebElement reportingElement = driver.findElement(By.id("infodiv"));

    assertThat(reportingElement.getText()).isEqualTo("no info");

    List<WebElement> listItems = driver.findElements(By.tagName("li"));

    Actions actions = new Actions(driver);
    Action selectThreeItems = actions
      .keyDown(key)
      .setActivePointer(PointerInput.Kind.PEN, "default pen")
      .click(listItems.get(1))
      .setActivePointer(PointerInput.Kind.MOUSE, "default mouse")
      .click(listItems.get(3))
      .setActivePointer(PointerInput.Kind.PEN, "default pen")
      .click(listItems.get(5))
      .keyUp(key)
      .build();

    selectThreeItems.perform();

    assertThat(reportingElement.getText()).isEqualTo("#item2 #item4 #item6");
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

  @Test
  @NotYetImplemented(HTMLUNIT)
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

  @Test
  @NotYetImplemented(HTMLUNIT)
  public void testClickAfterMoveToAnElementWithAnOffsetShouldUseLastMousePosition() {
    driver.get(pages.clickEventPage);

    WebElement element = driver.findElement(By.id("eventish"));
    Dimension size = element.getSize();
    Point location = element.getLocation();

    new Actions(driver)
      .moveToElement(element, 20 - size.getWidth() / 2, 10 - size.getHeight() / 2)
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

    assertThat(fuzzyPositionMatching(location.getX() + 20, location.getY() + 10, x, y)).isTrue();
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
  @Test
  @NotYetImplemented(HTMLUNIT)
  public void testMouseMovementWorksWhenNavigatingToAnotherPage() {
    navigateToClicksPageAndClickLink();

    WebElement linkId = driver.findElement(By.id("linkId"));
    new Actions(driver)
      .moveToElement(linkId, 1, 1)
      .click()
      .perform();

    wait.until(titleIs("We Arrive Here"));
  }

  @Test
  @Ignore(value = FIREFOX, issue = "https://github.com/mozilla/geckodriver/issues/646")
  @NotYetImplemented(CHROME)
  public void testChordControlCutAndPaste() {
    assumeFalse(getEffectivePlatform(driver).is(Platform.MAC), "FIXME: macs don't have CONTROL key");
    assumeFalse(isNativeEventsEnabled(driver) &&
      getEffectivePlatform(driver).is(Platform.WINDOWS) &&
      isInternetExplorer(driver), "Windows: native events library  does not support storing modifiers state yet");

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

  @Test
  @Ignore(IE)
  @NotYetImplemented(SAFARI)
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

    wait.until(windowHandleCountToBe(nWindows + 1));
    assertThat(driver.getTitle())
      .describedAs("Should not have navigated away").isEqualTo(originalTitle);
  }

  @Test
  @Ignore(IE)
  @NotYetImplemented(SAFARI)
  public void testHoldingDownShiftKeyWhileClicking() {
    driver.get(pages.clickEventPage);

    WebElement toClick = driver.findElement(By.id("eventish"));

    new Actions(driver).keyDown(Keys.SHIFT).click(toClick).keyUp(Keys.SHIFT).perform();

    WebElement shiftInfo = wait.until(presenceOfElementLocated(By.id("shiftKey")));
    assertThat(shiftInfo.getText()).isEqualTo("true");
  }

  @Test
  @NotYetImplemented(SAFARI)
  public void canClickOnASuckerFishStyleMenu() throws InterruptedException {
    driver.get(pages.javascriptPage);

    // Move to a different element to make sure the mouse is not over the
    // element with id 'item1' (from a previous test).
    new Actions(driver).moveToElement(driver.findElement(By.id("dynamo"))).build().perform();

    WebElement element = driver.findElement(By.id("menu1"));

    final WebElement item = driver.findElement(By.id("item1"));
    assertThat(item.getText()).isEqualTo("");

    ((JavascriptExecutor) driver).executeScript("arguments[0].style.background = 'green'", element);
    new Actions(driver).moveToElement(element).build().perform();

    // Intentionally wait to make sure hover persists.
    Thread.sleep(2000);

    item.click();

    WebElement result = driver.findElement(By.id("result"));
    wait.until(WaitingConditions.elementTextToContain(result, "item 1"));
  }

  @Test
  public void testCanClickOnSuckerFishMenuItem() {
    driver.get(pages.javascriptPage);

    WebElement element = driver.findElement(By.id("menu1"));

    new Actions(driver).moveToElement(element).build().perform();

    WebElement target = driver.findElement(By.id("item1"));

    assertThat(target.isDisplayed()).isTrue();
    target.click();

    String text = driver.findElement(By.id("result")).getText();
    assertThat(text).contains("item 1");
  }

}
