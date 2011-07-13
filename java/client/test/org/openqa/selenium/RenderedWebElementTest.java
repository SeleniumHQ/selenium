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

import org.openqa.selenium.interactions.Actions;

import java.util.concurrent.Callable;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.anyOf;
import static org.hamcrest.Matchers.equalTo;
import static org.openqa.selenium.Ignore.Driver.*;
import static org.openqa.selenium.TestWaiter.waitFor;

public class RenderedWebElementTest extends AbstractDriverTestCase {

  @JavascriptEnabled
  @Ignore({SELENESE, OPERA})
  public void testShouldPickUpStyleOfAnElement() {
    driver.get(pages.javascriptPage);

    WebElement element = driver.findElement(By.id("green-parent"));
    String backgroundColour = element.getCssValue("background-color");

    // TODO: How should this be standardized? Should it be standardized?
    assertThat(backgroundColour, anyOf(
        equalTo("#008000"),
        equalTo("rgb(0, 128, 0)")));

    element = driver.findElement(By.id("red-item"));
    backgroundColour = element.getCssValue("background-color");

    // TODO: How should this be standardized? Should it be standardized?
    assertThat(backgroundColour, anyOf(
        equalTo("#ff0000"),
        equalTo("rgb(255, 0, 0)")));
  }

  // TODO: This test's value seems dubious at best. The CSS spec does not define how browsers
  // should handle sub-pixel rendering, and every browser seems to be different anyhow:
  // http://ejohn.org/blog/sub-pixel-problems-in-css/
  @JavascriptEnabled
  @Ignore({IE, CHROME, SELENESE, IPHONE, OPERA})
  //Reason for Chrome: WebKit bug 28804
  public void testShouldHandleNonIntegerPositionAndSize() {
    driver.get(pages.rectanglesPage);

    WebElement r2 = driver.findElement(By.id("r2"));
    String left = r2.getCssValue("left");
    assertTrue("left (\"" + left + "\") should start with \"10.9\".", left.startsWith("10.9"));
    String top = r2.getCssValue("top");
    assertTrue("top (\"" + top + "\") should start with \"10.1\".", top.startsWith("10.1"));
    assertEquals(new Point(11, 10), r2.getLocation());
    String width = r2.getCssValue("width");
    assertTrue("width (\"" + left + "\") should start with \"48.6\".", width.startsWith("48.6"));
    String height = r2.getCssValue("height");
    assertTrue("height (\"" + left + "\") should start with \"49.3\".", height.startsWith("49.3"));
    assertEquals(r2.getSize(), new Dimension(49, 49));
  }

  @JavascriptEnabled
  @Ignore({SELENESE, IPHONE, OPERA})
  public void testShouldAllowInheritedStylesToBeUsed() {
    driver.get(pages.javascriptPage);

    WebElement element = driver.findElement(By.id("green-item"));
    String backgroundColour = element.getCssValue("background-color");

    // TODO: How should this be standardized? Should it be standardized?
    assertThat(backgroundColour, anyOf(
        equalTo("transparent"),
        equalTo("rgba(0, 0, 0, 0)")));
  }

  @JavascriptEnabled
  @Ignore({CHROME, IPHONE, SELENESE, HTMLUNIT, OPERA})
  public void testShouldAllowUsersToHoverOverElements() {
    if (!hasInputDevices()) {
      return;
    }

    driver.get(pages.javascriptPage);

    WebElement element = driver.findElement(By.id("menu1"));
    if (!supportsNativeEvents()) {
      System.out.println("Skipping hover test: needs native events");
      return;
    }

    final WebElement item = driver.findElement(By.id("item1"));
    assertEquals("", item.getText());

    ((JavascriptExecutor) driver).executeScript("arguments[0].style.background = 'green'", element);
    new Actions(driver).moveToElement(element).build().perform();

    waitFor(new Callable<Boolean>() {

      public Boolean call() throws Exception {
        return !item.getText().equals("");
      }
    });

    assertEquals("Item 1", item.getText());
  }

  @JavascriptEnabled
  public void testShouldCorrectlyIdentifyThatAnElementHasWidth() {
    driver.get(pages.xhtmlTestPage);

    WebElement shrinko = driver.findElement(By.id("linkId"));
    Dimension size = shrinko.getSize();
    assertTrue("Width expected to be greater than 0", size.width > 0);
    assertTrue("Height expected to be greater than 0", size.height > 0);
  }

  @JavascriptEnabled
  @Ignore(SELENESE)
  public void testCorrectlyDetectMapElementsAreShown() {
    driver.get(pages.mapVisibilityPage);

    final WebElement area = driver.findElement(By.id("mtgt_unnamed_0"));

    boolean isShown = area.isDisplayed();
    assertTrue("The element and the enclosing map should be considered shown.", isShown);
  }

