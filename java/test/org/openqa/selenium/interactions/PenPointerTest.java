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

import static java.time.Duration.ZERO;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.openqa.selenium.WaitingConditions.color;
import static org.openqa.selenium.WaitingConditions.elementTextToEqual;
import static org.openqa.selenium.WaitingConditions.elementValueToEqual;
import static org.openqa.selenium.WaitingConditions.fuzzyMatchingOfCoordinates;
import static org.openqa.selenium.interactions.PointerInput.Kind.PEN;
import static org.openqa.selenium.support.Colors.GREEN;
import static org.openqa.selenium.support.Colors.RED;
import static org.openqa.selenium.support.ui.ExpectedConditions.not;
import static org.openqa.selenium.support.ui.ExpectedConditions.visibilityOf;
import static org.openqa.selenium.support.ui.ExpectedConditions.visibilityOfElementLocated;
import static org.openqa.selenium.testing.drivers.Browser.FIREFOX;
import static org.openqa.selenium.testing.drivers.Browser.SAFARI;

import java.time.Duration;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.Point;
import org.openqa.selenium.Rectangle;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.testing.JupiterTestBase;
import org.openqa.selenium.testing.NotYetImplemented;
import org.openqa.selenium.testing.SwitchToTopAfterTest;

/** Tests operations that involve pen input device. */
class PenPointerTest extends JupiterTestBase {
  private void resetMousePointer() {
    WebElement body = driver.findElement(By.tagName("body"));
    Dimension size = body.getSize();
    setDefaultPen(driver).moveToElement(body, -size.width / 2, -size.height / 2).click().perform();
  }

  private Actions setDefaultPen(WebDriver driver) {
    return new Actions(driver).setActivePointer(PEN, "default pen");
  }

