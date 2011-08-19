/*
Copyright 2007-2010 WebDriver committers
Copyright 2007-2010 Google Inc.

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

import static org.openqa.selenium.Ignore.Driver.ANDROID;
import static org.openqa.selenium.Ignore.Driver.CHROME;
import static org.openqa.selenium.Ignore.Driver.FIREFOX;
import static org.openqa.selenium.Ignore.Driver.HTMLUNIT;
import static org.openqa.selenium.Ignore.Driver.IE;
import static org.openqa.selenium.Ignore.Driver.IPHONE;
import static org.openqa.selenium.Ignore.Driver.REMOTE;
import static org.openqa.selenium.Ignore.Driver.SELENESE;
import static org.openqa.selenium.TestUtilities.isFirefox;
import static org.openqa.selenium.TestUtilities.isFirefox30;
import static org.openqa.selenium.TestUtilities.isFirefox35;
import static org.openqa.selenium.TestUtilities.isNativeEventsEnabled;
import static org.openqa.selenium.TestWaiter.waitFor;
import static org.openqa.selenium.WaitingConditions.elementValueToEqual;

import org.openqa.selenium.AbstractDriverTestCase;
import org.openqa.selenium.By;
import org.openqa.selenium.Ignore;
import org.openqa.selenium.JavascriptEnabled;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.Platform;
import org.openqa.selenium.TestUtilities;
import org.openqa.selenium.WaitingConditions;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

/**
 * Tests operations that involve mouse and keyboard.
 *
 */
public class BasicMouseInterfaceTest extends AbstractDriverTestCase {
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

    holdItem.perform();
    moveToSpecificItem.perform();
    moveToOtherList.perform();