  @Ignore
  @JavascriptEnabled
  public void testCanClickOnSuckerFishMenuItem() throws Exception {
    if (!hasInputDevices()) {
      return;
    }

    driver.get(pages.javascriptPage);

    WebElement element = driver.findElement(By.id("menu1"));
    if (!supportsNativeEvents()) {
      System.out.println("Skipping hover test: needs native events");
      return;
    }

    new Actions(driver).moveToElement(element).build().perform();

    WebElement target = driver.findElement(By.id("item1"));
    assertTrue(target.isDisplayed());
    target.click();

    String text = driver.findElement(By.id("result")).getText();
    assertTrue(text.contains("item 1"));
  }

  @JavascriptEnabled
  @Ignore(value = {HTMLUNIT}, reason = "Not implemented in HtmlUnit yet.")
  public void testMovingMouseByRelativeOffset() {
    if (!hasInputDevices() || !supportsNativeEvents()) {
      System.out.println(
          String.format("Skipping move by offset test: native events %s has input devices: %s",
              supportsNativeEvents(), hasInputDevices()));
      return;
    }

    driver.get(pages.mouseTrackerPage);

    WebElement trackerDiv = driver.findElement(By.id("mousetracker"));
    new Actions(driver).moveToElement(trackerDiv).build().perform();

    WebElement reporter = driver.findElement(By.id("status"));

    waitFor(fuzzyMatchingOfCoordinates(reporter, 50, 200));

    new Actions(driver).moveByOffset(10, 20).build().perform();

    waitFor(fuzzyMatchingOfCoordinates(reporter, 60, 220));
  }

  @JavascriptEnabled
  @Ignore(value = {HTMLUNIT}, reason = "Not implemented in HtmlUnit yet.")
  public void testMovingMouseToRelativeElementOffset() {
    if (!hasInputDevices() || !supportsNativeEvents()) {
      System.out.println(
          String.format("Skipping move to offset test: native events %s has input devices: %s",
              supportsNativeEvents(), hasInputDevices()));
      return;
    }

    driver.get(pages.mouseTrackerPage);

    WebElement trackerDiv = driver.findElement(By.id("mousetracker"));
    new Actions(driver).moveToElement(trackerDiv, 95, 195).build()
        .perform();

    WebElement reporter = driver.findElement(By.id("status"));

    waitFor(fuzzyMatchingOfCoordinates(reporter, 95, 195));
  }

  @JavascriptEnabled
  @NeedsFreshDriver
  @Ignore(value = {HTMLUNIT}, reason = "Not implemented in HtmlUnit yet.")
  public void testMoveRelativeToBody() {
    if (!hasInputDevices() || !supportsNativeEvents()) {
      System.out.println(
          String.format("Skipping move to offset test: native events %s has input devices: %s",
              supportsNativeEvents(), hasInputDevices()));
      return;
    }

    driver.get(pages.mouseTrackerPage);

    new Actions(driver).moveByOffset(50, 100).build().perform();

    WebElement reporter = driver.findElement(By.id("status"));

    waitFor(fuzzyMatchingOfCoordinates(reporter, 40, 20));
  }


  private boolean hasInputDevices() {
    if (!(driver instanceof HasInputDevices)) {
      System.out.println("Driver does not support input devices. Skipping test");
      return false;
    }
    return true;
  }

  private boolean supportsNativeEvents() {
    if (Platform.getCurrent().is(Platform.WINDOWS)) {
      return true;
    }

    if (driver instanceof HasCapabilities) {
      Capabilities capabilities = ((HasCapabilities) driver).getCapabilities();
      Object nativeEvents = capabilities.getCapability("nativeEvents");
      return nativeEvents != null && (Boolean) nativeEvents;
    }

    return false;
  }

  private boolean fuzzyPositionMatching(int expectedX, int expectedY, String locationTouple) {
    String[] splitString = locationTouple.split(",");
    int gotX = Integer.parseInt(splitString[0].trim());
    int gotY = Integer.parseInt(splitString[1].trim());

    // Everything within 5 pixels range is OK
    final int ALLOWED_DEVIATION = 5;
    return Math.abs(expectedX - gotX) < ALLOWED_DEVIATION &&
        Math.abs(expectedY - gotY) < ALLOWED_DEVIATION;

  }

  private Callable<Boolean> fuzzyMatchingOfCoordinates(
      final WebElement element, final int x, final int y) {
    return new Callable<Boolean>() {
      public Boolean call() throws Exception {
        return fuzzyPositionMatching(x, y, element.getText());
      }

      @Override
      public String toString() {
        return "Coordinates: " + element.getText() + " but expected: " +
            x + ", " + y;
      }
    };
  }
}
