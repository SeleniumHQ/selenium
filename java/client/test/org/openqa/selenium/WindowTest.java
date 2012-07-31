/*
Copyright 2011-2012 Selenium committers
Copyright 2011-2012 Software Freedom Conservancy.

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
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JUnit4TestBase;
import org.openqa.selenium.testing.TestUtilities;
import org.openqa.selenium.testing.drivers.SauceDriver;

import java.util.concurrent.Callable;
import java.util.logging.Logger;

import static org.hamcrest.Matchers.greaterThan;
import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.is;
import static org.junit.Assert.assertThat;
import static org.openqa.selenium.TestWaiter.waitFor;
import static org.openqa.selenium.testing.Ignore.Driver.ANDROID;
import static org.openqa.selenium.testing.Ignore.Driver.CHROME;
import static org.openqa.selenium.testing.Ignore.Driver.HTMLUNIT;
import static org.openqa.selenium.testing.Ignore.Driver.IPHONE;
import static org.openqa.selenium.testing.Ignore.Driver.OPERA;
import static org.openqa.selenium.testing.Ignore.Driver.OPERA_MOBILE;
import static org.openqa.selenium.testing.Ignore.Driver.SAFARI;
import static org.openqa.selenium.testing.Ignore.Driver.SELENESE;

@Ignore(value = {ANDROID, HTMLUNIT, IPHONE, OPERA, SELENESE, OPERA_MOBILE},
        reason = "Not yet implemented.")
public class WindowTest extends JUnit4TestBase {

  private static Logger log = Logger.getLogger(WindowTest.class.getName());

  @Test
  public void testGetsTheSizeOfTheCurrentWindow() {
    Dimension size = driver.manage().window().getSize();

    assertThat(size.width, is(greaterThan(0)));
    assertThat(size.height, is(greaterThan(0)));
  }

  @Test
  public void testSetsTheSizeOfTheCurrentWindow() {
    // resize relative to the initial size, since we don't know what it is
    changeSizeBy(-20, -20);
  }

  @Test
  public void testSetsTheSizeOfTheCurrentWindowFromFrame() {
    driver.get(pages.framesetPage);
    driver.switchTo().frame("fourth");
    try {
      // resize relative to the initial size, since we don't know what it is
      changeSizeBy(-20, -20);
    } finally {
      driver.switchTo().defaultContent();
    }
  }

  @Test
  public void testSetsTheSizeOfTheCurrentWindowFromIframe() {
    driver.get(pages.iframePage);
    driver.switchTo().frame("iframe1-name");
    try {
      // resize relative to the initial size, since we don't know what it is
      changeSizeBy(-20, -20);
    } finally {
      driver.switchTo().defaultContent();
    }
  }

  @Test
  public void testGetsThePositionOfTheCurrentWindow() {
    Point position = driver.manage().window().getPosition();

    assertThat(position.x, is(greaterThanOrEqualTo(0)));
    assertThat(position.y, is(greaterThanOrEqualTo(0)));
  }

  @Test
  @Ignore(value = { SAFARI },
      reason = "Safari: getPosition after setPosition doesn't match up exactly, " +
          "as expected - probably due to nuances in Mac OSX window manager.")
  public void testSetsThePositionOfTheCurrentWindow() throws InterruptedException {
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

      waitFor(xEqual(driver, targetPosition));
      waitFor(yEqual(driver, targetPosition));
    } finally {
      window.setSize(originalSize);
    }
  }

  @Ignore(value = {CHROME}, reason = "Not yet implemented.")
  @Test
  public void testCanMaximizeTheWindow() throws InterruptedException {
    if(SauceDriver.shouldUseSauce() && TestUtilities.getEffectivePlatform().is(Platform.LINUX)) {
      // This test requires a window manager on Linux, and Sauce currently doesn't have one.
      return;
    }

    changeSizeTo(new Dimension(275, 275));
    maximize();
  }

  @Ignore(value = {CHROME}, reason = "Not yet implemented.")
  @Test
  public void testCanMaximizeTheWindowFromFrame() throws InterruptedException {
    if(SauceDriver.shouldUseSauce() && TestUtilities.getEffectivePlatform().is(Platform.LINUX)) {
      // This test requires a window manager on Linux, and Sauce currently doesn't have one.
      return;
    }

    driver.get(pages.framesetPage);
    changeSizeTo(new Dimension(275, 275));

    driver.switchTo().frame("fourth");
    try {
      maximize();
    } finally {
      driver.switchTo().defaultContent();
    }
  }

  @Ignore(value = {CHROME}, reason = "Not yet implemented.")
  @Test
  public void testCanMaximizeTheWindowFromIframe() throws InterruptedException {
    if(SauceDriver.shouldUseSauce() && TestUtilities.getEffectivePlatform().is(Platform.LINUX)) {
      // This test requires a window manager on Linux, and Sauce currently doesn't have one.
      return;
    }

    driver.get(pages.iframePage);
    changeSizeTo(new Dimension(275, 275));

    driver.switchTo().frame("iframe1-name");
    try {
      maximize();
    } finally {
      driver.switchTo().defaultContent();
    }
  }

  private void changeSizeBy(int deltaX, int deltaY) {
    WebDriver.Window window = driver.manage().window();
    Dimension size = window.getSize();
    changeSizeTo(new Dimension(size.width + deltaX, size.height + deltaY));
  }

  private void changeSizeTo(Dimension targetSize) {
    WebDriver.Window window = driver.manage().window();

    window.setSize(targetSize);
    waitFor(windowHeightToEqual(driver,targetSize));
    waitFor(windowWidthToEqual(driver, targetSize));
  }

  private void maximize() {
    WebDriver.Window window = driver.manage().window();

    Dimension size = window.getSize();

    window.maximize();
    waitFor(windowWidthToBeGreaterThan(driver, size));
    waitFor(windowHeightToBeGreaterThan(driver, size));
  }

  private Callable<Boolean> windowWidthToEqual(final WebDriver driver, final Dimension size) {
    return new Callable<Boolean>() {
      public Boolean call() throws Exception {
        Dimension newSize = driver.manage().window().getSize();
        if(newSize.width == size.width) {
          return true;
        }
        return null;
      }
    };
  }

  private Callable<Boolean> windowHeightToEqual(final WebDriver driver, final Dimension size) {
    return new Callable<Boolean>() {
      public Boolean call() throws Exception {
        Dimension newSize = driver.manage().window().getSize();
        if(newSize.height == size.height) {
          return true;
        }

        return null;
      }
    };
  }

  private Callable<Boolean> windowWidthToBeGreaterThan(final WebDriver driver, final Dimension size) {
    return new Callable<Boolean>() {
      public Boolean call() throws Exception {
        Dimension newSize = driver.manage().window().getSize();
        log.info("waiting for width, Current dimensions are " + newSize);
        if(newSize.width != size.width) {
          return true;
        }

        return null;
      }
    };
  }

  private Callable<Boolean> windowHeightToBeGreaterThan(final WebDriver driver, final Dimension size) {
    return new Callable<Boolean>() {
      public Boolean call() throws Exception {
        Dimension newSize = driver.manage().window().getSize();
        log.info("waiting for height, Current dimensions are " + newSize);
        if(newSize.height != size.height) {
          return true;
        }

        return null;
      }
    };
  }
  private Callable<Boolean> xEqual(final WebDriver driver, final Point targetPosition) {
    return new Callable<Boolean>() {
      public Boolean call() throws Exception {
        Point newPosition = driver.manage().window().getPosition();
        if(newPosition.x == targetPosition.x) {
          return true;
        }

        return null;
      }
    };
  }
  private Callable<Boolean> yEqual(final WebDriver driver, final Point targetPosition) {
    return new Callable<Boolean>() {
      public Boolean call() throws Exception {
        Point newPosition = driver.manage().window().getPosition();
        if(newPosition.y == targetPosition.y) {
          return true;
        }

        return null;
      }
    };
  }

}