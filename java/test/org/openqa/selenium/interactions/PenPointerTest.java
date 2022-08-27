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

import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.Point;
import org.openqa.selenium.Rectangle;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.support.Color;
import org.openqa.selenium.support.Colors;
import org.openqa.selenium.support.ui.ExpectedCondition;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JupiterTestBase;
import org.openqa.selenium.testing.NeedsFreshDriver;
import org.openqa.selenium.testing.NotYetImplemented;
import org.openqa.selenium.testing.SwitchToTopAfterTest;

import java.time.Duration;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.openqa.selenium.WaitingConditions.elementTextToEqual;
import static org.openqa.selenium.WaitingConditions.elementValueToEqual;
import static org.openqa.selenium.support.Colors.GREEN;
import static org.openqa.selenium.support.Colors.RED;
import static org.openqa.selenium.support.ui.ExpectedConditions.attributeToBe;
import static org.openqa.selenium.support.ui.ExpectedConditions.not;
import static org.openqa.selenium.testing.drivers.Browser.CHROME;
import static org.openqa.selenium.testing.drivers.Browser.EDGE;
import static org.openqa.selenium.testing.drivers.Browser.FIREFOX;
import static org.openqa.selenium.testing.drivers.Browser.HTMLUNIT;
import static org.openqa.selenium.testing.drivers.Browser.IE;
import static org.openqa.selenium.testing.drivers.Browser.SAFARI;

/**
 * Tests operations that involve pen input device.
 */
public class PenPointerTest extends JupiterTestBase {
  private final PointerInput defaultPen = new PointerInput(PointerInput.Kind.PEN, "default pen");

  private Actions setDefaultPen(WebDriver driver) {
    return new Actions(driver).setActivePointer(PointerInput.Kind.PEN, "default pen");
  }

