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

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;
import static org.openqa.selenium.WaitingConditions.elementTextToEqual;
import static org.openqa.selenium.WaitingConditions.elementValueToEqual;
import static org.openqa.selenium.support.ui.ExpectedConditions.not;
import static org.openqa.selenium.support.ui.ExpectedConditions.titleIs;
import static org.openqa.selenium.testing.Driver.CHROME;
import static org.openqa.selenium.testing.Driver.FIREFOX;
import static org.openqa.selenium.testing.Driver.HTMLUNIT;
import static org.openqa.selenium.testing.Driver.IE;
import static org.openqa.selenium.testing.Driver.MARIONETTE;
import static org.openqa.selenium.testing.Driver.REMOTE;
import static org.openqa.selenium.testing.Driver.SAFARI;

import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.testing.NeedsFreshDriver;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.Point;
import org.openqa.selenium.testing.SwitchToTopAfterTest;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.Color;
import org.openqa.selenium.support.Colors;
import org.openqa.selenium.support.ui.ExpectedCondition;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JUnit4TestBase;
import org.openqa.selenium.testing.JavascriptEnabled;
import org.openqa.selenium.testing.NotYetImplemented;

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
  @Test
  public void testDraggingElementWithMouseMovesItToAnotherList() {
    performDragAndDropWithMouse();
    WebElement dragInto = driver.findElement(By.id("sortable1"));
    assertEquals(6, dragInto.findElements(By.tagName("li")).size());
  }

  @JavascriptEnabled
  @NotYetImplemented(HTMLUNIT)
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
  @Ignore({CHROME, IE})
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
  @Ignore({CHROME, IE, FIREFOX})
  @NotYetImplemented(HTMLUNIT)
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

  @Ignore(value = {FIREFOX, IE, REMOTE, CHROME},
          reason = "Behaviour not finalized yet regarding linked images.")
  @NotYetImplemented(HTMLUNIT)
  @Test
  public void testMovingIntoAnImageEnclosedInALink() {
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

  private int getFieldValue(Map<String, Object> sizeRect, String fieldName) {
    return (int) Double.parseDouble(sizeRect.get(fieldName).toString());
  }

  @Ignore(value = {IE, CHROME, FIREFOX}, reason = "Not implemented yet.")
  @NotYetImplemented(HTMLUNIT)
  @Test
  public void testMovingMouseBackAndForthPastViewPort() {
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

  @SwitchToTopAfterTest
  @Test
  public void testShouldClickElementInIFrame() {
    driver.get(pages.clicksPage);
    driver.switchTo().frame("source");
    WebElement element = driver.findElement(By.id("otherframe"));
    new Actions(driver).moveToElement(element).click().perform();
    driver.switchTo().defaultContent()
        .switchTo().frame("target");
    wait.until(elementTextToEqual(By.id("span"), "An inline element"));
  }

  @JavascriptEnabled
  @Ignore(
      value = {SAFARI, MARIONETTE},
      issues = {4136})
  @Test
  @NotYetImplemented(HTMLUNIT) // broken in 2.20
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
      value = {SAFARI, MARIONETTE},
      issues = {4136})
  @Test
  @NotYetImplemented(HTMLUNIT) // broken in 2.20
  public void testHoverPersists() throws Exception {
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
  @Ignore(value = {SAFARI, MARIONETTE},
          reason = "Advanced mouse actions only implemented in rendered browsers",
          issues = {4136})
  @NotYetImplemented(HTMLUNIT)
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
  @Ignore(value = {SAFARI, MARIONETTE},
          reason = "Advanced mouse actions only implemented in rendered browsers",
          issues = {4136})
  @NotYetImplemented(HTMLUNIT)
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
  @Ignore(value = {SAFARI, MARIONETTE},
          reason = "Advanced mouse actions only implemented in rendered browsers",
          issues = {4136})
  @NotYetImplemented(HTMLUNIT)
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
  @NeedsFreshDriver({IE, CHROME})
  @Ignore(value = {SAFARI, MARIONETTE},
          reason = "Advanced mouse actions only implemented in rendered browsers",
          issues = {4136})
  @NotYetImplemented(HTMLUNIT)
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
  @Ignore(value = {SAFARI, MARIONETTE}, issues = {4136})
  @NotYetImplemented(HTMLUNIT)
  public void testMoveMouseByOffsetOverAndOutOfAnElement() {
    driver.get(pages.mouseOverPage);

    WebElement greenbox = driver.findElement(By.id("greenbox"));
    WebElement redbox = driver.findElement(By.id("redbox"));
    Dimension size = redbox.getSize();
    Point greenboxPosition = greenbox.getLocation();
    Point redboxPosition = redbox.getLocation();
    int shiftX = redboxPosition.getX() - greenboxPosition.getX();
    int shiftY = redboxPosition.getY() - greenboxPosition.getY();

    new Actions(driver).moveToElement(greenbox, 2, 2).perform();

    assertEquals(
      Colors.GREEN.getColorValue(), Color.fromString(redbox.getCssValue("background-color")));

    new Actions(driver).moveToElement(greenbox, 2, 2)
      .moveByOffset(shiftX, shiftY).perform();
    assertEquals(
      Colors.RED.getColorValue(), Color.fromString(redbox.getCssValue("background-color")));

    new Actions(driver).moveToElement(greenbox, 2, 2)
      .moveByOffset(shiftX, shiftY)
      .moveByOffset(-shiftX, -shiftY).perform();
    assertEquals(
      Colors.GREEN.getColorValue(), Color.fromString(redbox.getCssValue("background-color")));
  }

  @JavascriptEnabled
  @Test
  @Ignore(value = {SAFARI, MARIONETTE},
          reason = "Advanced mouse actions only implemented in rendered browsers",
          issues = {4136})
  @NotYetImplemented(HTMLUNIT)
  public void testCanMoveOverAndOutOfAnElement() {
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
