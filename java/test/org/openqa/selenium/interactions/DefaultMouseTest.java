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
import static org.openqa.selenium.WaitingConditions.color;
import static org.openqa.selenium.WaitingConditions.elementTextToEqual;
import static org.openqa.selenium.WaitingConditions.elementValueToEqual;
import static org.openqa.selenium.WaitingConditions.fuzzyMatchingOfCoordinates;
import static org.openqa.selenium.support.Colors.GREEN;
import static org.openqa.selenium.support.Colors.RED;
import static org.openqa.selenium.support.ui.ExpectedConditions.not;
import static org.openqa.selenium.support.ui.ExpectedConditions.urlContains;
import static org.openqa.selenium.support.ui.ExpectedConditions.visibilityOf;
import static org.openqa.selenium.support.ui.ExpectedConditions.visibilityOfElementLocated;
import static org.openqa.selenium.testing.drivers.Browser.SAFARI;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.Point;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.Color;
import org.openqa.selenium.testing.JupiterTestBase;
import org.openqa.selenium.testing.NotYetImplemented;
import org.openqa.selenium.testing.SwitchToTopAfterTest;

/** Tests operations that involve mouse and keyboard. */
class DefaultMouseTest extends JupiterTestBase {

  @BeforeEach
  void resetMousePointer() {
    WebElement body = driver.findElement(By.tagName("body"));
    Dimension size = body.getSize();
    getBuilder(driver).moveToElement(body, -size.width / 2, -size.height / 2).perform();
  }

  private Actions getBuilder(WebDriver driver) {
    return new Actions(driver);
  }

  private void performDragAndDropWithMouse() {
    driver.get(pages.draggableLists);

    WebElement dragReporter = driver.findElement(By.id("dragging_reports"));

    WebElement toDrag = wait.until(visibilityOfElementLocated(By.id("rightitem-3")));
    WebElement dragInto = wait.until(visibilityOfElementLocated(By.id("sortable1")));

    Action holdItem = getBuilder(driver).clickAndHold(toDrag).build();

    Action moveToSpecificItem =
        getBuilder(driver).moveToElement(driver.findElement(By.id("leftitem-4"))).build();

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
    WebElement dragInto = wait.until(visibilityOfElementLocated(By.id("sortable1")));
    assertThat(dragInto.findElements(By.tagName("li"))).hasSize(6);
  }

  // This test is very similar to testDraggingElementWithMouse. The only
  // difference is that this test also verifies the correct events were fired.
  @Test
  @NotYetImplemented(SAFARI)
  public void testDraggingElementWithMouseFiresEvents() {
    performDragAndDropWithMouse();
    WebElement dragReporter = driver.findElement(By.id("dragging_reports"));
    String text = dragReporter.getText();
    assertThat(text).matches("Nothing happened. (?:DragOut *)+DropIn RightItem 3");
  }

  @Test
  void testDoubleClickThenGet() {
    // Fails in ff3 if WebLoadingListener removes browser listener
    driver.get(pages.javascriptPage);

    WebElement toClick = driver.findElement(By.id("clickField"));

    Action dblClick = getBuilder(driver).doubleClick(toClick).build();
    dblClick.perform();

    driver.get(pages.droppableItems);
  }

