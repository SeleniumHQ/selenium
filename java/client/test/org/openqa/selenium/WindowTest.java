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

package org.openqa.selenium;

import static org.hamcrest.Matchers.greaterThan;
import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.is;
import static org.junit.Assert.assertThat;
import static org.junit.Assume.assumeFalse;
import static org.openqa.selenium.Platform.ANDROID;
import static org.openqa.selenium.Platform.LINUX;
import static org.openqa.selenium.testing.Driver.PHANTOMJS;
import static org.openqa.selenium.testing.Driver.SAFARI;

import org.junit.Test;
import org.openqa.selenium.support.ui.ExpectedCondition;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JUnit4TestBase;
import org.openqa.selenium.testing.SwitchToTopAfterTest;
import org.openqa.selenium.testing.TestUtilities;
import org.openqa.selenium.testing.drivers.SauceDriver;

import java.util.logging.Logger;

public class WindowTest extends JUnit4TestBase {

  private static Logger log = Logger.getLogger(WindowTest.class.getName());

  @Test
  public void testGetsTheSizeOfTheCurrentWindow() {
    assumeFalse(
        "window().getSize() is not implemented for Chrome for Android. "
        + "https://code.google.com/p/chromedriver/issues/detail?id=1005",
        TestUtilities.isChrome(driver) && TestUtilities.getEffectivePlatform(driver).is(ANDROID));
    Dimension size = driver.manage().window().getSize();

    assertThat(size.width, is(greaterThan(0)));
    assertThat(size.height, is(greaterThan(0)));
  }

  @Test
  public void testSetsTheSizeOfTheCurrentWindow() {
    // Browser window cannot be resized or moved on ANDROID (and most mobile platforms
    // though others aren't defined in org.openqa.selenium.Platform).
    assumeFalse(TestUtilities.getEffectivePlatform(driver).is(ANDROID));
    assumeFalse("https://code.google.com/p/chromedriver/issues/detail?id=1129",
        SauceDriver.shouldUseSauce() && TestUtilities.isChrome(driver)
        && TestUtilities.getEffectivePlatform(driver).is(LINUX));
    // resize relative to the initial size, since we don't know what it is
    changeSizeBy(-20, -20);
  }

  @SwitchToTopAfterTest
  @Test
  public void testSetsTheSizeOfTheCurrentWindowFromFrame() {
    // Browser window cannot be resized or moved on ANDROID (and most mobile platforms
    // though others aren't defined in org.openqa.selenium.Platform).
    assumeFalse(TestUtilities.getEffectivePlatform(driver).is(ANDROID));
    assumeFalse("https://code.google.com/p/chromedriver/issues/detail?id=1129",
        SauceDriver.shouldUseSauce() && TestUtilities.isChrome(driver)
        && TestUtilities.getEffectivePlatform(driver).is(LINUX));
    driver.get(pages.framesetPage);
    driver.switchTo().frame("fourth");
    // resize relative to the initial size, since we don't know what it is
    changeSizeBy(-20, -20);
  }

  @SwitchToTopAfterTest
  @Test
  public void testSetsTheSizeOfTheCurrentWindowFromIframe() {
    // Browser window cannot be resized or moved on ANDROID (and most mobile platforms
    // though others aren't defined in org.openqa.selenium.Platform).
    assumeFalse(TestUtilities.getEffectivePlatform(driver).is(ANDROID));
    assumeFalse("https://code.google.com/p/chromedriver/issues/detail?id=1129",
        SauceDriver.shouldUseSauce() && TestUtilities.isChrome(driver)
        && TestUtilities.getEffectivePlatform(driver).is(LINUX));
    driver.get(pages.iframePage);
    driver.switchTo().frame("iframe1-name");
    // resize relative to the initial size, since we don't know what it is
    changeSizeBy(-20, -20);
  }

  @Test
  public void testGetsThePositionOfTheCurrentWindow() {
    // Window position is undefined on ANDROID (and most mobile platforms
    // though others aren't defined in org.openqa.selenium.Platform).
    assumeFalse(TestUtilities.getEffectivePlatform(driver).is(ANDROID));
    Point position = driver.manage().window().getPosition();

    assertThat(position.x, is(greaterThanOrEqualTo(0)));
    assertThat(position.y, is(greaterThanOrEqualTo(0)));
  }

  @Test
  @Ignore(value = {SAFARI, PHANTOMJS},
      reason = "Safari: getPosition after setPosition doesn't match up exactly, " +
          "as expected - probably due to nuances in Mac OSX window manager.")
  public void testSetsThePositionOfTheCurrentWindow() throws InterruptedException {
    // Browser window cannot be resized or moved on ANDROID (and most mobile platforms
    // though others aren't defined in org.openqa.selenium.Platform).
    assumeFalse(TestUtilities.getEffectivePlatform(driver).is(ANDROID));
    assumeFalse("https://code.google.com/p/chromedriver/issues/detail?id=1129",
        SauceDriver.shouldUseSauce() && TestUtilities.isChrome(driver)
        && TestUtilities.getEffectivePlatform(driver).is(LINUX));
    WebDriver.Window window = driver.manage().window();
    Point position = window.getPosition();
    Dimension originalSize = window.getSize();

    try {
      // Some Linux window managers start taking liberties wrt window positions when moving the window
      // off-screen. Therefore, try to stay on-screen. Hopefully you have more than 210 px,
      // or this may fail.
      window.setSize(new Dimension(200, 200));
      Point targetPosition = new Point(position.x + 10, position.y + 10);
      window.setPosition(targetPosition);

      wait.until(xEqual(targetPosition));
      wait.until(yEqual(targetPosition));
    } finally {
      window.setSize(originalSize);
    }
  }

