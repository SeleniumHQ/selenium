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

import static java.lang.Integer.MAX_VALUE;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.openqa.selenium.WaitingConditions.*;
import static org.openqa.selenium.support.ui.ExpectedConditions.*;
import static org.openqa.selenium.testing.drivers.Browser.CHROME;
import static org.openqa.selenium.testing.drivers.Browser.FIREFOX;
import static org.openqa.selenium.testing.drivers.Browser.IE;
import static org.openqa.selenium.testing.drivers.Browser.SAFARI;

import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.Point;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JupiterTestBase;
import org.openqa.selenium.testing.NoDriverAfterTest;
import org.openqa.selenium.testing.NotYetImplemented;
import org.openqa.selenium.testing.SwitchToTopAfterTest;

class DragAndDropTest extends JupiterTestBase {

  @Test
  void testDragAndDropRelative() {
    driver.get(pages.dragAndDropPage);
    WebElement img = wait.until(visibilityOfElementLocated(By.id("test1")));
    Point expectedLocation = img.getLocation();
    expectedLocation = drag(img, expectedLocation, 150, 200);
    wait.until(elementLocationToBe(img, expectedLocation));
    expectedLocation = drag(img, expectedLocation, -50, -25);
    wait.until(elementLocationToBe(img, expectedLocation));
    expectedLocation = drag(img, expectedLocation, 0, 0);
    wait.until(elementLocationToBe(img, expectedLocation));
    expectedLocation = drag(img, expectedLocation, 1, -1);
    wait.until(elementLocationToBe(img, expectedLocation));
  }

  @Test
  void testDragAndDropToElement() {
    driver.get(pages.dragAndDropPage);
    WebElement img1 = wait.until(visibilityOfElementLocated(By.id("test1")));
    WebElement img2 = wait.until(visibilityOfElementLocated(By.id("test2")));
    new Actions(driver).dragAndDrop(img2, img1).perform();
    assertThat(img2.getLocation()).isEqualTo(img1.getLocation());
  }

  @SwitchToTopAfterTest
  @Test
  void testDragAndDropToElementInIframe() {
    driver.get(pages.iframePage);
    final WebElement iframe = driver.findElement(By.tagName("iframe"));
    ((JavascriptExecutor) driver)
        .executeScript("arguments[0].src = arguments[1]", iframe, pages.dragAndDropPage);
    driver.switchTo().frame(0);
    WebElement img1 = wait.until(visibilityOfElementLocated(By.id("test1")));
    WebElement img2 = wait.until(visibilityOfElementLocated(By.id("test2")));
    new Actions(driver).dragAndDrop(img2, img1).perform();
    assertThat(img2.getLocation()).isEqualTo(img1.getLocation());
  }

  @SwitchToTopAfterTest
  @Test
  void testDragAndDropElementWithOffsetInIframeAtBottom() {
    driver.get(appServer.whereIs("iframeAtBottom.html"));

    final WebElement iframe = driver.findElement(By.tagName("iframe"));
    driver.switchTo().frame(iframe);

    WebElement img1 = wait.until(visibilityOfElementLocated(By.id("test1")));
    Point initial = img1.getLocation();

    new Actions(driver).dragAndDropBy(img1, 20, 20).perform();

    assertThat(img1.getLocation()).isEqualTo(initial.moveBy(20, 20));
  }

  @Test
  @Ignore(value = IE, reason = "IE fails this test if requireWindowFocus=true")
  @Ignore(FIREFOX)
  @NotYetImplemented(SAFARI)
  @NotYetImplemented(CHROME)
  public void testDragAndDropElementWithOffsetInScrolledDiv() {
    driver.get(appServer.whereIs("dragAndDropInsideScrolledDiv.html"));

    WebElement el = driver.findElement(By.id("test1"));
    Point initial = el.getLocation();

    new Actions(driver).dragAndDropBy(el, 3700, 3700).perform();

    assertThat(el.getLocation()).isEqualTo(initial.moveBy(3700, 3700));
  }

  @Test
  void testElementInDiv() {
    driver.get(pages.dragAndDropPage);
    WebElement img = wait.until(visibilityOfElementLocated(By.id("test3")));
    Point expectedLocation = img.getLocation();
    expectedLocation = drag(img, expectedLocation, 100, 100);
    assertThat(img.getLocation()).isEqualTo(expectedLocation);
  }

  @Test
  void testDragTooFar() {
    driver.get(pages.dragAndDropPage);
    WebElement img = wait.until(visibilityOfElementLocated(By.id("test1")));

    assertThatThrownBy(
            () -> {
              // Attempt to drag the image outside the bounds of the page.
              new Actions(driver).dragAndDropBy(img, MAX_VALUE, MAX_VALUE).perform();
            })
        .as("These coordinates are outside the page - expected to fail.")
        .isInstanceOf(MoveTargetOutOfBoundsException.class);

    // Release mouse button - move was interrupted in the middle.
    new Actions(driver).release().perform();
  }

  @NoDriverAfterTest(
      reason = "We can't reliably resize the window back, so have to kill the browser.")
  // TODO(dawagner): Remove @NoDriverAfterTest when we can reliably do window resizing
  @Test
  @NotYetImplemented(SAFARI)
  public void testShouldAllowUsersToDragAndDropToElementsOffTheCurrentViewPort() {
    driver.get(pages.dragAndDropPage);
    wait.until(visibilityOfElementLocated(By.id("test1")));

    JavascriptExecutor js = (JavascriptExecutor) driver;
    js.executeScript("window.resizeTo(300, 300);");

    driver.get(pages.dragAndDropPage);
    WebElement img = wait.until(visibilityOfElementLocated(By.id("test3")));
    Point expectedLocation = img.getLocation();
    expectedLocation = drag(img, expectedLocation, 100, 100);
    assertThat(img.getLocation()).isEqualTo(expectedLocation);
  }

  private Point drag(WebElement elem, Point expectedLocation, int moveRightBy, int moveDownBy) {
    new Actions(driver).dragAndDropBy(elem, moveRightBy, moveDownBy).perform();
    return expectedLocation.moveBy(moveRightBy, moveDownBy);
  }

  @Test
  void testDragAndDropOnJQueryItems() {
    driver.get(pages.droppableItems);

    WebElement toDrag = wait.until(visibilityOfElementLocated(By.id("draggable")));
    WebElement dropInto = wait.until(visibilityOfElementLocated(By.id("droppable")));

    new Actions(driver).dragAndDrop(toDrag, dropInto).perform();

    wait.until(elementTextToEqual(By.cssSelector("#droppable p"), "Dropped!"));

    // Assert that only one mouse click took place and the mouse was moved during it.
    wait.until(elementTextToMatch(By.id("drop_reports"), "start( move)* down( move)+ up( move)*"));
  }

  @Test
  @Ignore(value = IE, reason = "IE fails this test if requireWindowFocus=true")
  @NotYetImplemented(SAFARI)
  @Ignore(FIREFOX)
  public void canDragAnElementNotVisibleInTheCurrentViewportDueToAParentOverflow() {
    driver.get(pages.dragDropOverflow);

    WebElement toDrag = driver.findElement(By.id("time-marker"));
    WebElement dragTo = driver.findElement(By.id("11am"));

    Point srcLocation = toDrag.getLocation();
    Point targetLocation = dragTo.getLocation();

    int yOffset = targetLocation.getY() - srcLocation.getY();
    assertThat(yOffset).isNotEqualTo(0);

    new Actions(driver).dragAndDropBy(toDrag, 0, yOffset).perform();

    assertThat(toDrag.getLocation()).isEqualTo(dragTo.getLocation());
  }
}
