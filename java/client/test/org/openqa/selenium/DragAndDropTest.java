/*
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.

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

package org.openqa.selenium;

import static org.openqa.selenium.Ignore.Driver.ANDROID;
import static org.openqa.selenium.Ignore.Driver.CHROME;
import static org.openqa.selenium.Ignore.Driver.FIREFOX;
import static org.openqa.selenium.Ignore.Driver.HTMLUNIT;
import static org.openqa.selenium.Ignore.Driver.IE;
import static org.openqa.selenium.Ignore.Driver.IPHONE;
import static org.openqa.selenium.Ignore.Driver.OPERA;
import static org.openqa.selenium.Ignore.Driver.SELENESE;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.openqa.selenium.interactions.Actions;

@Ignore({IPHONE, ANDROID})
public class DragAndDropTest extends AbstractDriverTestCase {

  @JavascriptEnabled
  @Ignore(value = {HTMLUNIT, CHROME, SELENESE, OPERA},
      reason = "Opera: last assert fails in desktop because <5px mousemove")
  public void testDragAndDrop() throws Exception {
    driver.get(pages.dragAndDropPage);
    WebElement img = driver.findElement(By.id("test1"));
    Point expectedLocation = img.getLocation();
    drag(img, expectedLocation, 150, 200);
    assertEquals(expectedLocation, img.getLocation());
    drag(img, expectedLocation, -50, -25);
    assertEquals(expectedLocation, img.getLocation());
    drag(img, expectedLocation, 0, 0);
    assertEquals(expectedLocation, img.getLocation());
    drag(img, expectedLocation, 1, -1);
    assertEquals(expectedLocation, img.getLocation());
  }

  @JavascriptEnabled
  @Ignore(value = {HTMLUNIT, CHROME, SELENESE, FIREFOX, OPERA}, reason = "Currently broken in Firefox," +
      " fix tracked in issue 1771.")
  public void testDragAndDropToElement() {
    driver.get(pages.dragAndDropPage);
    WebElement img1 = driver.findElement(By.id("test1"));
    WebElement img2 = driver.findElement(By.id("test2"));
    new Actions(driver).dragAndDrop(img2, img1).perform();
    assertEquals(img1.getLocation(), img2.getLocation());
  }

  @JavascriptEnabled
  @Ignore({HTMLUNIT, CHROME, OPERA, SELENESE})
  public void testElementInDiv() {
    driver.get(pages.dragAndDropPage);
    WebElement img = driver.findElement(By.id("test3"));
    Point expectedLocation = img.getLocation();
    drag(img, expectedLocation, 100, 100);
    assertEquals(expectedLocation, img.getLocation());
  }

  @JavascriptEnabled
  @Ignore({HTMLUNIT, IE, CHROME, OPERA, SELENESE})
  public void testDragTooFar() {
    driver.get(pages.dragAndDropPage);
    WebElement img = driver.findElement(By.id("test1"));

    Actions actions = new Actions(driver);
    actions.dragAndDropBy(img, Integer.MIN_VALUE, Integer.MIN_VALUE).perform();

    // Image ends up on a negative offset because its top-left corner is
    // hidden.
    Point newLocation = img.getLocation();
    assertTrue("Top-left corner of the element should have negative offset",
        newLocation.getX() < 0 && newLocation.getY() < 0);

    // TODO(eran): re-enable this test once moveto does not exceed the
    // coordinates accepted by the browsers. At the moment, even though
    // the maximal coordinates are limited, mouseUp fails because it cannot get
    // the element at the given coordinates.
    //actions.dragAndDropBy(img, Integer.MAX_VALUE, Integer.MAX_VALUE).perform();
    //We don't know where the img is dragged to , but we know it's not too
    //far, otherwise this function will not return for a long long time
  }

  @JavascriptEnabled
  @Ignore(value = {HTMLUNIT, IE, CHROME, OPERA, SELENESE, FIREFOX}, reason = "See issue 1771.")
  public void testShouldAllowUsersToDragAndDropToElementsOffTheCurrentViewPort() {
    driver.get(pages.dragAndDropPage);

    JavascriptExecutor js = (JavascriptExecutor) driver;
    Long height = (Long) js.executeScript("return window.outerHeight;");
    Long width = (Long) js.executeScript("return window.outerWidth;");
    js.executeScript("window.resizeTo(300, 300);");

    try {
      driver.get(pages.dragAndDropPage);
      WebElement img = driver.findElement(By.id("test3"));
      Point expectedLocation = img.getLocation();
      drag(img, expectedLocation, 100, 100);
      assertEquals(expectedLocation, img.getLocation());
    } finally {
      js.executeScript("window.resizeTo(arguments[0], arguments[1]);", width, height);
    }
  }

  private void drag(WebElement elem, Point expectedLocation,
                    int moveRightBy, int moveDownBy) {
    new Actions(driver)
        .dragAndDropBy(elem, moveRightBy, moveDownBy)
        .perform();
    expectedLocation.move(expectedLocation.x + moveRightBy, expectedLocation.y + moveDownBy);
  }

  @JavascriptEnabled
  @Ignore({HTMLUNIT, CHROME, IE, OPERA, SELENESE})
  public void testDragAndDropOnJQueryItems() {
    driver.get(pages.droppableItems);

    WebElement toDrag = driver.findElement(By.id("draggable"));
    WebElement dropInto = driver.findElement(By.id("droppable"));

    // Wait until all event handlers are installed.
    doSleep(500);

    new Actions(driver).dragAndDrop(toDrag, dropInto).perform();

    String text = dropInto.findElement(By.tagName("p")).getText();

    long waitEndTime = System.currentTimeMillis() + 15000;

    while (!text.equals("Dropped!") && (System.currentTimeMillis() < waitEndTime)) {
      doSleep(200);
      text = dropInto.findElement(By.tagName("p")).getText();
    }

    assertEquals("Dropped!", text);

    WebElement reporter = driver.findElement(By.id("drop_reports"));
    // Assert that only one mouse click took place and the mouse was moved
    // during it.
    String reporterText = reporter.getText();
    Pattern pattern = Pattern.compile("start( move)* down( move)+ up");

    Matcher matcher = pattern.matcher(reporterText);

    assertTrue("Reporter text:" + reporterText, matcher.matches());
  }

  private static void doSleep(int ms) {
    try {
      Thread.sleep(ms);
    } catch (InterruptedException e) {
      throw new RuntimeException("Interrupted: " + e.toString());
    }
  }

}
