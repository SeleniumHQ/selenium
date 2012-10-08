/*
Copyright 2012 Software Freedom Conservancy
Copyright 2007-2012 Selenium committers

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

import org.junit.Test;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.interactions.MoveTargetOutOfBoundsException;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JUnit4TestBase;
import org.openqa.selenium.testing.JavascriptEnabled;
import org.openqa.selenium.testing.TestUtilities;
import org.openqa.selenium.testing.drivers.Browser;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;
import static org.openqa.selenium.TestWaiter.waitFor;
import static org.openqa.selenium.WaitingConditions.elementLocationToBe;
import static org.openqa.selenium.testing.Ignore.Driver.ANDROID;
import static org.openqa.selenium.testing.Ignore.Driver.CHROME;
import static org.openqa.selenium.testing.Ignore.Driver.HTMLUNIT;
import static org.openqa.selenium.testing.Ignore.Driver.IE;
import static org.openqa.selenium.testing.Ignore.Driver.IPHONE;
import static org.openqa.selenium.testing.Ignore.Driver.OPERA;
import static org.openqa.selenium.testing.Ignore.Driver.OPERA_MOBILE;
import static org.openqa.selenium.testing.Ignore.Driver.SAFARI;
import static org.openqa.selenium.testing.Ignore.Driver.SELENESE;
import static org.openqa.selenium.testing.TestUtilities.assumeFalse;

@Ignore(
    value = {ANDROID, HTMLUNIT, IPHONE, SAFARI, SELENESE, OPERA_MOBILE},
    reason = "HtmlUnit: Advanced mouse actions only implemented in rendered browsers" +
             "Safari: not implemented (issue 4136)",
    issues = {4136})
public class DragAndDropTest extends JUnit4TestBase {

  @JavascriptEnabled
  @Test
  public void testDragAndDrop() {
    if (Platform.getCurrent().is(Platform.MAC)) {
      System.out.println("Skipping testDragAndDrop on Mac: See issue 2281.");
      return;
    }
    assumeFalse(Browser.detect() == Browser.opera &&
                TestUtilities.getEffectivePlatform().is(Platform.WINDOWS));

    driver.get(pages.dragAndDropPage);
    WebElement img = driver.findElement(By.id("test1"));
    Point expectedLocation = img.getLocation();
    drag(img, expectedLocation, 150, 200);
    waitFor(elementLocationToBe(img, expectedLocation));
    drag(img, expectedLocation, -50, -25);
    waitFor(elementLocationToBe(img, expectedLocation));
    drag(img, expectedLocation, 0, 0);
    waitFor(elementLocationToBe(img, expectedLocation));
    drag(img, expectedLocation, 1, -1);
    waitFor(elementLocationToBe(img, expectedLocation));
  }

  @JavascriptEnabled
  @Ignore(OPERA)
  @Test
  public void testDragAndDropToElement() {
    driver.get(pages.dragAndDropPage);
    WebElement img1 = driver.findElement(By.id("test1"));
    WebElement img2 = driver.findElement(By.id("test2"));
    new Actions(driver).dragAndDrop(img2, img1).perform();
    assertEquals(img1.getLocation(), img2.getLocation());
  }

  @JavascriptEnabled
  @Ignore(OPERA)
  @Test
  public void testDragAndDropToElementInIframe() {
    driver.get(pages.iframePage);
    final WebElement iframe = driver.findElement(By.tagName("iframe"));
    ((JavascriptExecutor) driver).executeScript("arguments[0].src = arguments[1]", iframe,
                                                pages.dragAndDropPage);
    driver.switchTo().frame(0);
    WebElement img1 = driver.findElement(By.id("test1"));
    WebElement img2 = driver.findElement(By.id("test2"));
    new Actions(driver).dragAndDrop(img2, img1).perform();
    assertEquals(img1.getLocation(), img2.getLocation());
  }

  @JavascriptEnabled
  @Test
  public void testElementInDiv() {
    if (Platform.getCurrent().is(Platform.MAC)) {
      System.out.println("Skipping testElementInDiv on Mac: See issue 2281.");
      return;
    }
    driver.get(pages.dragAndDropPage);
    WebElement img = driver.findElement(By.id("test3"));
    Point expectedLocation = img.getLocation();
    drag(img, expectedLocation, 100, 100);
    assertEquals(expectedLocation, img.getLocation());
  }

  @JavascriptEnabled
  @Ignore({CHROME, IE, OPERA})
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

  @JavascriptEnabled
  @NoDriverAfterTest
  // We can't reliably resize the window back afterwards, cross-browser, so have to kill the
  // window, otherwise we are stuck with a small window for the rest of the tests.
  // TODO(dawagner): Remove @NoDriverAfterTest when we can reliably do window resizing
  @Test
  public void testShouldAllowUsersToDragAndDropToElementsOffTheCurrentViewPort() {
    driver.get(pages.dragAndDropPage);

    JavascriptExecutor js = (JavascriptExecutor) driver;
    js.executeScript("window.resizeTo(300, 300);");

    driver.get(pages.dragAndDropPage);
    WebElement img = driver.findElement(By.id("test3"));
    Point expectedLocation = img.getLocation();
    drag(img, expectedLocation, 100, 100);
    assertEquals(expectedLocation, img.getLocation());
  }

  private void drag(WebElement elem, Point expectedLocation,
                    int moveRightBy, int moveDownBy) {
    new Actions(driver)
        .dragAndDropBy(elem, moveRightBy, moveDownBy)
        .perform();
    expectedLocation.move(expectedLocation.x + moveRightBy, expectedLocation.y + moveDownBy);
  }

  @JavascriptEnabled
  @Ignore(OPERA)
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

    assertEquals("Dropped!", text);

    WebElement reporter = driver.findElement(By.id("drop_reports"));
    // Assert that only one mouse click took place and the mouse was moved
    // during it.
    String reporterText = reporter.getText();
    Pattern pattern = Pattern.compile("start( move)* down( move)+ up( move)*");

    Matcher matcher = pattern.matcher(reporterText);

    assertTrue("Reporter text:" + reporterText, matcher.matches());
  }

  private static void sleep(int ms) {
    try {
      Thread.sleep(ms);
    } catch (InterruptedException e) {
      throw new RuntimeException("Interrupted: " + e.toString());
    }
  }

}