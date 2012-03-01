/*
Copyright 2011 WebDriver committers
Copyright 2011 Software Freedom Conservancy.

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

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.greaterThan;
import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.is;
import static org.junit.Assert.assertEquals;
import static org.openqa.selenium.testing.Ignore.Driver.ANDROID;
import static org.openqa.selenium.testing.Ignore.Driver.CHROME;
import static org.openqa.selenium.testing.Ignore.Driver.HTMLUNIT;
import static org.openqa.selenium.testing.Ignore.Driver.IE;
import static org.openqa.selenium.testing.Ignore.Driver.IPHONE;
import static org.openqa.selenium.testing.Ignore.Driver.OPERA;
import static org.openqa.selenium.testing.Ignore.Driver.SELENESE;

@Ignore(value = {ANDROID, CHROME, HTMLUNIT, IPHONE, OPERA, SELENESE},
        reason = "Not yet implemented.")
public class WindowTest extends JUnit4TestBase {

  @Test
  public void testGetsTheSizeOfTheCurrentWindow() {
    Dimension size = driver.manage().window().getSize();

    assertThat(size.width, is(greaterThan(0)));
    assertThat(size.height, is(greaterThan(0)));
  }

  @Test
  public void testSetsTheSizeOfTheCurrentWindow() {
    WebDriver.Window window = driver.manage().window();
    Dimension size = window.getSize();

    // resize relative to the initial size, since we don't know what it is
    Dimension targetSize = new Dimension(size.width - 20, size.height - 20);
    window.setSize(targetSize);

    Dimension newSize = window.getSize();
    assertEquals(targetSize.width, newSize.width);
    assertEquals(targetSize.height, newSize.height);
  }

  @Ignore(IE)
  @Test
  public void testGetsThePositionOfTheCurrentWindow() {
    Point position = driver.manage().window().getPosition();

    assertThat(position.x, is(greaterThanOrEqualTo(0)));
    assertThat(position.y, is(greaterThanOrEqualTo(0)));
  }

  @Test
  public void testSetsThePositionOfTheCurrentWindow() {
    WebDriver.Window window = driver.manage().window();
    Point position = window.getPosition();

    Point targetPosition = new Point(position.x + 10, position.y + 10);
    window.setPosition(targetPosition);

    Point newLocation = window.getPosition();

    assertEquals(targetPosition.x, newLocation.x);
    assertEquals(targetPosition.y, newLocation.y);
  }

}
