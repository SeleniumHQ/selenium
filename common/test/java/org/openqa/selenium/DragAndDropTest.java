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

import static org.junit.Assert.assertEquals;
import static org.openqa.selenium.Ignore.Driver.CHROME;
import static org.openqa.selenium.Ignore.Driver.HTMLUNIT;
import static org.openqa.selenium.Ignore.Driver.IE;
import static org.openqa.selenium.Ignore.Driver.IPHONE;
import static org.openqa.selenium.Ignore.Driver.SELENESE;

import java.awt.*;

@Ignore(IPHONE)
public class DragAndDropTest extends AbstractDriverTestCase {

  @JavascriptEnabled
  @Ignore({HTMLUNIT, CHROME, SELENESE})
  public void testDragAndDrop() throws Exception {
    driver.get(pages.dragAndDropPage);
    RenderedWebElement img = (RenderedWebElement) driver.findElement(By.id("test1"));
    Point expectedLocation = img.getLocation();
    drag(img, expectedLocation, 150, 200);
    assertEquals(expectedLocation, img.getLocation());
    driver.manage().setSpeed(Speed.SLOW);
    drag(img, expectedLocation, -50, -25);
    assertEquals(expectedLocation, img.getLocation());
    driver.manage().setSpeed(Speed.MEDIUM);
    drag(img, expectedLocation, 0, 0);
    assertEquals(expectedLocation, img.getLocation());
    driver.manage().setSpeed(Speed.FAST);
    drag(img, expectedLocation, 1, -1);
    assertEquals(expectedLocation, img.getLocation());
  }

  @JavascriptEnabled
  @Ignore({HTMLUNIT, CHROME, SELENESE})
  public void testDragAndDropToElement() {
    driver.get(pages.dragAndDropPage);
    RenderedWebElement img1 = (RenderedWebElement) driver.findElement(By.id("test1"));
    RenderedWebElement img2 = (RenderedWebElement) driver.findElement(By.id("test2"));
    img2.dragAndDropOn(img1);
    assertEquals(img1.getLocation(), img2.getLocation());
  }

  @JavascriptEnabled
  @Ignore({HTMLUNIT, CHROME, SELENESE})
  public void testElementInDiv() {
    driver.get(pages.dragAndDropPage);
    RenderedWebElement img = (RenderedWebElement) driver.findElement(By.id("test3"));
    Point expectedLocation = img.getLocation();
    drag(img, expectedLocation, 100, 100);
    assertEquals(expectedLocation, img.getLocation());
  }

  @JavascriptEnabled
  @Ignore({HTMLUNIT, IE, CHROME, SELENESE})
  public void testDragTooFar() {
    driver.get(pages.dragAndDropPage);
    RenderedWebElement img = (RenderedWebElement) driver.findElement(By.id("test1"));
//        Point expectedLocation = img.getLocation();

    img.dragAndDropBy(Integer.MIN_VALUE, Integer.MIN_VALUE);
    assertEquals(new Point(0, 0), img.getLocation());

    img.dragAndDropBy(Integer.MAX_VALUE, Integer.MAX_VALUE);
    //We don't know where the img is dragged to , but we know it's not too
    //far, otherwise this function will not return for a long long time
  }

  @JavascriptEnabled
  @Ignore({HTMLUNIT, IE, CHROME, SELENESE})
  public void testMouseSpeed() throws Exception {
    driver.get(pages.dragAndDropPage);
    driver.manage().setSpeed(Speed.SLOW);
    assertEquals(Speed.SLOW, driver.manage().getSpeed());
    driver.manage().setSpeed(Speed.MEDIUM);
    assertEquals(Speed.MEDIUM, driver.manage().getSpeed());
    driver.manage().setSpeed(Speed.FAST);
    assertEquals(Speed.FAST, driver.manage().getSpeed());
  }

  @JavascriptEnabled
  @Ignore({HTMLUNIT, IE, CHROME, SELENESE})
  public void testShouldAllowUsersToDragAndDropToElementsOffTheCurrentViewPort() {
    driver.get(pages.dragAndDropPage);

    JavascriptExecutor js = (JavascriptExecutor) driver;
    Long height = (Long) js.executeScript("return window.outerHeight;");
    Long width = (Long) js.executeScript("return window.outerWidth;");
    js.executeScript("window.resizeTo(300, 300);");

    try {
      driver.get(pages.dragAndDropPage);
      RenderedWebElement img = (RenderedWebElement) driver.findElement(By.id("test3"));
      Point expectedLocation = img.getLocation();
      drag(img, expectedLocation, 100, 100);
      assertEquals(expectedLocation, img.getLocation());
    } finally {
      js.executeScript("window.resizeTo(arguments[0], arguments[1]);", width, height);
    }
  }

  private void drag(RenderedWebElement elem, Point expectedLocation,
                    int moveRightBy, int moveDownBy) {
    elem.dragAndDropBy(moveRightBy, moveDownBy);
    expectedLocation.move(expectedLocation.x + moveRightBy, expectedLocation.y + moveDownBy);
  }
}
