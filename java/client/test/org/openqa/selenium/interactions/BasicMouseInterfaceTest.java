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

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;
import static org.junit.Assume.assumeFalse;
import static org.junit.Assume.assumeTrue;
import static org.openqa.selenium.WaitingConditions.elementTextToContain;
import static org.openqa.selenium.WaitingConditions.elementTextToEqual;
import static org.openqa.selenium.WaitingConditions.elementValueToEqual;
import static org.openqa.selenium.ie.InternetExplorerDriver.ENABLE_PERSISTENT_HOVERING;
import static org.openqa.selenium.support.ui.ExpectedConditions.not;
import static org.openqa.selenium.support.ui.ExpectedConditions.titleIs;
import static org.openqa.selenium.testing.Ignore.Driver.ANDROID;
import static org.openqa.selenium.testing.Ignore.Driver.CHROME;
import static org.openqa.selenium.testing.Ignore.Driver.FIREFOX;
import static org.openqa.selenium.testing.Ignore.Driver.HTMLUNIT;
import static org.openqa.selenium.testing.Ignore.Driver.IE;
import static org.openqa.selenium.testing.Ignore.Driver.IPHONE;
import static org.openqa.selenium.testing.Ignore.Driver.MARIONETTE;
import static org.openqa.selenium.testing.Ignore.Driver.OPERA;
import static org.openqa.selenium.testing.Ignore.Driver.OPERA_MOBILE;
import static org.openqa.selenium.testing.Ignore.Driver.REMOTE;
import static org.openqa.selenium.testing.Ignore.Driver.SAFARI;
import static org.openqa.selenium.testing.TestUtilities.isFirefox;
import static org.openqa.selenium.testing.TestUtilities.isFirefox30;
import static org.openqa.selenium.testing.TestUtilities.isFirefox35;
import static org.openqa.selenium.testing.TestUtilities.isNativeEventsEnabled;

import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.NeedsFreshDriver;
import org.openqa.selenium.NoDriverAfterTest;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.Platform;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.support.Color;
import org.openqa.selenium.support.Colors;
import org.openqa.selenium.support.ui.ExpectedCondition;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JUnit4TestBase;
import org.openqa.selenium.testing.JavascriptEnabled;
import org.openqa.selenium.testing.NeedsLocalEnvironment;
import org.openqa.selenium.testing.TestUtilities;
import org.openqa.selenium.testing.drivers.WebDriverBuilder;

import java.awt.*;
import java.util.Map;

/**
 * Tests operations that involve mouse and keyboard.
 */
@Ignore(value = {SAFARI, MARIONETTE},
    reason = "Safari: not implemented (issue 4136)",
    issues = {4136})
public class BasicMouseInterfaceTest extends JUnit4TestBase {

  private Actions getBuilder(WebDriver driver) {
    return new Actions(driver);
  }

  private void performDragAndDropWithMouse() {
    driver.get(pages.draggableLists);

    WebElement dragReporter = driver.findElement(By.id("dragging_reports"));

    WebElement toDrag = driver.findElement(By.id("rightitem-3"));
    WebElement dragInto = driver.findElement(By.id("sortable1"));

    Action holdItem = getBuilder(driver).clickAndHold(toDrag).build();

    Action moveToSpecificItem = getBuilder(driver)
        .moveToElement(driver.findElement(By.id("leftitem-4")))
        .build();

    Action moveToOtherList = getBuilder(driver).moveToElement(dragInto).build();

    Action drop = getBuilder(driver).release(dragInto).build();

    assertEquals("Nothing happened.", dragReporter.getText());

    try {
      holdItem.perform();
      moveToSpecificItem.perform();
      moveToOtherList.perform();

      String text = dragReporter.getText();
      assertTrue(text, text.matches("Nothing happened. (?:DragOut *)+"));
    } finally {
      drop.perform();
    }
  }