  private void performDragAndDropWithPen() {
    driver.get(pages.draggableLists);

    WebElement dragReporter = driver.findElement(By.id("dragging_reports"));

    WebElement toDrag = driver.findElement(By.id("rightitem-3"));
    WebElement dragInto = driver.findElement(By.id("sortable1"));
    WebElement leftItem = driver.findElement(By.id("leftitem-4"));

    Action moveToSpecificItem = setDefaultPen(driver)
      .moveToElement(leftItem).build();

    Action holdItem = setDefaultPen(driver)
      .clickAndHold(toDrag).build();

    Action moveToOtherList = setDefaultPen(driver)
      .moveToElement(dragInto).build();

    Action drop = setDefaultPen(driver)
      .release(dragInto).build();

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
  public void testDraggingElementWithPenMovesItToAnotherList() {
    performDragAndDropWithPen();
    WebElement dragInto = driver.findElement(By.id("sortable1"));
    assertThat(dragInto.findElements(By.tagName("li"))).hasSize(6);
  }

  // This test is very similar to testDraggingElementWithPen. The only
  // difference is that this test also verifies the correct events were fired.
  @Test
  @NotYetImplemented(HTMLUNIT)
  @NotYetImplemented(SAFARI)
  public void testDraggingElementWithPenFiresEvents() {
    performDragAndDropWithPen();
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

    Action holdDrag = setDefaultPen(driver).clickAndHold(toDrag).build();
    Action move = setDefaultPen(driver).moveToElement(dropInto).build();
    Action drop = setDefaultPen(driver).release(dropInto).build();

    holdDrag.perform();
    move.perform();
    drop.perform();

    String text = dropInto.findElement(By.tagName("p")).getText();

    assertThat(text).isEqualTo("Dropped!");
  }

  @Test
  public void testMoveAndClick() {
    driver.get(pages.javascriptPage);

    WebElement toClick = driver.findElement(By.id("clickField"));

    Action contextClick = setDefaultPen(driver).moveToElement(toClick).click().build();
    contextClick.perform();

    wait.until(elementValueToEqual(toClick, "Clicked"));

    assertThat(toClick.getAttribute("value")).isEqualTo("Clicked");
  }

  @Test
  public void testCannotMoveToANullLocator() {
    driver.get(pages.javascriptPage);
    assertThatExceptionOfType(IllegalArgumentException.class)
      .isThrownBy(() -> setDefaultPen(driver).moveToElement(null).build());
  }

  @Test
  @Ignore(value = HTMLUNIT, reason = "test should enable JavaScript")
  @NotYetImplemented(SAFARI)
  public void testMovingPastViewPortThrowsException() {
    assertThatExceptionOfType(MoveTargetOutOfBoundsException.class)
      .isThrownBy(() -> setDefaultPen(driver).moveByOffset(-1000, -1000).perform());
  }

  @SwitchToTopAfterTest
  @Test
  public void testShouldClickElementInIFrame() {
    driver.get(pages.clicksPage);
    driver.switchTo().frame("source");
    WebElement element = driver.findElement(By.id("otherframe"));

    setDefaultPen(driver).moveToElement(element).click().perform();

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

    setDefaultPen(driver).moveToElement(element).build().perform();

    wait.until(not(elementTextToEqual(item, "")));
    assertThat(item.getText()).isEqualTo("Item 1");
  }

  @Test
  @NotYetImplemented(SAFARI)
  public void testHoverPersists() throws Exception {
    driver.get(pages.javascriptPage);
    // Move to a different element to make sure the pen is not over the
    // element with id 'item1' (from a previous test).

    setDefaultPen(driver).moveToElement(driver.findElement(By.id("dynamo"))).build().perform();

    WebElement element = driver.findElement(By.id("menu1"));

    final WebElement item = driver.findElement(By.id("item1"));
    assertThat(item.getText()).isEqualTo("");

    ((JavascriptExecutor) driver).executeScript("arguments[0].style.background = 'green'", element);

    setDefaultPen(driver).moveToElement(element).build().perform();

    // Intentionally wait to make sure hover persists.
    Thread.sleep(2000);

    wait.until(not(elementTextToEqual(item, "")));

    assertThat(item.getText()).isEqualTo("Item 1");
  }

  @Test
  @NotYetImplemented(HTMLUNIT)
  public void testMovingPenByRelativeOffset() {
    driver.get(pages.mouseTrackerPage);

    WebElement trackerDiv = driver.findElement(By.id("mousetracker"));

    setDefaultPen(driver).moveToElement(trackerDiv).perform();

    WebElement reporter = driver.findElement(By.id("status"));

    wait.until(fuzzyMatchingOfCoordinates(reporter, 50, 200));

    setDefaultPen(driver).moveByOffset(10, 20).build().perform();

    wait.until(fuzzyMatchingOfCoordinates(reporter, 60, 220));
  }

  @Test
  @NotYetImplemented(HTMLUNIT)
  public void testMovingPenToRelativeElementOffset() {
    driver.get(pages.mouseTrackerPage);

    WebElement trackerDiv = driver.findElement(By.id("mousetracker"));
    Dimension size = trackerDiv.getSize();
    setDefaultPen(driver).moveToElement(trackerDiv, 95 - size.getWidth() / 2, 195 - size.getHeight() / 2).perform();

    WebElement reporter = driver.findElement(By.id("status"));

    wait.until(fuzzyMatchingOfCoordinates(reporter, 95, 195));
  }

  @Test
  @NotYetImplemented(HTMLUNIT)
  public void testMovingPenToRelativeZeroElementOffset() {
    driver.get(pages.mouseTrackerPage);

    WebElement trackerDiv = driver.findElement(By.id("mousetracker"));
    setDefaultPen(driver).moveToElement(trackerDiv, 0, 0).perform();

    WebElement reporter = driver.findElement(By.id("status"));

    Dimension size = trackerDiv.getSize();
    wait.until(fuzzyMatchingOfCoordinates(reporter, size.getWidth() / 2, size.getHeight() / 2));
  }

  @NeedsFreshDriver({IE, CHROME, FIREFOX, EDGE})
  @Test
  @NotYetImplemented(HTMLUNIT)
  @NotYetImplemented(SAFARI)
  public void testMoveRelativeToBody() {
    try {
      driver.get(pages.mouseTrackerPage);

      setDefaultPen(driver).moveByOffset(50, 100).perform();

      WebElement reporter = driver.findElement(By.id("status"));

      wait.until(fuzzyMatchingOfCoordinates(reporter, 40, 20));
    } finally {
      Sequence actionList = new Sequence(defaultPen, 0)
        .addAction(defaultPen.createPointerMove(Duration.ZERO, PointerInput.Origin.pointer(), -50, -100));
      ((RemoteWebDriver) driver).perform(Collections.singletonList(actionList));
    }
  }

  @Test
  @Ignore(value = FIREFOX, issue = "https://github.com/mozilla/geckodriver/issues/789")
  @NotYetImplemented(HTMLUNIT)
  @NotYetImplemented(SAFARI)
  public void testMovePenByOffsetOverAndOutOfAnElement() {
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

    setDefaultPen(driver).moveToElement(greenbox, xOffset, yOffset).perform();

    shortWait.until(attributeToBe(redbox, "background-color", Colors.GREEN.getColorValue().asRgba()));

    setDefaultPen(driver).moveToElement(greenbox, xOffset, yOffset)
      .moveByOffset(shiftX, shiftY).perform();
    shortWait.until(attributeToBe(redbox, "background-color", Colors.RED.getColorValue().asRgba()));

    setDefaultPen(driver).moveToElement(greenbox, xOffset, yOffset)
      .moveByOffset(shiftX, shiftY)
      .moveByOffset(-shiftX, -shiftY).perform();

    shortWait.until(attributeToBe(redbox, "background-color", Colors.GREEN.getColorValue().asRgba()));
  }

  @Test
  @Ignore(value = FIREFOX, issue = "https://github.com/mozilla/geckodriver/issues/789")
  @NotYetImplemented(HTMLUNIT)
  @NotYetImplemented(SAFARI)
  public void testCanMoveOverAndOutOfAnElement() {
    driver.get(pages.mouseOverPage);

    WebElement greenbox = driver.findElement(By.id("greenbox"));
    WebElement redbox = driver.findElement(By.id("redbox"));
    Dimension greenSize = greenbox.getSize();
    Dimension redSize = redbox.getSize();

    setDefaultPen(driver).moveToElement(greenbox, 1 - greenSize.getWidth() / 2, 1 - greenSize.getHeight() / 2).perform();

    assertThat(Color.fromString(redbox.getCssValue("background-color")))
      .isEqualTo(GREEN.getColorValue());

    setDefaultPen(driver).moveToElement(redbox).perform();
    assertThat(Color.fromString(redbox.getCssValue("background-color")))
      .isEqualTo(RED.getColorValue());

    setDefaultPen(driver).moveToElement(redbox, redSize.getWidth() / 1 + 1, redSize.getHeight() / 1 + 1)
      .perform();

    wait.until(attributeToBe(redbox, "background-color", Colors.GREEN.getColorValue().asRgba()));
  }

  @Test
  @Ignore(value = FIREFOX, issue = "https://github.com/mozilla/geckodriver/issues/789")
  public void setPointerEventProperties() {
    driver.get(pages.pointerActionsPage);
    long start = System.currentTimeMillis();

    WebElement pointerArea = driver.findElement(By.id("pointerArea"));
    PointerInput pen = new PointerInput(PointerInput.Kind.PEN, "default pen");
    PointerInput.PointerEventProperties eventProperties = PointerInput.eventProperties()
      .setTiltX(-72)
      .setTiltY(9)
      .setTwist(86);
    PointerInput.Origin origin = PointerInput.Origin.fromElement(pointerArea);

    Sequence actionListPen = new Sequence(pen, 0)
      .addAction(pen.createPointerMove(Duration.ZERO, origin, 0, 0))
      .addAction(pen.createPointerDown(0))
      .addAction(pen.createPointerMove(Duration.ofMillis(800), origin, 2, 2, eventProperties))
      .addAction(pen.createPointerUp(0));

    ((RemoteWebDriver) driver).perform(List.of(actionListPen));

    long duration = System.currentTimeMillis() - start;
    Assertions.assertThat(duration).isGreaterThan(2);

    List<WebElement> moves = driver.findElements(By.className("pointermove"));
    Map<String, String> moveTo = properties(moves.get(0));
    Map<String, String> down = properties(driver.findElement(By.className("pointerdown")));
    Map<String, String> moveBy = properties(moves.get(1));
    Map<String, String> up = properties(driver.findElement(By.className("pointerup")));

    Rectangle rect = pointerArea.getRect();

    int centerX = (int) Math.floor(rect.width / 2 + rect.getX());
    int centerY = (int) Math.floor(rect.height / 2 + rect.getY());
    Assertions.assertThat(moveTo.get("button")).isEqualTo("-1");
    Assertions.assertThat(moveTo.get("pageX")).isEqualTo("" + centerX);
    Assertions.assertThat(moveTo.get("pageY")).isEqualTo("" + centerY);
    Assertions.assertThat(down.get("button")).isEqualTo("0");
    Assertions.assertThat(down.get("pageX")).isEqualTo("" + centerX);
    Assertions.assertThat(down.get("pageY")).isEqualTo("" + centerY);
    Assertions.assertThat(moveBy.get("button")).isEqualTo("-1");
    Assertions.assertThat(moveBy.get("pageX")).isEqualTo("" + (centerX + 2));
    Assertions.assertThat(moveBy.get("pageY")).isEqualTo("" + (centerY + 2));
    Assertions.assertThat(moveBy.get("tiltX")).isEqualTo("-72");
    Assertions.assertThat(moveBy.get("tiltY")).isEqualTo("9");
    Assertions.assertThat(moveBy.get("twist")).isEqualTo("86");
    Assertions.assertThat(up.get("button")).isEqualTo("0");
    Assertions.assertThat(up.get("pageX")).isEqualTo("" + (centerX + 2));
    Assertions.assertThat(up.get("pageY")).isEqualTo("" + (centerY + 2));
  }

    private Map<String, String> properties(WebElement element) {
    String text = element.getText();
    text = text.substring(text.indexOf(' ') + 1);

    return Arrays.stream(text.split(", "))
      .map(s -> s.split(": "))
      .collect(Collectors.toMap(
        a -> a[0],  //key
        a -> a[1]   //value
      ));
  }

  private boolean fuzzyPositionMatching(int expectedX, int expectedY, String locationTuple) {
    String[] splitString = locationTuple.split(",");
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
