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

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.openqa.selenium.WaitingConditions.elementTextToEqual;
import static org.openqa.selenium.WaitingConditions.elementValueToEqual;
import static org.openqa.selenium.support.Colors.GREEN;
import static org.openqa.selenium.support.Colors.RED;
import static org.openqa.selenium.support.ui.ExpectedConditions.attributeToBe;
import static org.openqa.selenium.support.ui.ExpectedConditions.not;
import static org.openqa.selenium.support.ui.ExpectedConditions.titleIs;
import static org.openqa.selenium.testing.drivers.Browser.ALL;
import static org.openqa.selenium.testing.drivers.Browser.CHROME;
import static org.openqa.selenium.testing.drivers.Browser.CHROMIUMEDGE;
import static org.openqa.selenium.testing.drivers.Browser.EDGE;
import static org.openqa.selenium.testing.drivers.Browser.FIREFOX;
import static org.openqa.selenium.testing.drivers.Browser.HTMLUNIT;
import static org.openqa.selenium.testing.drivers.Browser.IE;
import static org.openqa.selenium.testing.drivers.Browser.MARIONETTE;
import static org.openqa.selenium.testing.drivers.Browser.SAFARI;

import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.Point;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.Color;
import org.openqa.selenium.support.Colors;
import org.openqa.selenium.support.ui.ExpectedCondition;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JUnit4TestBase;
import org.openqa.selenium.testing.NeedsFreshDriver;
import org.openqa.selenium.testing.NotYetImplemented;
import org.openqa.selenium.testing.SwitchToTopAfterTest;

