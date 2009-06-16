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

  public Point getLocation() {
    assertElementNotStale();
    throw new UnsupportedOperationException("getLocation");
  }

  public Dimension getSize() {
    assertElementNotStale();
    throw new UnsupportedOperationException("getSize");
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
