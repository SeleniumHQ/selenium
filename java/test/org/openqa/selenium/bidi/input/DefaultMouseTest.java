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

package org.openqa.selenium.bidi.input;

import static org.assertj.core.api.Assertions.assertThat;
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

import java.time.Duration;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.Point;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.bidi.module.Input;
import org.openqa.selenium.bidi.module.Script;
import org.openqa.selenium.bidi.script.EvaluateResult;
import org.openqa.selenium.bidi.script.EvaluateResultSuccess;
import org.openqa.selenium.bidi.script.LocalValue;
import org.openqa.selenium.bidi.script.WindowProxyProperties;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.interactions.Sequence;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.testing.JupiterTestBase;
import org.openqa.selenium.testing.SwitchToTopAfterTest;

/** Tests operations that involve mouse and keyboard. */
class DefaultMouseTest extends JupiterTestBase {
  private static final Dimension MOUSE_TRACKER = new Dimension(100, 400);

  private Input inputModule;
  private String windowHandle;

  @BeforeEach
  public void setUp() {
    windowHandle = driver.getWindowHandle();
    inputModule = new Input(driver);
    resetMousePointer();
  }

  private Actions getBuilder(WebDriver driver) {
    return new Actions(driver);
  }

  private void performDragAndDropWithMouse() {
    driver.get(pages.draggableLists);

    WebElement dragReporter = driver.findElement(By.id("dragging_reports"));

    WebElement toDrag = wait.until(visibilityOfElementLocated(By.id("rightitem-3")));
    WebElement dragInto = wait.until(visibilityOfElementLocated(By.id("sortable1")));

    Actions holdItem = getBuilder(driver).clickAndHold(toDrag);

    Actions moveToSpecificItem =
        getBuilder(driver).moveToElement(driver.findElement(By.id("leftitem-4")));

    Actions moveToOtherList = getBuilder(driver).moveToElement(dragInto);

    Actions drop = getBuilder(driver).release(dragInto);

    assertThat(dragReporter.getText()).isEqualTo("Nothing happened.");

    try {
      inputModule.perform(windowHandle, holdItem.getSequences());
      inputModule.perform(windowHandle, moveToSpecificItem.getSequences());
      inputModule.perform(windowHandle, moveToOtherList.getSequences());

      String text = dragReporter.getText();
      assertThat(text).matches("Nothing happened. (?:DragOut *)+");
    } finally {
      inputModule.perform(windowHandle, drop.getSequences());
    }
  }

  @Test
  public void testDraggingElementWithMouseMovesItToAnotherList() {
    performDragAndDropWithMouse();
    WebElement dragInto = wait.until(visibilityOfElementLocated(By.id("sortable1")));
    assertThat(dragInto.findElements(By.tagName("li"))).hasSize(6);
  }

  // This test is very similar to testDraggingElementWithMouse. The only
  // difference is that this test also verifies the correct events were fired.
  @Test
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

