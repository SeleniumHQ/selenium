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
import static org.junit.jupiter.api.Assertions.fail;
import static org.junit.jupiter.api.Assumptions.assumeFalse;
import static org.openqa.selenium.WaitingConditions.elementLocationToBe;
import static org.openqa.selenium.testing.drivers.Browser.CHROME;
import static org.openqa.selenium.testing.drivers.Browser.FIREFOX;
import static org.openqa.selenium.testing.drivers.Browser.HTMLUNIT;
import static org.openqa.selenium.testing.drivers.Browser.IE;
import static org.openqa.selenium.testing.drivers.Browser.SAFARI;

import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.Platform;
import org.openqa.selenium.Point;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JupiterTestBase;
import org.openqa.selenium.testing.NoDriverAfterTest;
import org.openqa.selenium.testing.NotYetImplemented;
import org.openqa.selenium.testing.SwitchToTopAfterTest;
import org.openqa.selenium.testing.TestUtilities;
import org.openqa.selenium.testing.drivers.Browser;

@Ignore(value = HTMLUNIT, reason = "Advanced mouse actions only implemented in rendered browsers")
public class DragAndDropTest extends JupiterTestBase {

  private static void sleep(int ms) {
    try {
      Thread.sleep(ms);
    } catch (InterruptedException e) {
      throw new RuntimeException("Interrupted: " + e.toString());
    }
  }

  @Test
  public void testDragAndDropRelative() {
    assumeFalse(Browser.detect() == Browser.LEGACY_OPERA &&
                TestUtilities.getEffectivePlatform(driver).is(Platform.WINDOWS));

    driver.get(pages.dragAndDropPage);
    WebElement img = driver.findElement(By.id("test1"));
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
  public void testDragAndDropToElement() {
    driver.get(pages.dragAndDropPage);
    WebElement img1 = driver.findElement(By.id("test1"));
    WebElement img2 = driver.findElement(By.id("test2"));
    new Actions(driver).dragAndDrop(img2, img1).perform();
    assertThat(img2.getLocation()).isEqualTo(img1.getLocation());
  }

  @SwitchToTopAfterTest
  @Test
  public void testDragAndDropToElementInIframe() {
    driver.get(pages.iframePage);
    final WebElement iframe = driver.findElement(By.tagName("iframe"));
    ((JavascriptExecutor) driver).executeScript("arguments[0].src = arguments[1]", iframe,
                                                pages.dragAndDropPage);
    driver.switchTo().frame(0);
    WebElement img1 = wait.until(ExpectedConditions.presenceOfElementLocated(By.id("test1")));
    WebElement img2 = driver.findElement(By.id("test2"));
    new Actions(driver).dragAndDrop(img2, img1).perform();
    assertThat(img2.getLocation()).isEqualTo(img1.getLocation());
  }

  @SwitchToTopAfterTest
  @Test
  public void testDragAndDropElementWithOffsetInIframeAtBottom() {
    driver.get(appServer.whereIs("iframeAtBottom.html"));

    final WebElement iframe = driver.findElement(By.tagName("iframe"));
    driver.switchTo().frame(iframe);

    WebElement img1 = driver.findElement(By.id("test1"));
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
  public void testElementInDiv() {
    driver.get(pages.dragAndDropPage);
    WebElement img = driver.findElement(By.id("test3"));
    Point expectedLocation = img.getLocation();
    expectedLocation = drag(img, expectedLocation, 100, 100);
    assertThat(img.getLocation()).isEqualTo(expectedLocation);
  }

  @Test
  public void testDragTooFar() {
    driver.get(pages.dragAndDropPage);
    Actions actions = new Actions(driver);

    try {
      WebElement img = driver.findElement(By.id("test1"));

      // Attempt to drag the image outside of the bounds of the page.

      actions.dragAndDropBy(img, Integer.MAX_VALUE, Integer.MAX_VALUE).perform();
      fail("These coordinates are outside the page - expected to fail.");
    } catch (MoveTargetOutOfBoundsException expected) {
      // Release mouse button - move was interrupted in the middle.
      new Actions(driver).release().perform();
    }
  }

  @NoDriverAfterTest
  // We can't reliably resize the window back afterwards, cross-browser, so have to kill the
  // window, otherwise we are stuck with a small window for the rest of the tests.
  // TODO(dawagner): Remove @NoDriverAfterTest when we can reliably do window resizing
  @Test
  @NotYetImplemented(SAFARI)
  public void testShouldAllowUsersToDragAndDropToElementsOffTheCurrentViewPort() {
    driver.get(pages.dragAndDropPage);

    JavascriptExecutor js = (JavascriptExecutor) driver;
    js.executeScript("window.resizeTo(300, 300);");

    driver.get(pages.dragAndDropPage);
    WebElement img = driver.findElement(By.id("test3"));
    Point expectedLocation = img.getLocation();
    expectedLocation= drag(img, expectedLocation, 100, 100);
    assertThat(img.getLocation()).isEqualTo(expectedLocation);
  }

  private Point drag(WebElement elem, Point expectedLocation, int moveRightBy, int moveDownBy) {
    new Actions(driver)
      .dragAndDropBy(elem, moveRightBy, moveDownBy)
      .perform();
    return expectedLocation.moveBy(moveRightBy, moveDownBy);
  }

  @Test
  public void testDragAndDropOnJQueryItems() {
    driver.get(pages.droppableItems);

    WebElement toDrag = driver.findElement(By.id("draggable"));
    WebElement dropInto = driver.findElement(By.id("droppable"));

    // Wait until all event handlers are installed.
    sleep(500);

    new Actions(driver).dragAndDrop(toDrag, dropInto).perform();

    String text = dropInto.findElement(By.tagName("p")).getText();

    long waitEndTime = System.currentTimeMillis() + 15000;

    while (!text.equals("Dropped!") && (System.currentTimeMillis() < waitEndTime)) {
      sleep(200);
      text = dropInto.findElement(By.tagName("p")).getText();
    }

    assertThat(text).isEqualTo("Dropped!");

    WebElement reporter = driver.findElement(By.id("drop_reports"));
    // Assert that only one mouse click took place and the mouse was moved
    // during it.
    assertThat(reporter.getText()).matches("start( move)* down( move)+ up( move)*");
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