  @JavascriptEnabled
  @Ignore({ANDROID, IPHONE})
  @Test
  public void testDraggingElementWithMouseMovesItToAnotherList() {
    performDragAndDropWithMouse();
    WebElement dragInto = driver.findElement(By.id("sortable1"));
    assertEquals(6, dragInto.findElements(By.tagName("li")).size());
  }

  @JavascriptEnabled
  @Ignore(
      value = {HTMLUNIT, ANDROID, IPHONE},
      reason = "Advanced mouse actions only implemented in rendered browsers")
  // This test is very similar to testDraggingElementWithMouse. The only
  // difference is that this test also verifies the correct events were fired.
  @Test
  public void testDraggingElementWithMouseFiresEvents() {
    performDragAndDropWithMouse();
    WebElement dragReporter = driver.findElement(By.id("dragging_reports"));
    // This is failing under HtmlUnit. A bug was filed.
    String text = dragReporter.getText();
    assertTrue(text, text.matches("Nothing happened. (?:DragOut *)+DropIn RightItem 3"));
  }


  private boolean isElementAvailable(WebDriver driver, By locator) {
    try {
      driver.findElement(locator);
      return true;
    } catch (NoSuchElementException e) {
      return false;
    }
  }

  @JavascriptEnabled
  @Ignore({ANDROID, IPHONE})
  @Test
  public void testDoubleClickThenGet() {
    // Fails in ff3 if WebLoadingListener removes browser listener
    driver.get(pages.javascriptPage);

    WebElement toClick = driver.findElement(By.id("clickField"));

    Action dblClick = getBuilder(driver).doubleClick(toClick).build();
    dblClick.perform();

    driver.get(pages.droppableItems);
  }

  @JavascriptEnabled
  @Ignore({ANDROID, IPHONE})
  @Test
  public void testDragAndDrop() throws InterruptedException {
    driver.get(pages.droppableItems);

    long waitEndTime = System.currentTimeMillis() + 15000;

    while (!isElementAvailable(driver, By.id("draggable")) &&
           (System.currentTimeMillis() < waitEndTime)) {
      Thread.sleep(200);
    }

    if (!isElementAvailable(driver, By.id("draggable"))) {
      throw new RuntimeException("Could not find draggable element after 15 seconds.");
    }

    WebElement toDrag = driver.findElement(By.id("draggable"));
    WebElement dropInto = driver.findElement(By.id("droppable"));

    Action holdDrag = getBuilder(driver).clickAndHold(toDrag).build();

    Action move = getBuilder(driver)
        .moveToElement(dropInto).build();

    Action drop = getBuilder(driver).release(dropInto).build();

    holdDrag.perform();
    move.perform();
    drop.perform();

    dropInto = driver.findElement(By.id("droppable"));
    String text = dropInto.findElement(By.tagName("p")).getText();

    assertEquals("Dropped!", text);
  }

  @JavascriptEnabled
  @Ignore({ANDROID, IPHONE, OPERA})
  @Test
  public void testDoubleClick() {
    driver.get(pages.javascriptPage);

    WebElement toDoubleClick = driver.findElement(By.id("doubleClickField"));

    Action dblClick = getBuilder(driver).doubleClick(toDoubleClick).build();

    dblClick.perform();
    String testFieldContent = shortWait.until(elementValueToEqual(toDoubleClick, "DoubleClicked"));
    assertEquals("Value should change to DoubleClicked.", "DoubleClicked",
                 testFieldContent);
  }

  @JavascriptEnabled
  @Ignore({ANDROID, HTMLUNIT, IPHONE})
  @Test
  public void testContextClick() {
    driver.get(pages.javascriptPage);

    WebElement toContextClick = driver.findElement(By.id("doubleClickField"));

    Action contextClick = getBuilder(driver).contextClick(toContextClick).build();

    contextClick.perform();
    assertEquals("Value should change to ContextClicked.", "ContextClicked",
                 toContextClick.getAttribute("value"));
  }