  private void performDragAndDropWithPen() {
    driver.get(pages.draggableLists);

    WebElement dragReporter = wait.until(visibilityOfElementLocated(By.id("dragging_reports")));
    WebElement toDrag = wait.until(visibilityOfElementLocated(By.id("rightitem-3")));
    WebElement dragInto = wait.until(visibilityOfElementLocated(By.id("sortable1")));
    WebElement leftItem = wait.until(visibilityOfElementLocated(By.id("leftitem-4")));

    Action moveToSpecificItem = setDefaultPen(driver).moveToElement(leftItem).build();

    Action holdItem = setDefaultPen(driver).clickAndHold(toDrag).build();

    Action moveToOtherList = setDefaultPen(driver).moveToElement(dragInto).build();

    Action drop = setDefaultPen(driver).release(dragInto).build();

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
  @NotYetImplemented(FIREFOX)
  public void testDraggingElementWithPenMovesItToAnotherList() {
    performDragAndDropWithPen();
    WebElement dragInto = driver.findElement(By.id("sortable1"));
    assertThat(dragInto.findElements(By.tagName("li"))).hasSize(6);
  }

  // This test is very similar to testDraggingElementWithPen. The only
  // difference is that this test also verifies the correct events were fired.
  @Test
  @NotYetImplemented(SAFARI)
  @NotYetImplemented(FIREFOX)
  public void testDraggingElementWithPenFiresEvents() {
    performDragAndDropWithPen();
    WebElement dragReporter = driver.findElement(By.id("dragging_reports"));
    String text = dragReporter.getText();
    assertThat(text).matches("Nothing happened. (?:DragOut *)+DropIn RightItem 3");
  }

  @Test
  @NotYetImplemented(SAFARI)
  @NotYetImplemented(FIREFOX)
  public void testDragAndDrop() {
    driver.get(pages.droppableItems);

    WebElement toDrag = wait.until(visibilityOfElementLocated(By.id("draggable")));
    WebElement dropInto = wait.until(visibilityOfElementLocated(By.id("droppable")));

    Action holdDrag = setDefaultPen(driver).clickAndHold(toDrag).build();
    Action move = setDefaultPen(driver).moveToElement(dropInto).build();
    Action drop = setDefaultPen(driver).release(dropInto).build();

    holdDrag.perform();
    move.perform();
    drop.perform();

    wait.until(elementTextToEqual(By.cssSelector("#droppable p"), "Dropped!"));
  }

  @Test
  @NotYetImplemented(FIREFOX)
  void testMoveAndClick() {
    driver.get(pages.javascriptPage);

    WebElement toClick = driver.findElement(By.id("clickField"));

    Action contextClick = setDefaultPen(driver).moveToElement(toClick).click().build();
    contextClick.perform();

    wait.until(elementValueToEqual(toClick, "Clicked"));

    assertThat(toClick.getAttribute("value")).isEqualTo("Clicked");
  }

  @Test
  @SuppressWarnings("DataFlowIssue")
  void testCannotMoveToANullLocator() {
    driver.get(pages.javascriptPage);
    assertThatThrownBy(() -> setDefaultPen(driver).moveToElement(null).build())
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessage("Element must be set");
  }

  @Test
  @NotYetImplemented(SAFARI)
  public void testMovingPastViewPortThrowsException() {
    assertThatThrownBy(() -> setDefaultPen(driver).moveByOffset(-1000, -1000).perform())
        .isInstanceOf(MoveTargetOutOfBoundsException.class)
        .satisfiesAnyOf(
            ex ->
                assertThat(ex)
                    .hasMessageStartingWith("Move target (-1000, -1000) is out of bounds"),
            ex -> assertThat(ex).hasMessageStartingWith("move target out of bounds"));
  }

  @SwitchToTopAfterTest
  @Test
  @NotYetImplemented(FIREFOX)
  void testShouldClickElementInIFrame() {
    driver.get(pages.clicksPage);
    driver.switchTo().frame("source");
    WebElement element = driver.findElement(By.id("otherframe"));

    setDefaultPen(driver).moveToElement(element).click().perform();

    driver.switchTo().defaultContent().switchTo().frame("target");
    wait.until(elementTextToEqual(By.id("span"), "An inline element"));
  }

  @Test
  @NotYetImplemented(SAFARI)
  @NotYetImplemented(FIREFOX)
  public void testShouldAllowUsersToHoverOverElements() {
    driver.get(pages.javascriptPage);

    WebElement element = driver.findElement(By.id("menu1"));

    final WebElement item = driver.findElement(By.id("item1"));
    assertThat(item.getText()).isEmpty();

    ((JavascriptExecutor) driver).executeScript("arguments[0].style.background = 'green'", element);

    setDefaultPen(driver).moveToElement(element).build().perform();

    wait.until(not(elementTextToEqual(item, "")));
    assertThat(item.getText()).isEqualTo("Item 1");
  }

  @Test
  @NotYetImplemented(SAFARI)
  @NotYetImplemented(FIREFOX)
  public void testHoverPersists() {
    driver.get(pages.javascriptPage);
    unfocusMenu();

    WebElement menu = driver.findElement(By.id("menu1"));
    WebElement menuItem = driver.findElement(By.id("item1"));
    assertThat(menuItem.isDisplayed()).isFalse();
    assertThat(driver.findElement(By.id("result")).getText()).isBlank();

    // Hover the menu icon
    setDefaultPen(driver).moveToElement(menu).build().perform();
    ((JavascriptExecutor) driver).executeScript("arguments[0].style.background = 'green'", menu);

    // Wait until the menu items appear
    wait.until(visibilityOf(menuItem));
    assertThat(menuItem.getText()).isEqualTo("Item 1");

    menuItem.click();
    wait.until(elementTextToEqual(By.id("result"), "item 1"));
  }

  /**
   * Move to a different element to make sure the mouse is not over the menu items (from a previous
   * test).
   */
  private void unfocusMenu() {
    setDefaultPen(driver).moveToElement(driver.findElement(By.id("dynamo"))).build().perform();
  }

  @Test
  @NotYetImplemented(FIREFOX)
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
  @NotYetImplemented(FIREFOX)
  public void testMovingPenToRelativeElementOffset() {
    driver.get(pages.mouseTrackerPage);

    WebElement trackerDiv = driver.findElement(By.id("mousetracker"));
    Dimension size = trackerDiv.getSize();
    setDefaultPen(driver)
        .moveToElement(trackerDiv, 95 - size.getWidth() / 2, 195 - size.getHeight() / 2)
        .perform();

    WebElement reporter = driver.findElement(By.id("status"));

    wait.until(fuzzyMatchingOfCoordinates(reporter, 95, 195));
  }

  @Test
  @NotYetImplemented(FIREFOX)
  public void testMovingPenToRelativeZeroElementOffset() {
    driver.get(pages.mouseTrackerPage);

    WebElement trackerDiv = driver.findElement(By.id("mousetracker"));
    setDefaultPen(driver).moveToElement(trackerDiv, 0, 0).perform();

    WebElement reporter = driver.findElement(By.id("status"));

    Dimension size = trackerDiv.getSize();
    wait.until(fuzzyMatchingOfCoordinates(reporter, size.getWidth() / 2, size.getHeight() / 2));
  }

  @Test
  @NotYetImplemented(SAFARI)
  @NotYetImplemented(FIREFOX)
  public void testMoveRelativeToBody() {
    resetMousePointer();
    try {
      driver.get(pages.mouseTrackerPage);

      setDefaultPen(driver).moveByOffset(70, 180).perform();

      WebElement reporter = driver.findElement(By.id("status"));

      wait.until(fuzzyMatchingOfCoordinates(reporter, 70, 180));
    } finally {
      resetMousePointer();
    }
  }

  @Test
  @NotYetImplemented(SAFARI)
  @NotYetImplemented(FIREFOX)
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

    shortWait.until(color(redbox, "background-color", GREEN));

    setDefaultPen(driver)
        .moveToElement(greenbox, xOffset, yOffset)
        .moveByOffset(shiftX, shiftY)
        .perform();
    shortWait.until(color(redbox, "background-color", RED));

    setDefaultPen(driver)
        .moveToElement(greenbox, xOffset, yOffset)
        .moveByOffset(shiftX, shiftY)
        .moveByOffset(-shiftX, -shiftY)
        .perform();

    shortWait.until(color(redbox, "background-color", GREEN));
  }

