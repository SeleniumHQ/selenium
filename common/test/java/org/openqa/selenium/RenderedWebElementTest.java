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
import static org.junit.Assert.assertTrue;
import static org.openqa.selenium.Ignore.Driver.CHROME;
import static org.openqa.selenium.Ignore.Driver.HTMLUNIT;
import static org.openqa.selenium.Ignore.Driver.IE;
import static org.openqa.selenium.Ignore.Driver.IPHONE;
import static org.openqa.selenium.Ignore.Driver.SELENESE;

import java.awt.Dimension;
import java.awt.Point;

public class RenderedWebElementTest extends AbstractDriverTestCase {

  @JavascriptEnabled
  @Ignore({SELENESE, IPHONE})
  public void testShouldPickUpStyleOfAnElement() {
    driver.get(pages.javascriptPage);

    RenderedWebElement element = (RenderedWebElement) driver.findElement(By.id("green-parent"));
    String backgroundColour = element.getValueOfCssProperty("background-color");

    assertEquals("#008000", backgroundColour);

    element = (RenderedWebElement) driver.findElement(By.id("red-item"));
    backgroundColour = element.getValueOfCssProperty("background-color");

    assertEquals("#ff0000", backgroundColour);
  }

  @JavascriptEnabled
  @Ignore({IE, CHROME, SELENESE, IPHONE})
  //Reason for Chrome: WebKit bug 28804
  public void testShouldHandleNonIntegerPositionAndSize() {
    driver.get(pages.rectanglesPage);

    RenderedWebElement r2 = (RenderedWebElement) driver.findElement(By.id("r2"));
    String left = r2.getValueOfCssProperty("left");
    assertTrue("left (\"" + left + "\") should start with \"10.9\".", left.startsWith("10.9"));
    String top = r2.getValueOfCssProperty("top");
    assertTrue("top (\"" + top + "\") should start with \"10.1\".", top.startsWith("10.1"));
    assertEquals(new Point(11, 10), r2.getLocation());
    String width = r2.getValueOfCssProperty("width");
    assertTrue("width (\"" + left + "\") should start with \"48.6\".", width.startsWith("48.6"));
    String height = r2.getValueOfCssProperty("height");
    assertTrue("height (\"" + left + "\") should start with \"49.3\".", height.startsWith("49.3"));
    assertEquals(r2.getSize(), new Dimension(49, 49));
  }

  @JavascriptEnabled
  @Ignore({SELENESE, IPHONE})
  public void testShouldAllowInheritedStylesToBeUsed() {
    driver.get(pages.javascriptPage);

    RenderedWebElement element = (RenderedWebElement) driver.findElement(By.id("green-item"));
    String backgroundColour = element.getValueOfCssProperty("background-color");

    assertEquals("transparent", backgroundColour);
  }

  @JavascriptEnabled
  @Ignore({IPHONE, CHROME, SELENESE, HTMLUNIT})
  public void testShouldAllowUsersToHoverOverElements() {
    driver.get(pages.javascriptPage);

    RenderedWebElement element = (RenderedWebElement) driver.findElement(By.id("menu1"));
    if (!Platform.getCurrent().is(Platform.WINDOWS)) {
      System.out.println("Skipping hover test: needs native events");
      return;
    }

    RenderedWebElement item = (RenderedWebElement) driver.findElement(By.id("item1"));
    assertEquals("", item.getText());

    ((JavascriptExecutor) driver).executeScript("arguments[0].style.background = 'green'", element);
    element.hover();

    assertEquals("Item 1", item.getText());
  }

  @JavascriptEnabled
  @Ignore(SELENESE)
  public void testShouldCorrectlyIdentifyThatAnElementHasWidth() {
    driver.get(pages.xhtmlTestPage);

    RenderedWebElement shrinko = (RenderedWebElement) driver.findElement(By.id("linkId"));
    Dimension size = shrinko.getSize();
    assertTrue("Width expected to be greater than 0", size.width > 0);
    assertTrue("Height expected to be greater than 0", size.height > 0);
  }

  @JavascriptEnabled
  @Ignore
  public void testCanClickOnSuckerFishMenuItem() throws Exception {
    driver.get(pages.javascriptPage);

    RenderedWebElement element = (RenderedWebElement) driver.findElement(By.id("menu1"));
    if (!Platform.getCurrent().is(Platform.WINDOWS)) {
      System.out.println("Skipping hover test: needs native events");
      return;
    }

    element.hover();

    RenderedWebElement target = (RenderedWebElement) driver.findElement(By.id("item1"));
    assertTrue(target.isDisplayed());
    target.click();

    String text = driver.findElement(By.id("result")).getText();
    assertTrue(text.contains("item 1"));
  }
}