  @JavascriptEnabled
  @Ignore({ANDROID, IPHONE})
  @Test
  public void testMoveAndClick() {
    driver.get(pages.javascriptPage);

    WebElement toClick = driver.findElement(By.id("clickField"));

    Action contextClick = getBuilder(driver).moveToElement(toClick).click().build();

    contextClick.perform();

    wait.until(elementValueToEqual(toClick, "Clicked"));

    assertEquals("Value should change to Clicked.", "Clicked",
                 toClick.getAttribute("value"));
  }

  @JavascriptEnabled
  @Ignore({ANDROID, CHROME, IE, IPHONE})
  @Test
  public void testCannotMoveToANullLocator() {
    driver.get(pages.javascriptPage);

    try {
      Action contextClick = getBuilder(driver).moveToElement(null).build();

      contextClick.perform();
      fail("Shouldn't be allowed to click on null element.");
    } catch (IllegalArgumentException expected) {
      // Expected.
    }
  }

  @JavascriptEnabled
  @Ignore({ANDROID, CHROME, IE, IPHONE, FIREFOX, OPERA, HTMLUNIT, OPERA_MOBILE})
  @Test
  public void testMousePositionIsNotPreservedInActionsChain() {
    driver.get(pages.javascriptPage);
    WebElement toMoveTo = driver.findElement(By.id("clickField"));

    getBuilder(driver).moveToElement(toMoveTo).build().perform();

    // TODO(andreastt): Is this correct behaviour?  Should the last known mouse position be
    // disregarded if calling click() from a an Actions chain?
    try {
      getBuilder(driver).click().build().perform();
      fail("Shouldn't be allowed to click without a context.");
    } catch (InvalidCoordinatesException expected) {
      // expected
    }
  }

  @Ignore(value = {ANDROID, IE, HTMLUNIT, IPHONE, REMOTE, OPERA},
          reason = "Behaviour not finalized yet regarding linked images.")
  @Test
  public void testMovingIntoAnImageEnclosedInALink() {
    assumeFalse("No way to compensate for accessibility-provided offsets on Firefox 3.0 or 3.5",
                isFirefox30(driver) || isFirefox35(driver));
    assumeFalse(isFirefox(driver) && isNativeEventsEnabled(driver));

    driver.get(pages.linkedImage);

    // Note: For some reason, the Accessibility API in Firefox will not be available before we
    // click on something. As a work-around, click on a different element just to get going.
    driver.findElement(By.id("linkToAnchorOnThisPage")).click();

    WebElement linkElement = driver.findElement(By.id("linkWithEnclosedImage"));

    // Image is 644 x 41 - move towards the end.
    // Note: The width of the link element itself is correct - 644 pixels. However,
    // the height is 17 pixels and the rectangle containing it is *below* the image.
    // For this reason, this action will fail.
    new Actions(driver).moveToElement(linkElement, 500, 30).click().perform();

    wait.until(titleIs("We Arrive Here"));
  }

  @SuppressWarnings("unchecked")
  private Map<String, Object> getElementSize(WebElement element) {
    return (Map<String, Object>) ((JavascriptExecutor) driver).executeScript(
        "return arguments[0].getBoundingClientRect()", element);
  }

  private int getHeight(Map<String, Object> sizeRect) {
    if (sizeRect.containsKey("height")) {
      return getFieldValue(sizeRect, "height");
    } else {
      return getFieldValue(sizeRect, "bottom") - getFieldValue(sizeRect, "top");
    }
  }

  private int getFieldValue(Map<String, Object> sizeRect, String fieldName) {
    return (int) Double.parseDouble(sizeRect.get(fieldName).toString());
  }