  @Test
  @NotYetImplemented(SAFARI)
  @NotYetImplemented(FIREFOX)
  public void testCanMoveOverAndOutOfAnElement() {
    driver.get(pages.mouseOverPage);

    WebElement greenbox = driver.findElement(By.id("greenbox"));
    WebElement redbox = driver.findElement(By.id("redbox"));
    Dimension greenSize = greenbox.getSize();
    Dimension redSize = redbox.getSize();

    setDefaultPen(driver)
        .moveToElement(greenbox, 1 - greenSize.getWidth() / 2, 1 - greenSize.getHeight() / 2)
        .perform();

    shortWait.until(color(redbox, "background-color", GREEN));

    setDefaultPen(driver).moveToElement(redbox).perform();
    shortWait.until(color(redbox, "background-color", RED));

    setDefaultPen(driver)
        .moveToElement(redbox, redSize.getWidth() + 1, redSize.getHeight() + 1)
        .perform();

    shortWait.until(color(redbox, "background-color", GREEN));
  }

  @Test
  @NotYetImplemented(FIREFOX)
  public void setPointerEventProperties() {
    driver.get(pages.pointerActionsPage);
    long start = System.currentTimeMillis();

    WebElement pointerArea = driver.findElement(By.id("pointerArea"));
    PointerInput pen = new PointerInput(PEN, "default pen");
    PointerInput.PointerEventProperties eventProperties =
        PointerInput.eventProperties().setTiltX(-72).setTiltY(9).setTwist(86);
    PointerInput.Origin origin = PointerInput.Origin.fromElement(pointerArea);

    Sequence actionListPen =
        new Sequence(pen, 0)
            .addAction(pen.createPointerMove(ZERO, origin, 0, 0))
            .addAction(pen.createPointerDown(0))
            .addAction(
                pen.createPointerMove(
                    Duration.ofMillis(800), origin, new Point(2, 2), eventProperties))
            .addAction(pen.createPointerUp(0));

    ((RemoteWebDriver) driver).perform(List.of(actionListPen));

    long duration = System.currentTimeMillis() - start;
    assertThat(duration).isGreaterThan(2);

    List<WebElement> moves = driver.findElements(By.className("pointermove"));
    Map<String, String> moveTo = properties(moves.get(0));
    Map<String, String> down = properties(driver.findElement(By.className("pointerdown")));
    Map<String, String> moveBy = properties(moves.get(1));
    Map<String, String> up = properties(driver.findElement(By.className("pointerup")));

    Rectangle rect = pointerArea.getRect();

    int centerX = rect.width / 2 + rect.getX();
    int centerY = rect.height / 2 + rect.getY();
    assertThat(moveTo.get("button")).isEqualTo("-1");
    assertThat(moveTo.get("pageX")).isEqualTo("" + centerX);
    assertThat(moveTo.get("pageY")).isEqualTo("" + centerY);
    assertThat(down.get("button")).isEqualTo("0");
    assertThat(down.get("pageX")).isEqualTo("" + centerX);
    assertThat(down.get("pageY")).isEqualTo("" + centerY);
    assertThat(moveBy.get("button")).isEqualTo("-1");
    assertThat(moveBy.get("pageX")).isEqualTo("" + (centerX + 2));
    assertThat(moveBy.get("pageY")).isEqualTo("" + (centerY + 2));
    assertThat(moveBy.get("tiltX")).isEqualTo("-72");
    assertThat(moveBy.get("tiltY")).isEqualTo("9");
    assertThat(moveBy.get("twist")).isEqualTo("86");
    assertThat(up.get("button")).isEqualTo("0");
    assertThat(up.get("pageX")).isEqualTo("" + (centerX + 2));
    assertThat(up.get("pageY")).isEqualTo("" + (centerY + 2));
  }

  private Map<String, String> properties(WebElement element) {
    String text = element.getText();
    text = text.substring(text.indexOf(' ') + 1);

    return Arrays.stream(text.split(", "))
        .map(s -> s.split(": "))
        .collect(
            Collectors.toMap(
                a -> a[0], // key
                a -> a[1] // value
                ));
  }
}