    assertEquals("Nothing happened. DragOut", dragReporter.getText());
    drop.perform();
  }

  @JavascriptEnabled
  @Ignore({ANDROID, IE, REMOTE, IPHONE, SELENESE})
  public void testDraggingElementWithMouseMovesItToAnotherList() {
    performDragAndDropWithMouse();
    WebElement dragInto = driver.findElement(By.id("sortable1"));
    assertEquals(6, dragInto.findElements(By.tagName("li")).size());
  }

  @JavascriptEnabled
  @Ignore(
      value = {HTMLUNIT, ANDROID, IE, REMOTE, IPHONE, SELENESE},
      reason = "Advanced mouse actions only implemented in rendered browsers")
  // This test is very similar to testDraggingElementWithMouse. The only
  // difference is that this test also verifies the correct events were fired.
  public void testDraggingElementWithMouseFiresEvents() {
    performDragAndDropWithMouse();
    WebElement dragReporter = driver.findElement(By.id("dragging_reports"));
    // This is failing under HtmlUnit. A bug was filed.
    assertEquals("Nothing happened. DragOut DropIn RightItem 3", dragReporter.getText());
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
  @Ignore({ANDROID, IE, REMOTE, IPHONE, SELENESE})
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
  @Ignore({ANDROID, FIREFOX, REMOTE, IPHONE, SELENESE})
  public void testDoubleClick() {
    driver.get(pages.javascriptPage);

    WebElement toDoubleClick = driver.findElement(By.id("doubleClickField"));

    Action dblClick = getBuilder(driver).doubleClick(toDoubleClick).build();

    dblClick.perform();
    assertEquals("Value should change to DoubleClicked.", "DoubleClicked",
        toDoubleClick.getAttribute("value"));
  }

  @JavascriptEnabled
  @Ignore({ANDROID, HTMLUNIT, IPHONE, REMOTE, SELENESE})
  public void testContextClick() {
    
    if (isFirefox(driver) &&
      (!isNativeEventsEnabled(driver)
       || !Platform.getCurrent().is(Platform.LINUX))) {
      System.out.println("Skipping test: only implemented on Linux with native events");
      return;
    }
    
    driver.get(pages.javascriptPage);

    WebElement toContextClick = driver.findElement(By.id("doubleClickField"));

    Action contextClick = getBuilder(driver).contextClick(toContextClick).build();

    contextClick.perform();
    assertEquals("Value should change to ContextClicked.", "ContextClicked",
        toContextClick.getAttribute("value"));
  }

  @JavascriptEnabled
  @Ignore({ANDROID, IE, REMOTE, IPHONE, SELENESE})
  public void testMoveAndClick() {
    driver.get(pages.javascriptPage);

    WebElement toClick = driver.findElement(By.id("clickField"));

    Action contextClick = getBuilder(driver).moveToElement(toClick).click().build();

    contextClick.perform();

    waitFor(elementValueToEqual(toClick, "Clicked"));

    assertEquals("Value should change to Clicked.", "Clicked",
        toClick.getAttribute("value"));
  }

  @JavascriptEnabled
  @Ignore({ANDROID, IE, FIREFOX, REMOTE, IPHONE, SELENESE})
  public void testCannotMoveToANullLocator() {
    driver.get(pages.javascriptPage);

    try {
      Action contextClick = getBuilder(driver).moveToElement(null).build();

      contextClick.perform();
      fail("Shouldn't be allowed to click on null element.");
    } catch (IllegalArgumentException expected) {
      // Expected.
    }

    try {
      getBuilder(driver).click().build().perform();
      fail("Shouldn't be allowed to click without a context.");
    } catch (InvalidCoordinatesException expected) {
      // expected
    }
  }

  @Ignore(value = {ANDROID, IE, HTMLUNIT, IPHONE, REMOTE, SELENESE},
      reason = "Behaviour not finalized yet regarding linked images.")
  public void testMovingIntoAnImageEnclosedInALink() {
    driver.get(pages.linkedImage);

    if (isFirefox30(driver) || isFirefox35(driver)) {
      System.out.println("Not performing testMovingIntoAnImageEnclosedInALink - no way to " +
          "compensate for accessibility-provided offsets on Firefox 3.0 or 3.5");
      return;
    }
    // Note: For some reason, the Accessibilyt API in Firefox will not be available before we
    // click on something. As a work-around, click on a different element just to get going.
    driver.findElement(By.id("linkToAnchorOnThisPage")).click();

    WebElement linkElement = driver.findElement(By.id("linkWithEnclosedImage"));

    // Image is 644 x 41 - move towards the end.
    // Note: The width of the link element itself is correct - 644 pixels. However,
    // the height is 17 pixels and the rectangle containing it is *below* the image.
    // For this reason, this action will fail.
    new Actions(driver).moveToElement(linkElement, 500, 30).click().perform();

    waitFor(WaitingConditions.pageTitleToBe(driver, "We Arrive Here"));
  }

  @Ignore(value = {ANDROID, IE, HTMLUNIT, IPHONE, REMOTE, SELENESE, CHROME},
      reason = "Not implemented yet.")
  public void testMovingMousePastViewPort() {
    if (!isNativeEventsEnabled(driver)) {
      System.out.println("Skipping testMovingMousePastViewPort: Native events are disabled.");
      return;
    }

    driver.get(pages.javascriptPage);

    WebElement keyUpArea = driver.findElement(By.id("keyPressArea"));
    new Actions(driver).moveToElement(keyUpArea).click().perform();

    // Move by 1015 pixels down - we should be hitting the element with id 'parent'
    new Actions(driver).moveByOffset(10, 1015).perform();

    WebElement resultArea = driver.findElement(By.id("result"));
    assertTrue("Result area contained: " + resultArea.getText(), resultArea.getText().contains("parent matches"));
  }

  @Ignore(value = {ANDROID, IE, HTMLUNIT, IPHONE, REMOTE, SELENESE, CHROME},
      reason = "Not implemented yet.")
  public void testMovingMouseBackAndForthPastViewPort() {
    if (!isNativeEventsEnabled(driver)) {
      System.out.println("Skipping testMovingMouseBackAndForthPastViewPort: " +
          "Native events are disabled.");
      return;
    }

    driver.get(pages.veryLargeCanvas);

    WebElement firstTarget = driver.findElement(By.id("r1"));
    new Actions(driver).moveToElement(firstTarget).click().perform();

    WebElement resultArea = driver.findElement(By.id("result"));
    String expectedEvents = "First";
    assertEquals(expectedEvents, resultArea.getText());

    // Move to element with id 'r2', at (2500, 50) to (2580, 100)
    new Actions(driver).moveByOffset(2540 - 150, 75 - 125).click().perform();
    expectedEvents += " Second";
    assertEquals(expectedEvents, resultArea.getText());

    // Move to element with id 'r3' at (60, 1500) to (140, 1550)
    new Actions(driver).moveByOffset(100 - 2540, 1525 - 75).click().perform();
    expectedEvents += " Third";
    assertEquals(expectedEvents, resultArea.getText());

    // Move to element with id 'r4' at (220,180) to (320, 230)
    new Actions(driver).moveByOffset(270 - 100, 205 - 1525).click().perform();
    expectedEvents += " Fourth";
    assertEquals(expectedEvents, resultArea.getText());
  }

}