  @Ignore(value = {ANDROID, IE, HTMLUNIT, IPHONE, CHROME},
          reason = "Not implemented yet.")
  @Test
  public void testMovingMousePastViewPort() {
    assumeTrue(isNativeEventsEnabled(driver));

    driver.get(pages.javascriptPage);

    WebElement keyUpArea = driver.findElement(By.id("keyPressArea"));
    new Actions(driver).moveToElement(keyUpArea).click().perform();

    Map<String, Object> keyUpSize = getElementSize(keyUpArea);

    // When moving to an element using the interactions API, the element is not scrolled
    // using scrollElementIntoView so the top of the element may not end at 0.
    // Estimate the mouse position based on the distance of the element from the top plus
    // half its size (the mouse is moved to the middle of the element by default).
    int assumedMouseY = getHeight(keyUpSize) / 2 + getFieldValue(keyUpSize, "top");

    // Calculate the scroll offset by figuring out the distance of the 'parent' element from
    // the top (adding half it's height), then substracting the current mouse position.
    // Regarding width, the event attached to this element will only be triggered if the mouse
    // hovers over the text in this element. Use a simple negative offset for this.
    Map<String, Object> parentSize = getElementSize(driver.findElement(By.id("parent")));

    int verticalMove = getFieldValue(parentSize, "top") + getHeight(parentSize) / 2 -
                       assumedMouseY;

    // Move by verticalMove pixels down and -50 pixels left:
    // we should be hitting the element with id 'parent'
    new Actions(driver).moveByOffset(-50, verticalMove).perform();

    WebElement resultArea = driver.findElement(By.id("result"));
    wait.until(elementTextToContain(resultArea, "parent matches"));
  }

  @Ignore(value = {ANDROID, IE, HTMLUNIT, IPHONE, CHROME, OPERA, OPERA_MOBILE},
          reason = "Not implemented yet.")
  @Test
  public void testMovingMouseBackAndForthPastViewPort() {
    assumeTrue(!isFirefox(driver) || isNativeEventsEnabled(driver));

    driver.get(pages.veryLargeCanvas);

    WebElement firstTarget = driver.findElement(By.id("r1"));
    new Actions(driver).moveToElement(firstTarget).click().perform();

    WebElement resultArea = driver.findElement(By.id("result"));
    String expectedEvents = "First";
    wait.until(elementTextToEqual(resultArea, expectedEvents));

    // Move to element with id 'r2', at (2500, 50) to (2580, 100)
    new Actions(driver).moveByOffset(2540 - 150, 75 - 125).click().perform();
    expectedEvents += " Second";
    wait.until(elementTextToEqual(resultArea, expectedEvents));

    // Move to element with id 'r3' at (60, 1500) to (140, 1550)
    new Actions(driver).moveByOffset(100 - 2540, 1525 - 75).click().perform();
    expectedEvents += " Third";
    wait.until(elementTextToEqual(resultArea, expectedEvents));

    // Move to element with id 'r4' at (220,180) to (320, 230)
    new Actions(driver).moveByOffset(270 - 100, 205 - 1525).click().perform();
    expectedEvents += " Fourth";
    wait.until(elementTextToEqual(resultArea, expectedEvents));
  }

  @Ignore({ANDROID, IPHONE, OPERA, OPERA_MOBILE})
  @Test
  public void testShouldClickElementInIFrame() {
    driver.get(pages.clicksPage);
    try {
      driver.switchTo().frame("source");
      WebElement element = driver.findElement(By.id("otherframe"));
      new Actions(driver).moveToElement(element).click().perform();
      driver.switchTo().defaultContent()
          .switchTo().frame("target");
      wait.until(elementTextToEqual(By.id("span"), "An inline element"));
    } finally {
      driver.switchTo().defaultContent();
    }
  }

  @JavascriptEnabled
  @Ignore(
      value = {HTMLUNIT, IPHONE,  OPERA, SAFARI, MARIONETTE},
      reason = "HtmlUnit: Advanced mouse actions only implemented in rendered browsers.",
      issues = {4136})
  @Test
  public void testShouldAllowUsersToHoverOverElements() {
    driver.get(pages.javascriptPage);

    WebElement element = driver.findElement(By.id("menu1"));

    final WebElement item = driver.findElement(By.id("item1"));
    assertEquals("", item.getText());

    ((JavascriptExecutor) driver).executeScript("arguments[0].style.background = 'green'", element);
    new Actions(driver).moveToElement(element).build().perform();

    wait.until(not(elementTextToEqual(item, "")));
    assertEquals("Item 1", item.getText());
  }

