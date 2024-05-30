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
import static org.openqa.selenium.WaitingConditions.elementTextToEqual;
import static org.openqa.selenium.WaitingConditions.elementValueToEqual;
import static org.openqa.selenium.support.Colors.GREEN;
import static org.openqa.selenium.support.Colors.RED;
import static org.openqa.selenium.support.ui.ExpectedConditions.attributeToBe;
import static org.openqa.selenium.support.ui.ExpectedConditions.not;
import static org.openqa.selenium.testing.drivers.Browser.CHROME;
import static org.openqa.selenium.testing.drivers.Browser.EDGE;
import static org.openqa.selenium.testing.drivers.Browser.FIREFOX;
import static org.openqa.selenium.testing.drivers.Browser.IE;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.NoSuchElementException;
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
import org.openqa.selenium.support.Color;
import org.openqa.selenium.support.Colors;
import org.openqa.selenium.support.ui.ExpectedCondition;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JupiterTestBase;
import org.openqa.selenium.testing.NeedsFreshDriver;
import org.openqa.selenium.testing.NotYetImplemented;
import org.openqa.selenium.testing.SwitchToTopAfterTest;

/** Tests operations that involve mouse and keyboard. */
class DefaultMouseTest extends JupiterTestBase {
  private Input inputModule;

  private String windowHandle;

  @BeforeEach
  public void setUp() {
    windowHandle = driver.getWindowHandle();
    inputModule = new Input(driver);
  }

  private Actions getBuilder(WebDriver driver) {
    return new Actions(driver);
  }

