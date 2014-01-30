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
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JUnit4TestBase;
import org.openqa.selenium.testing.JavascriptEnabled;

import static org.hamcrest.Matchers.anyOf;
import static org.hamcrest.Matchers.equalTo;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertThat;
import static org.openqa.selenium.testing.Ignore.Driver.ANDROID;
import static org.openqa.selenium.testing.Ignore.Driver.HTMLUNIT;
import static org.openqa.selenium.testing.Ignore.Driver.IPHONE;
import static org.openqa.selenium.testing.Ignore.Driver.MARIONETTE;
import static org.openqa.selenium.testing.Ignore.Driver.OPERA;

public class CssValueTest extends JUnit4TestBase {

  @JavascriptEnabled
  @Ignore({ANDROID, HTMLUNIT, OPERA, MARIONETTE})
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
  @Ignore({ANDROID, HTMLUNIT, OPERA, MARIONETTE})
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

  @JavascriptEnabled
  @Ignore({ANDROID, IPHONE, OPERA, HTMLUNIT, MARIONETTE})
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

}
