/*
Copyright 2007-2009 Selenium committers

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
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JUnit4TestBase;
import org.openqa.selenium.testing.JavascriptEnabled;
import org.openqa.selenium.testing.NeedsLocalEnvironment;
import org.openqa.selenium.testing.TestUtilities;
import org.openqa.selenium.testing.drivers.WebDriverBuilder;

import java.awt.Robot;
import java.util.concurrent.Callable;

import static org.hamcrest.Matchers.anyOf;
import static org.hamcrest.Matchers.equalTo;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertThat;
import static org.junit.Assert.assertTrue;
import static org.junit.Assume.assumeTrue;
import static org.openqa.selenium.TestWaiter.waitFor;
import static org.openqa.selenium.remote.CapabilityType.ENABLE_PERSISTENT_HOVERING;
import static org.openqa.selenium.testing.Ignore.Driver.ANDROID;
import static org.openqa.selenium.testing.Ignore.Driver.CHROME;
import static org.openqa.selenium.testing.Ignore.Driver.FIREFOX;
import static org.openqa.selenium.testing.Ignore.Driver.HTMLUNIT;
import static org.openqa.selenium.testing.Ignore.Driver.IE;
import static org.openqa.selenium.testing.Ignore.Driver.IPHONE;
import static org.openqa.selenium.testing.Ignore.Driver.OPERA;
import static org.openqa.selenium.testing.Ignore.Driver.OPERA_MOBILE;
import static org.openqa.selenium.testing.Ignore.Driver.SAFARI;
import static org.openqa.selenium.testing.Ignore.Driver.SELENESE;

public class RenderedWebElementTest extends JUnit4TestBase {

  @JavascriptEnabled
  @Ignore({ANDROID, CHROME, HTMLUNIT, OPERA, SELENESE})
  @Test
  public void testShouldPickUpStyleOfAnElement() {
    driver.get(pages.javascriptPage);

    WebElement element = driver.findElement(By.id("green-parent"));
    String backgroundColour = element.getCssValue("background-color");

    assertEquals("rgba(0, 128, 0, 1)", backgroundColour);

    element = driver.findElement(By.id("red-item"));
    backgroundColour = element.getCssValue("background-color");

    assertEquals("rgba(255, 0, 0, 1)", backgroundColour);
  }

  @JavascriptEnabled
  @Ignore({ANDROID, CHROME, HTMLUNIT, OPERA, SELENESE})
  @Test
  public void testGetCssValueShouldReturnStandardizedColour() {
    driver.get(pages.colorPage);

    WebElement element = driver.findElement(By.id("namedColor"));
    String backgroundColour = element.getCssValue("background-color");
    assertEquals("rgba(0, 128, 0, 1)", backgroundColour);

    element = driver.findElement(By.id("rgb"));
    backgroundColour = element.getCssValue("background-color");
    assertEquals("rgba(0, 128, 0, 1)", backgroundColour);

  }


  // TODO: This test's value seems dubious at best. The CSS spec does not define how browsers
  // should handle sub-pixel rendering, and every browser seems to be different anyhow:
  // http://ejohn.org/blog/sub-pixel-problems-in-css/
  @JavascriptEnabled
  @Ignore({IE, CHROME, SELENESE, IPHONE, OPERA, ANDROID, SAFARI, OPERA_MOBILE})
  // Reason for Chrome: WebKit bug 28804
  @Test
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
  @Ignore({ANDROID, IPHONE, OPERA, SELENESE})
  @Test
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
  @Ignore(
      value = {HTMLUNIT, IPHONE,  OPERA, SELENESE},
      reason = "HtmlUnit: Advanced mouse actions only implemented in rendered browsers. Firefox: hover is broken again.")
  @Test
  public void testShouldAllowUsersToHoverOverElements() {
    if (!hasInputDevices()) {
      return;
    }

    if (!TestUtilities.isNativeEventsEnabled(driver)) {
      System.out.println("Skipping hover test: needs native events");
      return;
    }

    driver.get(pages.javascriptPage);

    WebElement element = driver.findElement(By.id("menu1"));

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
  @Ignore(
      value = {HTMLUNIT, IPHONE, SELENESE, OPERA},
      reason = "HtmlUnit: Advanced mouse actions only implemented in rendered browsers")
  @Test
  public void testHoverPersists() throws Exception {
    if (!hasInputDevices()) {
      return;
    }

    if (!TestUtilities.isNativeEventsEnabled(driver)) {
      System.out.println("Skipping hover test: needs native events");
      return;
    }

    // This test passes on IE. When running in Firefox on Windows, the test
    // will fail if the mouse cursor is not in the window. Solution: Maximize.
    if ((TestUtilities.getEffectivePlatform().is(Platform.WINDOWS)) &&
        TestUtilities.isFirefox(driver)) {
      driver.manage().window().maximize();
    }

    driver.get(pages.javascriptPage);
    // Move to a different element to make sure the mouse is not over the
    // element with id 'item1' (from a previous test).
    new Actions(driver).moveToElement(driver.findElement(By.id("dynamo"))).build().perform();

    WebElement element = driver.findElement(By.id("menu1"));

    final WebElement item = driver.findElement(By.id("item1"));
    assertEquals("", item.getText());

    ((JavascriptExecutor) driver).executeScript("arguments[0].style.background = 'green'", element);
    new Actions(driver).moveToElement(element).build().perform();

    // Intentionally wait to make sure hover persists.
    Thread.sleep(2000);

    waitFor(new Callable<Boolean>() {

      public Boolean call() throws Exception {
        return !item.getText().equals("");
      }
    });

    assertEquals("Item 1", item.getText());
  }


  @JavascriptEnabled
  @Ignore(
      value = {HTMLUNIT, IPHONE, SELENESE, OPERA, FIREFOX},
      reason = "This is an IE only tests")
  @NoDriverAfterTest
  @NeedsLocalEnvironment
  @Test
  public void testPersistentHoverCanBeTurnedOff() throws Exception {
    if (!hasInputDevices()) {
      return;
    }

    assumeTrue(TestUtilities.isInternetExplorer(driver));
    // Destroy the previous driver to make sure the hovering thread is
    // stopped.
    driver.quit();

    DesiredCapabilities caps = new DesiredCapabilities();
    caps.setCapability(ENABLE_PERSISTENT_HOVERING, false);
    WebDriverBuilder builder = new WebDriverBuilder().setDesiredCapabilities(caps);
    driver = builder.get();

    try {
      driver.get(pages.javascriptPage);
      // Move to a different element to make sure the mouse is not over the
      // element with id 'item1' (from a previous test).
      new Actions(driver).moveToElement(driver.findElement(By.id("keyUp"))).build().perform();
      WebElement element = driver.findElement(By.id("menu1"));

      final WebElement item = driver.findElement(By.id("item1"));
      assertEquals("", item.getText());

      ((JavascriptExecutor) driver).executeScript("arguments[0].style.background = 'green'", element);
      new Actions(driver).moveToElement(element).build().perform();

      // Move the mouse somewhere - to make sure that the thread firing the events making
      // hover persistent is not active.
      Robot robot = new Robot();
      robot.mouseMove(50, 50);

      // Intentionally wait to make sure hover DOES NOT persist.
      Thread.sleep(1000);

      waitFor(new Callable<Boolean>() {

        public Boolean call() throws Exception {
          return item.getText().equals("");
        }
      });

      assertEquals("", item.getText());

    } finally {
      driver.quit();
    }
  }


  @JavascriptEnabled
  @Test
  @Ignore({CHROME, OPERA, OPERA_MOBILE})
  public void canClickOnASuckerFishStyleMenu() throws InterruptedException {
    assumeTrue(hasInputDevices());
    assumeTrue(TestUtilities.isNativeEventsEnabled(driver));

    driver.get(pages.javascriptPage);

    // This test passes on IE. When running in Firefox on Windows, the test
    // will fail if the mouse cursor is not in the window. Solution: Maximize.
    if ((TestUtilities.getEffectivePlatform().is(Platform.WINDOWS)) &&
        TestUtilities.isFirefox(driver)) {
      driver.manage().window().maximize();
    }

    // Move to a different element to make sure the mouse is not over the
    // element with id 'item1' (from a previous test).
    new Actions(driver).moveToElement(driver.findElement(By.id("dynamo"))).build().perform();

    WebElement element = driver.findElement(By.id("menu1"));

    final WebElement item = driver.findElement(By.id("item1"));
    assertEquals("", item.getText());

    ((JavascriptExecutor) driver).executeScript("arguments[0].style.background = 'green'", element);
    new Actions(driver).moveToElement(element).build().perform();

    // Intentionally wait to make sure hover persists.
    Thread.sleep(2000);

    item.click();

    WebElement result = driver.findElement(By.id("result"));
    waitFor(WaitingConditions.elementTextToContain(result, "item 1"));
  }

  @JavascriptEnabled
  @Test
  public void testShouldCorrectlyIdentifyThatAnElementHasWidth() {
    driver.get(pages.xhtmlTestPage);

    WebElement shrinko = driver.findElement(By.id("linkId"));
    Dimension size = shrinko.getSize();
    assertTrue("Width expected to be greater than 0", size.width > 0);
    assertTrue("Height expected to be greater than 0", size.height > 0);
  }

  @JavascriptEnabled
  @Ignore(SELENESE)
  @Test
  public void testCorrectlyDetectMapElementsAreShown() {
    driver.get(pages.mapVisibilityPage);

    final WebElement area = driver.findElement(By.id("mtgt_unnamed_0"));

    boolean isShown = area.isDisplayed();
    assertTrue("The element and the enclosing map should be considered shown.", isShown);
  }

  @JavascriptEnabled
  @Test
  public void testCanClickOnSuckerFishMenuItem() throws Exception {
    if (!hasInputDevices()) {
      return;
    }

    driver.get(pages.javascriptPage);

    WebElement element = driver.findElement(By.id("menu1"));
    if (!TestUtilities.isNativeEventsEnabled(driver)) {
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
  @Ignore(value = {HTMLUNIT, SELENESE},
      reason = "Advanced mouse actions only implemented in rendered browsers")
  @Test
  public void testMovingMouseByRelativeOffset() {
    if (!hasInputDevices() || !TestUtilities.isNativeEventsEnabled(driver)) {
      System.out.println(
          String.format("Skipping move by offset test: native events %s has input devices: %s",
            TestUtilities.isNativeEventsEnabled(driver), hasInputDevices()));
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
  @Ignore(value = {HTMLUNIT, SELENESE},
      reason = "Advanced mouse actions only implemented in rendered browsers")
  @Test
  public void testMovingMouseToRelativeElementOffset() {
    if (!hasInputDevices() || !TestUtilities.isNativeEventsEnabled(driver)) {
      System.out.println(
          String.format("Skipping move to offset test: native events %s has input devices: %s",
            TestUtilities.isNativeEventsEnabled(driver), hasInputDevices()));
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
  @Ignore(value = {CHROME, HTMLUNIT, SELENESE}, reason = "Advanced mouse actions only implemented in rendered browsers")
  @Test
  public void testMoveRelativeToBody() {
    if (!hasInputDevices() || !TestUtilities.isNativeEventsEnabled(driver)) {
      System.out.println(
          String.format("Skipping move to offset test: native events %s has input devices: %s",
            TestUtilities.isNativeEventsEnabled(driver), hasInputDevices()));
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