    Actions dblClick = getBuilder(driver).doubleClick(toClick);
    inputModule.perform(windowHandle, dblClick.getSequences());
    driver.get(pages.droppableItems);
  }

  @Test
  public void testDragAndDrop() {
    driver.get(pages.droppableItems);

    WebElement toDrag = wait.until(visibilityOfElementLocated(By.id("draggable")));
    WebElement dropInto = wait.until(visibilityOfElementLocated(By.id("droppable")));

    Actions holdDrag = getBuilder(driver).clickAndHold(toDrag);
    Actions move = getBuilder(driver).moveToElement(dropInto);
    Actions drop = getBuilder(driver).release(dropInto);

    inputModule.perform(windowHandle, holdDrag.getSequences());
    inputModule.perform(windowHandle, move.getSequences());
    inputModule.perform(windowHandle, drop.getSequences());

    wait.until(elementTextToEqual(By.cssSelector("#droppable p"), "Dropped!"));
  }

  @Test
  public void testDoubleClick() {
    driver.get(pages.javascriptPage);

    WebElement toDoubleClick = driver.findElement(By.id("doubleClickField"));

    inputModule.perform(windowHandle, getBuilder(driver).doubleClick(toDoubleClick).getSequences());

    shortWait.until(elementValueToEqual(toDoubleClick, "DoubleClicked"));
  }

  @Test
  void testContextClick() {
    driver.get(pages.javascriptPage);

    WebElement toContextClick = driver.findElement(By.id("doubleClickField"));

    inputModule.perform(
        windowHandle, getBuilder(driver).contextClick(toContextClick).getSequences());

    assertThat(toContextClick.getAttribute("value")).isEqualTo("ContextClicked");
  }

  @Test
  void testMoveToLocation() {
    driver.get(pages.mouseInteractionPage);

    inputModule.perform(windowHandle, getBuilder(driver).moveToLocation(70, 60).getSequences());
    assertThat(driver.findElement(By.id("bottom")).getText()).contains("Click for Results Page");

    inputModule.perform(
        windowHandle, getBuilder(driver).moveToLocation(70, 60).click().getSequences());

    WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    wait.until(urlContains("/resultPage.html"));
    wait.until(visibilityOfElementLocated(By.id("greeting")));

    WebElement element = driver.findElement(By.id("greeting"));

    assertThat(element.getText()).isEqualTo("Success!");
  }

  @Test
  void testMoveAndClick() {
    driver.get(pages.javascriptPage);

    WebElement toClick = driver.findElement(By.id("clickField"));

    inputModule.perform(
        windowHandle, getBuilder(driver).moveToElement(toClick).click().getSequences());

    wait.until(elementValueToEqual(toClick, "Clicked"));

    assertThat(toClick.getAttribute("value")).isEqualTo("Clicked");
  }

  @SwitchToTopAfterTest
  @Test
  void testShouldClickElementInIFrame() {
    driver.get(pages.clicksPage);
    driver.switchTo().frame("source");
    WebElement element = driver.findElement(By.id("otherframe"));

    try (Script script = new Script(driver)) {

      List<LocalValue> arguments = new ArrayList<>();

      EvaluateResult result =
          script.callFunctionInBrowsingContext(
              driver.getWindowHandle(),
              "() => document.querySelector('iframe[id=\"source\"]').contentWindow",
              false,
              Optional.of(arguments),
              Optional.empty(),
              Optional.empty());

      assertThat(result.getResultType()).isEqualTo(EvaluateResult.Type.SUCCESS);
      assertThat(result.getRealmId()).isNotNull();

      EvaluateResultSuccess successResult = (EvaluateResultSuccess) result;

      WindowProxyProperties window =
          (WindowProxyProperties) successResult.getResult().getValue().get();

      String frameBrowsingContext = window.getBrowsingContext();

      inputModule.perform(
          frameBrowsingContext, getBuilder(driver).moveToElement(element).click().getSequences());
      driver.switchTo().defaultContent().switchTo().frame("target");
      wait.until(elementTextToEqual(By.id("span"), "An inline element"));
    }
  }

  @Test
  public void testShouldAllowUsersToHoverOverElements() {
    driver.get(pages.javascriptPage);

    WebElement element = driver.findElement(By.id("menu1"));

    final WebElement item = driver.findElement(By.id("item1"));
    assertThat(item.getText()).isEmpty();

    ((JavascriptExecutor) driver).executeScript("arguments[0].style.background = 'green'", element);
    inputModule.perform(windowHandle, getBuilder(driver).moveToElement(element).getSequences());

    wait.until(not(elementTextToEqual(item, "")));
    assertThat(item.getText()).isEqualTo("Item 1");
  }

  @Test
  public void testHoverPersists() {
    driver.get(pages.javascriptPage);
    unfocusMenu();

    WebElement menu = driver.findElement(By.id("menu1"));
    WebElement menuItem = driver.findElement(By.id("item1"));
    assertThat(menuItem.isDisplayed()).isFalse();
    assertThat(driver.findElement(By.id("result")).getText()).isBlank();

    // Hover the menu icon
    inputModule.perform(windowHandle, getBuilder(driver).moveToElement(menu).getSequences());
    ((JavascriptExecutor) driver).executeScript("arguments[0].style.background = 'green'", menu);

    // Wait until the menu items appear
    shortWait.until(visibilityOf(menuItem));
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
    inputModule.perform(windowHandle, getBuilder(driver).moveToElement(trackerDiv).getSequences());

    WebElement reporter = driver.findElement(By.id("status"));

    wait.until(fuzzyMatchingOfCoordinates(reporter, 50, 200));

    inputModule.perform(windowHandle, getBuilder(driver).moveByOffset(10, 20).getSequences());

    wait.until(fuzzyMatchingOfCoordinates(reporter, 60, 220));
  }

  @Test
  public void testMovingMouseToRelativeElementOffset() {
    driver.get(pages.mouseTrackerPage);

    WebElement trackerDiv = driver.findElement(By.id("mousetracker"));
    inputModule.perform(
        windowHandle,
        getBuilder(driver)
            .moveToElement(trackerDiv, 95 - MOUSE_TRACKER.width / 2, 195 - MOUSE_TRACKER.height / 2)
            .getSequences());

    WebElement reporter = driver.findElement(By.id("status"));

    wait.until(fuzzyMatchingOfCoordinates(reporter, 95, 195));
  }

  @Test
  public void testMovingMouseToRelativeZeroElementOffset() {
    driver.get(pages.mouseTrackerPage);

    WebElement trackerDiv = driver.findElement(By.id("mousetracker"));
    inputModule.perform(
        windowHandle, getBuilder(driver).moveToElement(trackerDiv, 0, 0).getSequences());

    WebElement reporter = driver.findElement(By.id("status"));

    wait.until(
        fuzzyMatchingOfCoordinates(reporter, MOUSE_TRACKER.width / 2, MOUSE_TRACKER.height / 2));
  }

  @Test
  public void testMoveRelativeToBody() {
    driver.get(pages.mouseTrackerPage);

    WebElement reporter = driver.findElement(By.id("status"));
    wait.until(fuzzyMatchingOfCoordinates(reporter, 0, 0));

    inputModule.perform(
        driver.getWindowHandle(), getBuilder(driver).moveByOffset(50, 100).getSequences());

    shortWait.until(fuzzyMatchingOfCoordinates(reporter, 50, 100));
  }

  @Test
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

    inputModule.perform(
        windowHandle, getBuilder(driver).moveToElement(greenbox, xOffset, yOffset).getSequences());

    shortWait.until(color(redbox, "background-color", GREEN));

    inputModule.perform(
        windowHandle,
        getBuilder(driver)
            .moveToElement(greenbox, xOffset, yOffset)
            .moveByOffset(shiftX, shiftY)
            .getSequences());
    shortWait.until(color(redbox, "background-color", RED));

    inputModule.perform(
        windowHandle,
        getBuilder(driver)
            .moveToElement(greenbox, xOffset, yOffset)
            .moveByOffset(shiftX, shiftY)
            .moveByOffset(-shiftX, -shiftY)
            .getSequences());

    shortWait.until(color(redbox, "background-color", GREEN));
  }

  @Test
  public void testCanMoveOverAndOutOfAnElement() {
    driver.get(pages.mouseOverPage);

    WebElement greenbox = driver.findElement(By.id("greenbox"));
    WebElement redbox = driver.findElement(By.id("redbox"));
    Dimension greenSize = greenbox.getSize();
    Dimension redSize = redbox.getSize();

    inputModule.perform(
        windowHandle,
        getBuilder(driver)
            .moveToElement(greenbox, 1 - greenSize.getWidth() / 2, 1 - greenSize.getHeight() / 2)
            .getSequences());

    shortWait.until(color(redbox, "background-color", GREEN));

    inputModule.perform(windowHandle, getBuilder(driver).moveToElement(redbox).getSequences());
    shortWait.until(color(redbox, "background-color", RED));

    inputModule.perform(
        windowHandle,
        getBuilder(driver)
            .moveToElement(redbox, redSize.getWidth() + 1, redSize.getHeight() + 1)
            .getSequences());

    wait.until(color(redbox, "background-color", GREEN));
  }

  private void resetMousePointer() {
    WebElement body = driver.findElement(By.tagName("body"));
    Dimension size = body.getSize();
    Collection<Sequence> moveToLeftUpperCorner =
        getBuilder(driver).moveToElement(body, -size.width / 2, -size.height / 2).getSequences();
    inputModule.perform(windowHandle, moveToLeftUpperCorner);
  }
}
