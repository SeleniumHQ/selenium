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

import org.openqa.selenium.RenderedWebElement;

import java.awt.*;

public class RenderedHtmlUnitDriverWebElement extends HtmlUnitWebElement
    implements RenderedWebElement {

  public RenderedHtmlUnitDriverWebElement(HtmlUnitDriver parent, HtmlElement element) {
    super(parent, element);
  }

  public void sendKeys(CharSequence... value) {
    if (!isDisplayed())
      throw new UnsupportedOperationException("You may only sendKeys to visible elements");
    
    super.sendKeys(value);
  }

  public boolean toggle() {
    if (!isDisplayed())
          throw new UnsupportedOperationException("You may only toggle visible elements");

    return super.toggle();
  }

  public void click() {
    if (!isDisplayed())
          throw new UnsupportedOperationException("You may only click visible elements");

    super.click();
  }

  public void setSelected() {
    if (!isDisplayed())
          throw new UnsupportedOperationException("You may only select visible elements");

    super.setSelected();
  }

  public boolean isDisplayed() {
    boolean isDisplayed = true;

    HtmlElement underlyingElement = element;

    do {
      HtmlUnitWebElement curr = new HtmlUnitWebElement(parent, underlyingElement);
      String display = (String) parent.executeScript("return arguments[0].currentStyle.display", curr);
      String visible = (String) parent.executeScript("return arguments[0].currentStyle.visibility", curr);

      isDisplayed = !"none".equals(display) && !"hidden".equals(visible);

      if (underlyingElement.getParentNode() instanceof HtmlElement)
        underlyingElement = (HtmlElement) underlyingElement.getParentNode();
      else
        underlyingElement = null;
    } while (underlyingElement != null && isDisplayed && !"body".equals(underlyingElement.getTagName()));

  return isDisplayed;
  }

  public Point getLocation() {
    throw new UnsupportedOperationException("getLocation");
  }

  public Dimension getSize() {
    throw new UnsupportedOperationException("getSize");
  }

  public void dragAndDropBy(int moveRightBy, int moveDownBy) {
    throw new UnsupportedOperationException("dragAndDropBy");
  }

  public void dragAndDropOn(RenderedWebElement element) {
    throw new UnsupportedOperationException("dragAndDropOn");
  }

  public String getValueOfCssProperty(String propertyName) {
    return (String) parent.executeScript("var p = arguments[0].currentStyle[arguments[1]]; return p ? p.toString : undefined;", this, propertyName);   
  }
}