  @Ignore(value = {PHANTOMJS}, reason = "Not yet implemented.")
  @Test
  public void testCanMaximizeTheWindow() throws InterruptedException {
    // Browser window cannot be resized or moved on ANDROID (and most mobile platforms
    // though others aren't defined in org.openqa.selenium.Platform).
    assumeFalse(TestUtilities.getEffectivePlatform(driver).is(ANDROID));
    assumeNotLinuxAtSauce();
    assumeNotLinuxOnTravis();

    changeSizeTo(new Dimension(450, 273));
    maximize();
  }

  @SwitchToTopAfterTest
  @Ignore(value = {PHANTOMJS}, reason = "Not yet implemented.")
  @Test
  public void testCanMaximizeTheWindowFromFrame() throws InterruptedException {
    // Browser window cannot be resized or moved on ANDROID (and most mobile platforms
    // though others aren't defined in org.openqa.selenium.Platform).
    assumeFalse(TestUtilities.getEffectivePlatform(driver).is(ANDROID));
    assumeNotLinuxAtSauce();
    assumeNotLinuxOnTravis();

    driver.get(pages.framesetPage);
    changeSizeTo(new Dimension(450, 274));

    driver.switchTo().frame("fourth");
    maximize();
  }

  @Ignore(value = {PHANTOMJS}, reason = "Not yet implemented.")
  @SwitchToTopAfterTest
  @Test
  public void testCanMaximizeTheWindowFromIframe() throws InterruptedException {
    // Browser window cannot be resized or moved on ANDROID (and most mobile platforms
    // though others aren't defined in org.openqa.selenium.Platform).
    assumeFalse(TestUtilities.getEffectivePlatform(driver).is(ANDROID));
    assumeNotLinuxAtSauce();
    assumeNotLinuxOnTravis();

    driver.get(pages.iframePage);
    changeSizeTo(new Dimension(450, 275));

    driver.switchTo().frame("iframe1-name");
    maximize();
  }

  private void changeSizeBy(int deltaX, int deltaY) {
    WebDriver.Window window = driver.manage().window();
    Dimension size = window.getSize();
    changeSizeTo(new Dimension(size.width + deltaX, size.height + deltaY));
  }

  private void changeSizeTo(Dimension targetSize) {
    WebDriver.Window window = driver.manage().window();

    window.setSize(targetSize);

    wait.until(windowSizeEqual(targetSize));
  }

  private void maximize() {
    WebDriver.Window window = driver.manage().window();

    Dimension size = window.getSize();

    window.maximize();
    wait.until(windowWidthToBeGreaterThan(size));
    wait.until(windowHeightToBeGreaterThan(size));
  }

  private ExpectedCondition<Boolean> windowSizeEqual(final Dimension size) {
    return new ExpectedCondition<Boolean>() {
      public Boolean apply(WebDriver driver) {
        Dimension newSize = driver.manage().window().getSize();

        return newSize.height == size.height &&
               newSize.width == size.width;
      }
    };
  }

  private ExpectedCondition<Boolean> windowWidthToBeGreaterThan(final Dimension size) {
    return new ExpectedCondition<Boolean>() {
      public Boolean apply(WebDriver driver) {
        Dimension newSize = driver.manage().window().getSize();
        log.info("waiting for width, Current dimensions are " + newSize);
        if(newSize.width != size.width) {
          return true;
        }

        return null;
      }
    };
  }

  private ExpectedCondition<Boolean> windowHeightToBeGreaterThan(final Dimension size) {
    return new ExpectedCondition<Boolean>() {
      @Override
      public Boolean apply(WebDriver driver) {
        Dimension newSize = driver.manage().window().getSize();
        log.info("waiting for height, Current dimensions are " + newSize);
        if(newSize.height != size.height) {
          return true;
        }

        return null;
      }
    };
  }
  private ExpectedCondition<Boolean> xEqual(final Point targetPosition) {
    return new ExpectedCondition<Boolean>() {
      public Boolean apply(WebDriver driver) {
        Point newPosition = driver.manage().window().getPosition();
        if(newPosition.x == targetPosition.x) {
          return true;
        }

        return null;
      }
    };
  }

  private ExpectedCondition<Boolean> yEqual(final Point targetPosition) {
    return new ExpectedCondition<Boolean>() {
      @Override
      public Boolean apply(WebDriver driver) {
        Point newPosition = driver.manage().window().getPosition();
        if(newPosition.y == targetPosition.y) {
          return true;
        }

        return null;
      }
    };
  }

  private void assumeNotLinuxAtSauce() {
    // Tests that maximize browser window used to fail when Sauce didn't run a window manager
    // on Linux. 2015-07-16, they still fail although Sauce reportedly runs metacity.
    // Chrome/Linux: simply fail.
    // Firefox/Linux: FirefoxDriver finally report a changed window size 22 seconds after replying
    // the maximize command, but video never shows the maximized window.
    assumeFalse(TestUtilities.getEffectivePlatform(driver).is(LINUX) && SauceDriver.shouldUseSauce());
  }

  private void assumeNotLinuxOnTravis() {
    assumeFalse(TestUtilities.getEffectivePlatform(driver).is(LINUX) && Boolean.valueOf(System.getenv().getOrDefault("TRAVIS", "false")));
  }

}