  @JavascriptEnabled
  @Ignore(
      value = {HTMLUNIT, IPHONE, OPERA, SAFARI, MARIONETTE},
      reason = "HtmlUnit: Advanced mouse actions only implemented in rendered browsers",
      issues = {4136})
  @Test
  public void testHoverPersists() throws Exception {
    // This test passes on IE. When running in Firefox on Windows, the test
    // will fail if the mouse cursor is not in the window. Solution: Maximize.
    if ((TestUtilities.getEffectivePlatform().is(Platform.WINDOWS)) &&
        TestUtilities.isFirefox(driver) && TestUtilities.isNativeEventsEnabled(driver)) {
      driver.manage().window().maximize();
    }

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

    wait.until(not(elementTextToEqual(item, "")));

    assertEquals("Item 1", item.getText());
  }

  @JavascriptEnabled
  @Ignore(
      value = {HTMLUNIT, IPHONE, OPERA, FIREFOX},
      reason = "This is an IE only tests")
  @NoDriverAfterTest
  @NeedsLocalEnvironment
  @Test
  public void testPersistentHoverCanBeTurnedOff() throws Exception {
    assumeTrue(TestUtilities.isInternetExplorer(driver));
    // Destroy the previous driver to make sure the hovering thread is
    // stopped.
    driver.quit();

    DesiredCapabilities caps = new DesiredCapabilities();
    caps.setCapability(ENABLE_PERSISTENT_HOVERING, false);
    WebDriverBuilder builder = new WebDriverBuilder().setDesiredCapabilities(caps);
    driver = builder.get();

    try {
      driver.get(pages.javascriptPage);
      // Move to a different element to make sure the mouse is not over the
      // element with id 'item1' (from a previous test).
      new Actions(driver).moveToElement(driver.findElement(By.id("keyUp"))).build().perform();
      WebElement element = driver.findElement(By.id("menu1"));

      final WebElement item = driver.findElement(By.id("item1"));
      assertEquals("", item.getText());

      ((JavascriptExecutor) driver).executeScript("arguments[0].style.background = 'green'", element);
      new Actions(driver).moveToElement(element).build().perform();

      // Move the mouse somewhere - to make sure that the thread firing the events making
      // hover persistent is not active.
      Robot robot = new Robot();
      robot.mouseMove(50, 50);

      // Intentionally wait to make sure hover DOES NOT persist.
      Thread.sleep(1000);

      wait.until(elementTextToEqual(item, ""));

      assertEquals("", item.getText());

    } finally {
      driver.quit();
    }
  }

  @JavascriptEnabled
  @Ignore(value = {HTMLUNIT, OPERA, SAFARI, MARIONETTE},
          reason = "Advanced mouse actions only implemented in rendered browsers",
          issues = {4136})
  @Test
  public void testMovingMouseByRelativeOffset() {
    driver.get(pages.mouseTrackerPage);

    WebElement trackerDiv = driver.findElement(By.id("mousetracker"));
    new Actions(driver).moveToElement(trackerDiv).build().perform();

    WebElement reporter = driver.findElement(By.id("status"));

    wait.until(fuzzyMatchingOfCoordinates(reporter, 50, 200));

    new Actions(driver).moveByOffset(10, 20).build().perform();

    wait.until(fuzzyMatchingOfCoordinates(reporter, 60, 220));
  }

  @JavascriptEnabled
  @Ignore(value = {HTMLUNIT, SAFARI, MARIONETTE},
          reason = "Advanced mouse actions only implemented in rendered browsers",
          issues = {4136})
  @Test
  public void testMovingMouseToRelativeElementOffset() {
    driver.get(pages.mouseTrackerPage);

    WebElement trackerDiv = driver.findElement(By.id("mousetracker"));
    new Actions(driver).moveToElement(trackerDiv, 95, 195).build()
        .perform();

    WebElement reporter = driver.findElement(By.id("status"));

    wait.until(fuzzyMatchingOfCoordinates(reporter, 95, 195));
  }