/**
 * Tests operations that involve mouse and keyboard.
 */
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

    assertThat(dragReporter.getText()).isEqualTo("Nothing happened.");

    try {
      holdItem.perform();
      moveToSpecificItem.perform();
      moveToOtherList.perform();

      String text = dragReporter.getText();
      assertThat(text).matches("Nothing happened. (?:DragOut *)+");
    } finally {
      drop.perform();
    }
  }

  @Test
  @NotYetImplemented(SAFARI)
  public void testDraggingElementWithMouseMovesItToAnotherList() {
    performDragAndDropWithMouse();
    WebElement dragInto = driver.findElement(By.id("sortable1"));
    assertThat(dragInto.findElements(By.tagName("li"))).hasSize(6);
  }

  // This test is very similar to testDraggingElementWithMouse. The only
  // difference is that this test also verifies the correct events were fired.
  @Test
  @NotYetImplemented(HTMLUNIT)
  @NotYetImplemented(SAFARI)
  public void testDraggingElementWithMouseFiresEvents() {
    performDragAndDropWithMouse();
    WebElement dragReporter = driver.findElement(By.id("dragging_reports"));
    // This is failing under HtmlUnit. A bug was filed.
    String text = dragReporter.getText();
    assertThat(text).matches("Nothing happened. (?:DragOut *)+DropIn RightItem 3");
  }

  private boolean isElementAvailable(WebDriver driver, By locator) {
    try {
      driver.findElement(locator);
      return true;
    } catch (NoSuchElementException e) {
      return false;
    }
  }

  @Test
  public void testDoubleClickThenGet() {
    // Fails in ff3 if WebLoadingListener removes browser listener
    driver.get(pages.javascriptPage);

    WebElement toClick = driver.findElement(By.id("clickField"));

    Action dblClick = getBuilder(driver).doubleClick(toClick).build();
    dblClick.perform();

    driver.get(pages.droppableItems);
  }

  @Test
  @NotYetImplemented(SAFARI)
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

    assertThat(text).isEqualTo("Dropped!");
  }

  @Test
  @NotYetImplemented(SAFARI)
  public void testDoubleClick() {
    driver.get(pages.javascriptPage);

    WebElement toDoubleClick = driver.findElement(By.id("doubleClickField"));

    Action dblClick = getBuilder(driver).doubleClick(toDoubleClick).build();

    dblClick.perform();
    shortWait.until(elementValueToEqual(toDoubleClick, "DoubleClicked"));
  }

  @Test
  public void testContextClick() {
    driver.get(pages.javascriptPage);

    WebElement toContextClick = driver.findElement(By.id("doubleClickField"));

    Action contextClick = getBuilder(driver).contextClick(toContextClick).build();

    contextClick.perform();
    assertThat(toContextClick.getAttribute("value")).isEqualTo("ContextClicked");
  }

  @Test
  public void testMoveAndClick() {
    driver.get(pages.javascriptPage);

    WebElement toClick = driver.findElement(By.id("clickField"));

    Action contextClick = getBuilder(driver).moveToElement(toClick).click().build();

    contextClick.perform();

    wait.until(elementValueToEqual(toClick, "Clicked"));

    assertThat(toClick.getAttribute("value")).isEqualTo("Clicked");
  }

  @Test
  public void testCannotMoveToANullLocator() {
    driver.get(pages.javascriptPage);
    assertThatExceptionOfType(IllegalArgumentException.class)
        .isThrownBy(() -> getBuilder(driver).moveToElement(null).build());
  }

  @Test
  @Ignore(CHROME)
  @Ignore(CHROMIUMEDGE)
  @Ignore(IE)
  @Ignore(FIREFOX)
  @Ignore(MARIONETTE)
  @NotYetImplemented(HTMLUNIT)
  @NotYetImplemented(SAFARI)
  @NotYetImplemented(EDGE)
  public void testMousePositionIsNotPreservedInActionsChain() {
    driver.get(pages.javascriptPage);
    WebElement toMoveTo = driver.findElement(By.id("clickField"));

    getBuilder(driver).moveToElement(toMoveTo).build().perform();

    // TODO(andreastt): Is this correct behaviour?  Should the last known mouse position be
    // disregarded if calling click() from a an Actions chain?
    assertThatExceptionOfType(InvalidCoordinatesException.class)
        .isThrownBy(() -> getBuilder(driver).click().build().perform());
  }

  @Test
  @Ignore(value = ALL, reason = "Behaviour not finalized yet regarding linked images.")
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

  @Test
  @Ignore(CHROME)
  @Ignore(CHROMIUMEDGE)
  @Ignore(IE)
  @Ignore(FIREFOX)
  @Ignore(MARIONETTE)
  @Ignore(value = HTMLUNIT, reason="test should enable JavaScript")
  @NotYetImplemented(SAFARI)
  @NotYetImplemented(EDGE)
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

  @Test
  @NotYetImplemented(SAFARI)
  public void testShouldAllowUsersToHoverOverElements() {
    driver.get(pages.javascriptPage);

    WebElement element = driver.findElement(By.id("menu1"));

    final WebElement item = driver.findElement(By.id("item1"));
    assertThat(item.getText()).isEqualTo("");

    ((JavascriptExecutor) driver).executeScript("arguments[0].style.background = 'green'", element);
    new Actions(driver).moveToElement(element).build().perform();

    wait.until(not(elementTextToEqual(item, "")));
    assertThat(item.getText()).isEqualTo("Item 1");
  }

  @Test
  @NotYetImplemented(SAFARI)
  public void testHoverPersists() throws Exception {
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

    wait.until(not(elementTextToEqual(item, "")));

    assertThat(item.getText()).isEqualTo("Item 1");
  }

  @Test
  @NotYetImplemented(HTMLUNIT)
  public void testMovingMouseByRelativeOffset() {
    driver.get(pages.mouseTrackerPage);

    WebElement trackerDiv = driver.findElement(By.id("mousetracker"));
    new Actions(driver).moveToElement(trackerDiv).perform();

    WebElement reporter = driver.findElement(By.id("status"));

    wait.until(fuzzyMatchingOfCoordinates(reporter, 50, 200));

    new Actions(driver).moveByOffset(10, 20).build().perform();

    wait.until(fuzzyMatchingOfCoordinates(reporter, 60, 220));
  }

  @Test
  @NotYetImplemented(HTMLUNIT)
  public void testMovingMouseToRelativeElementOffset() {
    driver.get(pages.mouseTrackerPage);

    WebElement trackerDiv = driver.findElement(By.id("mousetracker"));
    Dimension size = trackerDiv.getSize();
    new Actions(driver).moveToElement(trackerDiv, 95 - size.getWidth() / 2, 195 - size.getHeight() / 2).perform();

    WebElement reporter = driver.findElement(By.id("status"));

    wait.until(fuzzyMatchingOfCoordinates(reporter, 95, 195));
  }

  @Test
  @NotYetImplemented(HTMLUNIT)
  public void testMovingMouseToRelativeZeroElementOffset() {
    driver.get(pages.mouseTrackerPage);

    WebElement trackerDiv = driver.findElement(By.id("mousetracker"));
    new Actions(driver).moveToElement(trackerDiv, 0, 0).perform();

    WebElement reporter = driver.findElement(By.id("status"));

    Dimension size = trackerDiv.getSize();
    wait.until(fuzzyMatchingOfCoordinates(reporter, size.getWidth() / 2, size.getHeight() / 2));
  }

  @NeedsFreshDriver({IE, CHROME, MARIONETTE, CHROMIUMEDGE})
  @Test
  @NotYetImplemented(HTMLUNIT)
  @NotYetImplemented(SAFARI)
  @NotYetImplemented(EDGE)
  public void testMoveRelativeToBody() {
    try {
      driver.get(pages.mouseTrackerPage);

      new Actions(driver).moveByOffset(50, 100).perform();

      WebElement reporter = driver.findElement(By.id("status"));

      wait.until(fuzzyMatchingOfCoordinates(reporter, 40, 20));
    } finally {
      new Actions(driver).moveByOffset(-50, -100).perform();
    }
  }

  @Test
  @Ignore(value = MARIONETTE, issue = "https://github.com/mozilla/geckodriver/issues/789")
  @NotYetImplemented(HTMLUNIT)
  @NotYetImplemented(SAFARI)
  @NotYetImplemented(EDGE)
  public void testMoveMouseByOffsetOverAndOutOfAnElement() {
    driver.get(pages.mouseOverPage);

    WebElement greenbox = driver.findElement(By.id("greenbox"));
    WebElement redbox = driver.findElement(By.id("redbox"));
    Point greenboxPosition = greenbox.getLocation();
    Point redboxPosition = redbox.getLocation();
    int shiftX = redboxPosition.getX() - greenboxPosition.getX();
    int shiftY = redboxPosition.getY() - greenboxPosition.getY();

    Dimension greenBoxSize = greenbox.getSize();
    int xOffset = 2 - greenBoxSize.getWidth() / 2;
    int yOffset = 2 - greenBoxSize.getHeight() / 2;

    new Actions(driver).moveToElement(greenbox, xOffset, yOffset).perform();

    shortWait.until(attributeToBe(redbox, "background-color", Colors.GREEN.getColorValue().asRgba()));

    new Actions(driver).moveToElement(greenbox, xOffset, yOffset)
      .moveByOffset(shiftX, shiftY).perform();
    shortWait.until(attributeToBe(redbox, "background-color", Colors.RED.getColorValue().asRgba()));

    new Actions(driver).moveToElement(greenbox, xOffset, yOffset)
      .moveByOffset(shiftX, shiftY)
      .moveByOffset(-shiftX, -shiftY).perform();

    shortWait.until(attributeToBe(redbox, "background-color", Colors.GREEN.getColorValue().asRgba()));
  }

  @Test
  @Ignore(value = MARIONETTE, issue = "https://github.com/mozilla/geckodriver/issues/789")
  @NotYetImplemented(HTMLUNIT)
  @NotYetImplemented(SAFARI)
  @NotYetImplemented(EDGE)
  public void testCanMoveOverAndOutOfAnElement() {
    driver.get(pages.mouseOverPage);

    WebElement greenbox = driver.findElement(By.id("greenbox"));
    WebElement redbox = driver.findElement(By.id("redbox"));
    Dimension greenSize = greenbox.getSize();
    Dimension redSize = redbox.getSize();

    new Actions(driver).moveToElement(greenbox, 1 - greenSize.getWidth() / 2, 1 - greenSize.getHeight() / 2).perform();

    assertThat(Color.fromString(redbox.getCssValue("background-color")))
        .isEqualTo(GREEN.getColorValue());

    new Actions(driver).moveToElement(redbox).perform();
    assertThat(Color.fromString(redbox.getCssValue("background-color")))
        .isEqualTo(RED.getColorValue());

    // IE8 (and *only* IE8) requires a move of 2 pixels. All other browsers
    // would be happy with 1.
    new Actions(driver).moveToElement(redbox, redSize.getWidth() / 2 + 2, redSize.getHeight() / 2 + 2)
        .perform();

    wait.until(attributeToBe(redbox, "background-color", Colors.GREEN.getColorValue().asRgba()));
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
