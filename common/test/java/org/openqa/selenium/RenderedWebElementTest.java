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

import static org.openqa.selenium.Ignore.Driver.HTMLUNIT;
import static org.openqa.selenium.Ignore.Driver.IPHONE;

import java.lang.reflect.Method;
import java.lang.reflect.Modifier;

public class RenderedWebElementTest extends AbstractDriverTestCase {

  @JavascriptEnabled
  @Ignore(HTMLUNIT)
  public void testShouldPickUpStyleOfAnElement() {
    driver.get(javascriptPage);

    RenderedWebElement element = (RenderedWebElement) driver.findElement(By.id("green-parent"));
    String backgroundColour = element.getValueOfCssProperty("background-color");

    assertEquals("#008000", backgroundColour);

    element = (RenderedWebElement) driver.findElement(By.id("red-item"));
    backgroundColour = element.getValueOfCssProperty("background-color");

    assertEquals("#ff0000", backgroundColour);
  }

  @JavascriptEnabled
  @Ignore(HTMLUNIT)
  public void testShouldAllowInheritedStylesToBeUsed() {
    driver.get(javascriptPage);

    RenderedWebElement element = (RenderedWebElement) driver.findElement(By.id("green-item"));
    String backgroundColour = element.getValueOfCssProperty("background-color");

    assertEquals("transparent", backgroundColour);
  }

  @JavascriptEnabled
  @Ignore({HTMLUNIT, IPHONE})
  public void testShouldAllowUsersToHoverOverElements() {
    driver.get(javascriptPage);

    RenderedWebElement element = (RenderedWebElement) driver.findElement(By.id("menu1"));
    if (!hasHover(element)) {
      System.out.println("Skipping hover test: no hover method");
      return;
    }
    if (!Platform.getCurrent().is(Platform.WINDOWS)) {
      System.out.println("Skipping hover test: needs native events");
      return;
    }


    RenderedWebElement item = (RenderedWebElement) driver.findElement(By.id("item1"));
    assertEquals("", item.getText());


    ((JavascriptExecutor) driver).executeScript("arguments[0].style.background = 'green'", element);
    callHoverOn(element);

    assertEquals("Item 1", item.getText());
  }

  @JavascriptEnabled
  @Ignore
  public void testCanClickOnSuckerFishMenuItem() throws Exception {

    driver.get(javascriptPage);

    RenderedWebElement element = (RenderedWebElement) driver.findElement(By.id("menu1"));
    if (!hasHover(element)) {
      System.out.println("Skipping hover test: no hover method");
      return;
    }
    if (!Platform.getCurrent().is(Platform.WINDOWS)) {
      System.out.println("Skipping hover test: needs native events");
      return;
    }

    callHoverOn(element);

    RenderedWebElement target = (RenderedWebElement) driver.findElement(By.id("item1"));
    assertTrue(target.isDisplayed());
    target.click();

    String text = driver.findElement(By.id("result")).getText();
    assertTrue(text.contains("item 1"));
  }

  private boolean hasHover(RenderedWebElement element) {
    try {
      Method hoverMethod = element.getClass().getMethod("hover");
      return Modifier.isPublic(hoverMethod.getModifiers());
    } catch (NoSuchMethodException e) {
      // fine
    }
    return false;
  }

  private void callHoverOn(RenderedWebElement element) {
    try {
      Method hoverMethod = element.getClass().getMethod("hover");
      hoverMethod.invoke(element);
    } catch (Exception e) {
      fail("Cannot call hover method");
    }
  }
}