  @JavascriptEnabled
  @Ignore(value = {HTMLUNIT, SAFARI, MARIONETTE},
          reason = "Advanced mouse actions only implemented in rendered browsers",
          issues = {4136})
  @Test
  public void testMovingMouseToRelativeZeroElementOffset() {
    driver.get(pages.mouseTrackerPage);

    WebElement trackerDiv = driver.findElement(By.id("mousetracker"));
    new Actions(driver).moveToElement(trackerDiv, 0, 0).build()
        .perform();

    WebElement reporter = driver.findElement(By.id("status"));

    wait.until(fuzzyMatchingOfCoordinates(reporter, 0, 0));
  }

  @JavascriptEnabled
  @NeedsFreshDriver
  @Ignore(value = {HTMLUNIT, OPERA, SAFARI, MARIONETTE},
          reason = "Advanced mouse actions only implemented in rendered browsers",
          issues = {4136})
  @Test
  public void testMoveRelativeToBody() {
    try {
      driver.get(pages.mouseTrackerPage);

      new Actions(driver).moveByOffset(50, 100).build().perform();

      WebElement reporter = driver.findElement(By.id("status"));

      wait.until(fuzzyMatchingOfCoordinates(reporter, 40, 20));
    } finally {
      new Actions(driver).moveByOffset(-50, -100).build().perform();
    }
  }

  @JavascriptEnabled
  @Test
  @Ignore(value = {HTMLUNIT, OPERA, SAFARI, MARIONETTE},
          reason = "Advanced mouse actions only implemented in rendered browsers",
          issues = {4136})
  @NoDriverAfterTest
  public void canMouseOverAndOutOfAnElement() {
    driver.get(pages.mouseOverPage);

    WebElement greenbox = driver.findElement(By.id("greenbox"));
    WebElement redbox = driver.findElement(By.id("redbox"));
    Dimension size = redbox.getSize();

    new Actions(driver).moveToElement(greenbox, 1, 1).perform();

    assertEquals(
        Colors.GREEN.getColorValue(), Color.fromString(redbox.getCssValue("background-color")));

    new Actions(driver).moveToElement(redbox).perform();
    assertEquals(
        Colors.RED.getColorValue(), Color.fromString(redbox.getCssValue("background-color")));

    // IE8 (and *only* IE8) requires a move of 2 pixels. All other browsers
    // would be happy with 1.
    new Actions(driver).moveToElement(redbox, size.getWidth() + 2, size.getHeight() + 2)
        .perform();
    assertEquals(
        Colors.GREEN.getColorValue(), Color.fromString(redbox.getCssValue("background-color")));
  }

  private boolean fuzzyPositionMatching(int expectedX, int expectedY, String locationTouple) {
    String[] splitString = locationTouple.split(",");
    int gotX = Integer.parseInt(splitString[0].trim());
    int gotY = Integer.parseInt(splitString[1].trim());

    // Everything within 5 pixels range is OK
    final int ALLOWED_DEVIATION = 5;
    return Math.abs(expectedX - gotX) < ALLOWED_DEVIATION &&
           Math.abs(expectedY - gotY) < ALLOWED_DEVIATION;

  }

  private ExpectedCondition<Boolean> fuzzyMatchingOfCoordinates(
      final WebElement element, final int x, final int y) {
    return new ExpectedCondition<Boolean>() {
      @Override
      public Boolean apply(WebDriver ignored) {
        return fuzzyPositionMatching(x, y, element.getText());
      }

      @Override
      public String toString() {
        return "Coordinates: " + element.getText() + " but expected: " +
               x + ", " + y;
      }
    };
  }
}