  private void performDragAndDropWithMouse() {
    driver.get(pages.draggableLists);

    WebElement dragReporter = driver.findElement(By.id("dragging_reports"));

    WebElement toDrag = driver.findElement(By.id("rightitem-3"));
    WebElement dragInto = driver.findElement(By.id("sortable1"));

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
    WebElement dragInto = driver.findElement(By.id("sortable1"));
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

  private boolean isElementAvailable(WebDriver driver, By locator) {
    try {
      driver.findElement(locator);
      return true;
    } catch (NoSuchElementException e) {
      return false;
    }
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
  public void testDragAndDrop() throws InterruptedException {
    driver.get(pages.droppableItems);

    long waitEndTime = System.currentTimeMillis() + 15000;

    while (!isElementAvailable(driver, By.id("draggable"))
        && (System.currentTimeMillis() < waitEndTime)) {
      Thread.sleep(200);
    }

    if (!isElementAvailable(driver, By.id("draggable"))) {
      throw new RuntimeException("Could not find draggable element after 15 seconds.");
    }

    WebElement toDrag = driver.findElement(By.id("draggable"));
    WebElement dropInto = driver.findElement(By.id("droppable"));

    Actions holdDrag = getBuilder(driver).clickAndHold(toDrag);

    Actions move = getBuilder(driver).moveToElement(dropInto);

    Actions drop = getBuilder(driver).release(dropInto);

    inputModule.perform(windowHandle, holdDrag.getSequences());
    inputModule.perform(windowHandle, move.getSequences());
    inputModule.perform(windowHandle, drop.getSequences());

    dropInto = driver.findElement(By.id("droppable"));
    String text = dropInto.findElement(By.tagName("p")).getText();

    assertThat(text).isEqualTo("Dropped!");
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

  @NeedsFreshDriver
  @Test
  @Ignore(value = FIREFOX, gitHubActions = true)
  @Ignore(value = CHROME, gitHubActions = true)
  @Ignore(value = EDGE, gitHubActions = true)
  void testMoveToLocation() {
    driver.get(pages.mouseInteractionPage);

    inputModule.perform(
        windowHandle, getBuilder(driver).moveToLocation(70, 60).click().getSequences());

    WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("greeting")));

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
  @NotYetImplemented(CHROME)
  @NotYetImplemented(EDGE)
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
  public void testHoverPersists() throws Exception {
    driver.get(pages.javascriptPage);
    // Move to a different element to make sure the mouse is not over the
    // element with id 'item1' (from a previous test).
    getBuilder(driver).moveToElement(driver.findElement(By.id("dynamo"))).build().perform();

    WebElement element = driver.findElement(By.id("menu1"));

    final WebElement item = driver.findElement(By.id("item1"));
    assertThat(item.getText()).isEmpty();

    ((JavascriptExecutor) driver).executeScript("arguments[0].style.background = 'green'", element);
    inputModule.perform(windowHandle, getBuilder(driver).moveToElement(element).getSequences());

    // Intentionally wait to make sure hover persists.
    Thread.sleep(2000);

    wait.until(not(elementTextToEqual(item, "")));

    assertThat(item.getText()).isEqualTo("Item 1");
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
    Dimension size = trackerDiv.getSize();
    inputModule.perform(
        windowHandle,
        getBuilder(driver)
            .moveToElement(trackerDiv, 95 - size.getWidth() / 2, 195 - size.getHeight() / 2)
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

    Dimension size = trackerDiv.getSize();
    wait.until(fuzzyMatchingOfCoordinates(reporter, size.getWidth() / 2, size.getHeight() / 2));
  }

  @NeedsFreshDriver({IE, CHROME, FIREFOX, EDGE})
  @Test
  public void testMoveRelativeToBody() {
    try {
      driver.get(pages.mouseTrackerPage);

      inputModule.perform(
          driver.getWindowHandle(), getBuilder(driver).moveByOffset(50, 100).getSequences());

      WebElement reporter = driver.findElement(By.id("status"));

      wait.until(fuzzyMatchingOfCoordinates(reporter, 40, 20));
    } finally {
      inputModule.perform(
          driver.getWindowHandle(), getBuilder(driver).moveByOffset(-50, -100).getSequences());
    }
  }

  @Test
  @Ignore(value = FIREFOX, issue = "https://github.com/mozilla/geckodriver/issues/789")
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

    shortWait.until(
        attributeToBe(redbox, "background-color", Colors.GREEN.getColorValue().asRgba()));

    inputModule.perform(
        windowHandle,
        getBuilder(driver)
            .moveToElement(greenbox, xOffset, yOffset)
            .moveByOffset(shiftX, shiftY)
            .getSequences());
    shortWait.until(attributeToBe(redbox, "background-color", Colors.RED.getColorValue().asRgba()));

    inputModule.perform(
        windowHandle,
        getBuilder(driver)
            .moveToElement(greenbox, xOffset, yOffset)
            .moveByOffset(shiftX, shiftY)
            .moveByOffset(-shiftX, -shiftY)
            .getSequences());

    shortWait.until(
        attributeToBe(redbox, "background-color", Colors.GREEN.getColorValue().asRgba()));
  }

  @Test
  @Ignore(value = FIREFOX, issue = "https://github.com/mozilla/geckodriver/issues/789")
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

    assertThat(Color.fromString(redbox.getCssValue("background-color")))
        .isEqualTo(GREEN.getColorValue());

    inputModule.perform(windowHandle, getBuilder(driver).moveToElement(redbox).getSequences());
    assertThat(Color.fromString(redbox.getCssValue("background-color")))
        .isEqualTo(RED.getColorValue());

    inputModule.perform(
        windowHandle,
        getBuilder(driver)
            .moveToElement(redbox, redSize.getWidth() + 1, redSize.getHeight() + 1)
            .getSequences());

    wait.until(attributeToBe(redbox, "background-color", Colors.GREEN.getColorValue().asRgba()));
  }

  private boolean fuzzyPositionMatching(int expectedX, int expectedY, String locationTuple) {
    String[] splitString = locationTuple.split(",");
    int gotX = Integer.parseInt(splitString[0].trim());
    int gotY = Integer.parseInt(splitString[1].trim());

    // Everything within 5 pixels range is OK
    final int ALLOWED_DEVIATION = 5;
    return Math.abs(expectedX - gotX) < ALLOWED_DEVIATION
        && Math.abs(expectedY - gotY) < ALLOWED_DEVIATION;
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
        return "Coordinates: " + element.getText() + " but expected: " + x + ", " + y;
      }
    };
  }
}