  @Test
  @NotYetImplemented(SAFARI)
  public void testDragAndDrop() {
    driver.get(pages.droppableItems);

    WebElement toDrag = wait.until(visibilityOfElementLocated(By.id("draggable")));
    WebElement dropInto = wait.until(visibilityOfElementLocated(By.id("droppable")));

    Action holdDrag = getBuilder(driver).clickAndHold(toDrag).build();
    Action move = getBuilder(driver).moveToElement(dropInto).build();
    Action drop = getBuilder(driver).release(dropInto).build();

    holdDrag.perform();
    move.perform();
    drop.perform();

    shortWait.until(elementTextToEqual(By.cssSelector("#droppable p"), "Dropped!"));
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
  void testContextClick() {
    driver.get(pages.javascriptPage);

    WebElement toContextClick = driver.findElement(By.id("doubleClickField"));

    Action contextClick = getBuilder(driver).contextClick(toContextClick).build();

    contextClick.perform();
    assertThat(toContextClick.getAttribute("value")).isEqualTo("ContextClicked");
  }

  @Test
  void testMoveToLocation() {
    driver.get(pages.mouseInteractionPage);

    getBuilder(driver).moveToLocation(70, 60).build().perform();
    assertThat(driver.findElement(By.id("bottom")).getText()).contains("Click for Results Page");

    Action moveAndClick = getBuilder(driver).moveToLocation(70, 60).click().build();

    moveAndClick.perform();

    shortWait.until(urlContains("/resultPage.html"));
    WebElement element = driver.findElement(By.id("greeting"));

    assertThat(element.getText()).isEqualTo("Success!");
  }

  @Test
  void testMoveAndClick() {
    driver.get(pages.javascriptPage);

    WebElement toClick = driver.findElement(By.id("clickField"));

    Action contextClick = getBuilder(driver).moveToElement(toClick).click().build();

    contextClick.perform();

    wait.until(elementValueToEqual(toClick, "Clicked"));

    assertThat(toClick.getAttribute("value")).isEqualTo("Clicked");
  }

  @Test
  void testCannotMoveToANullLocator() {
    driver.get(pages.javascriptPage);
    assertThatExceptionOfType(IllegalArgumentException.class)
        .isThrownBy(() -> getBuilder(driver).moveToElement(null).build());
  }

  @Test
  @NotYetImplemented(SAFARI)
  public void testMovingPastViewPortThrowsException() {
    assertThatExceptionOfType(MoveTargetOutOfBoundsException.class)
        .isThrownBy(() -> getBuilder(driver).moveByOffset(-1000, -1000).perform());
  }

  @SwitchToTopAfterTest
  @Test
  void testShouldClickElementInIFrame() {
    driver.get(pages.clicksPage);
    driver.switchTo().frame("source");
    WebElement element = driver.findElement(By.id("otherframe"));
    getBuilder(driver).moveToElement(element).click().perform();
    driver.switchTo().defaultContent().switchTo().frame("target");
    wait.until(elementTextToEqual(By.id("span"), "An inline element"));
  }

  @Test
  @NotYetImplemented(SAFARI)
  public void testShouldAllowUsersToHoverOverElements() {
    driver.get(pages.javascriptPage);

    WebElement element = driver.findElement(By.id("menu1"));

    final WebElement item = driver.findElement(By.id("item1"));
    assertThat(item.getText()).isEmpty();

    ((JavascriptExecutor) driver).executeScript("arguments[0].style.background = 'green'", element);
    getBuilder(driver).moveToElement(element).build().perform();

    wait.until(not(elementTextToEqual(item, "")));
    assertThat(item.getText()).isEqualTo("Item 1");
  }

  @Test
  @NotYetImplemented(SAFARI)
  public void testHoverPersists() {
    driver.get(pages.javascriptPage);
    unfocusMenu();

    WebElement menu = driver.findElement(By.id("menu1"));
    WebElement menuItem = driver.findElement(By.id("item1"));
    assertThat(menuItem.isDisplayed()).isFalse();
    assertThat(driver.findElement(By.id("result")).getText()).isBlank();

    // Hover the menu icon
    getBuilder(driver).moveToElement(menu).build().perform();
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
    getBuilder(driver).moveToElement(driver.findElement(By.id("dynamo"))).build().perform();
  }

  @Test
  public void testMovingMouseByRelativeOffset() {
    driver.get(pages.mouseTrackerPage);

    WebElement trackerDiv = driver.findElement(By.id("mousetracker"));
    getBuilder(driver).moveToElement(trackerDiv).perform();

    WebElement reporter = driver.findElement(By.id("status"));

    wait.until(fuzzyMatchingOfCoordinates(reporter, 50, 200));

    getBuilder(driver).moveByOffset(10, 20).build().perform();

    wait.until(fuzzyMatchingOfCoordinates(reporter, 60, 220));
  }

  @Test
  public void testMovingMouseToRelativeElementOffset() {
    driver.get(pages.mouseTrackerPage);

    WebElement trackerDiv = driver.findElement(By.id("mousetracker"));
    Dimension size = trackerDiv.getSize();
    getBuilder(driver)
        .moveToElement(trackerDiv, 95 - size.getWidth() / 2, 195 - size.getHeight() / 2)
        .perform();

    WebElement reporter = driver.findElement(By.id("status"));

    wait.until(fuzzyMatchingOfCoordinates(reporter, 95, 195));
  }

  @Test
  public void testMovingMouseToRelativeZeroElementOffset() {
    driver.get(pages.mouseTrackerPage);

    WebElement trackerDiv = driver.findElement(By.id("mousetracker"));
    getBuilder(driver).moveToElement(trackerDiv, 0, 0).perform();

    WebElement reporter = driver.findElement(By.id("status"));

    Dimension size = trackerDiv.getSize();
    wait.until(fuzzyMatchingOfCoordinates(reporter, size.getWidth() / 2, size.getHeight() / 2));
  }

  @Test
  @NotYetImplemented(SAFARI)
  public void testMoveRelativeToBody() {
    driver.get(pages.mouseTrackerPage);
    WebElement reporter = driver.findElement(By.id("status"));

    wait.until(fuzzyMatchingOfCoordinates(reporter, 0, 0));

    getBuilder(driver).moveByOffset(50, 100).perform();

    wait.until(fuzzyMatchingOfCoordinates(reporter, 50, 100));
  }

  @Test
  @NotYetImplemented(SAFARI)
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

    getBuilder(driver).moveToElement(greenbox, xOffset, yOffset).perform();

    shortWait.until(color(redbox, "background-color", GREEN));

    getBuilder(driver)
        .moveToElement(greenbox, xOffset, yOffset)
        .moveByOffset(shiftX, shiftY)
        .perform();
    shortWait.until(color(redbox, "background-color", RED));

    getBuilder(driver)
        .moveToElement(greenbox, xOffset, yOffset)
        .moveByOffset(shiftX, shiftY)
        .moveByOffset(-shiftX, -shiftY)
        .perform();

    shortWait.until(color(redbox, "background-color", GREEN));
  }

  @Test
  @NotYetImplemented(SAFARI)
  public void testCanMoveOverAndOutOfAnElement() {
    driver.get(pages.mouseOverPage);

    WebElement greenbox = driver.findElement(By.id("greenbox"));
    WebElement redbox = driver.findElement(By.id("redbox"));
    Dimension greenSize = greenbox.getSize();
    Dimension redSize = redbox.getSize();

    getBuilder(driver)
        .moveToElement(greenbox, 1 - greenSize.getWidth() / 2, 1 - greenSize.getHeight() / 2)
        .perform();

    assertThat(Color.fromString(redbox.getCssValue("background-color")))
        .isEqualTo(GREEN.getColorValue());

    getBuilder(driver).moveToElement(redbox).perform();
    assertThat(Color.fromString(redbox.getCssValue("background-color")))
        .isEqualTo(RED.getColorValue());

    getBuilder(driver)
        .moveToElement(redbox, redSize.getWidth() + 1, redSize.getHeight() + 1)
        .perform();

    wait.until(color(redbox, "background-color", GREEN));
  }
}
