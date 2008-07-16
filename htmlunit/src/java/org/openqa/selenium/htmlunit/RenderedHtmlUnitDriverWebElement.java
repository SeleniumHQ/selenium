// Copyright 2008 Google Inc.  All Rights Reserved.

package org.openqa.selenium.htmlunit;

import com.gargoylesoftware.htmlunit.html.HtmlElement;

import org.openqa.selenium.RenderedWebElement;

import java.awt.Dimension;
import java.awt.Point;

public class RenderedHtmlUnitDriverWebElement extends HtmlUnitWebElement
    implements RenderedWebElement {

  public RenderedHtmlUnitDriverWebElement(HtmlUnitDriver parent, HtmlElement element) {
    super(parent, element);
  }

  public boolean isDisplayed() {
    return false;
  }

  public Point getLocation() {
    return null;  //To change body of implemented methods use File | Settings | File Templates.
  }

  public Dimension getSize() {
    return null;  //To change body of implemented methods use File | Settings | File Templates.
  }

  public void dragAndDropBy(int moveRightBy, int moveDownBy) {
//To change body of implemented methods use File | Settings | File Templates.
  }

  public void dragAndDropOn(RenderedWebElement element) {
//To change body of implemented methods use File | Settings | File Templates.
  }

  public String getValueOfCssProperty(String propertyName) {
    return null;  //To change body of implemented methods use File | Settings | File Templates.
  }
}
