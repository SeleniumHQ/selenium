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

// Copyright 2008 Google Inc.  All Rights Reserved.

package org.openqa.selenium.htmlunit;

import com.gargoylesoftware.htmlunit.html.HtmlElement;
import com.gargoylesoftware.htmlunit.html.HtmlInput;
import com.gargoylesoftware.htmlunit.html.StyledElement;
import com.gargoylesoftware.htmlunit.html.HtmlHiddenInput;

import org.openqa.selenium.RenderedWebElement;
import org.openqa.selenium.ElementNotVisibleException;
import org.openqa.selenium.WebDriverException;

import java.awt.*;

import net.sourceforge.htmlunit.corejs.javascript.Undefined;

public class RenderedHtmlUnitDriverWebElement extends HtmlUnitWebElement
    implements RenderedWebElement {

  public RenderedHtmlUnitDriverWebElement(HtmlUnitDriver parent, HtmlElement element) {
    super(parent, element);
  }

  @Override
  public void sendKeys(CharSequence... value) {
    assertElementNotStale();

    if (!isDisplayed())
      throw new ElementNotVisibleException("You may only sendKeys to visible elements");

    super.sendKeys(value);
  }

  @Override
  public boolean toggle() {
    assertElementNotStale();

    if (!isDisplayed())
          throw new ElementNotVisibleException("You may only toggle visible elements");

    return super.toggle();
  }

  @Override
  public void click() {
    assertElementNotStale();

    if (!isDisplayed())
          throw new ElementNotVisibleException("You may only click visible elements");

    super.click();
  }

  @Override
  public void setSelected() {
    assertElementNotStale();

    if (!isDisplayed())
          throw new ElementNotVisibleException("You may only select visible elements");

    super.setSelected();
  }

  public boolean isDisplayed() {
    assertElementNotStale();

    return !(element instanceof HtmlHiddenInput) && element.isDisplayed();
  }

  public void hover() {
    throw new UnsupportedOperationException("Hover is not supported by the htmlunit driver");
  }

  public Point getLocation() {
    assertElementNotStale();

    // Try the bounding client rect first.
    String script = "var e = arguments[0]; "
                    + "if (e.getBoundingClientRect instanceof Function) {"
                    + "var r = e.getBoundingClientRect();"
                    + "return r.left + ',' + r.top;"
                    + "} return undefined;";
    String result = (String) parent.executeScript(script, element);
    if (result == null) {
      // fall back to returning some value
      // TODO(simon): This is wrong, but better something than nothing
      result = (String) parent.executeScript(
        "var w = arguments[0].offsetLeft; var h = arguments[0].offsetTop; return w + ',' + h;",
        element);
    }

    try {
      String[] sizes = result.split(",", 2);
      return new Point(Integer.parseInt(sizes[0]), Integer.parseInt(sizes[1]));
    } catch (Exception e) {
      throw new WebDriverException("Cannot determine size of element from: " + result);
    }
  }

  public Dimension getSize() {
    assertElementNotStale();

    // Try the bounding client rect first.
    String script = "var e = arguments[0]; "
                    + "if (e.getBoundingClientRect instanceof Function) {"
                    + "var r = e.getBoundingClientRect();"
                    + "var w = r.left - r.right; var h = r.top - r.bottom;"
                    + "return w + ',' + h;"
                    + "} return undefined;";
    String result = (String) parent.executeScript(script, element);
    if (result == null) {
      // fall back to returning some value
      // TODO(simon): This is probably very lame.
      result = (String) parent.executeScript(
        "var w = arguments[0].scrollWidth; var h = arguments[0].scrollHeight; return w + ',' + h;",
        element);
    }

    try {
      String[] sizes = result.split(",", 2);
      return new Dimension(Integer.parseInt(sizes[0]), Integer.parseInt(sizes[1]));
    } catch (Exception e) {
      throw new WebDriverException("Cannot determine size of element from: " + result);
    }
  }

  public void dragAndDropBy(int moveRightBy, int moveDownBy) {
    assertElementNotStale();
    throw new UnsupportedOperationException("dragAndDropBy");
  }

  public void dragAndDropOn(RenderedWebElement element) {
    assertElementNotStale();
    throw new UnsupportedOperationException("dragAndDropOn");
  }

  public String getValueOfCssProperty(String propertyName) {
    assertElementNotStale();

    return getEffectiveStyle(element, propertyName);
  }

  private String getEffectiveStyle(HtmlElement htmlElement, String propertyName) {
    if (!(htmlElement instanceof StyledElement)) {
      return "";
    }

    HtmlElement current = htmlElement;
    String value = "inherit";
    while (current instanceof StyledElement && "inherit".equals(value)) {
      // Hat-tip to the Selenium team
      Object result = parent.executeScript(
          "if (window.getComputedStyle) { " +
          "    return window.getComputedStyle(arguments[0], null)[arguments[1]]; " +
          "} " +
          "if (arguments[0].currentStyle) { " +
          "    return arguments[0].currentStyle[arguments[1]]; " +
          "} " +
          "if (window.document.defaultView && window.document.defaultView.getComputedStyle) { " +
          "    return window.document.defaultView.getComputedStyle(arguments[0], null)[arguments[1]]; "
          +
          "} ",
          current, propertyName
      );

      if (!(result instanceof Undefined)) {
        value = String.valueOf(result);
      }

      current = (HtmlElement) current.getParentNode();
    }

    return value;
  }
}
