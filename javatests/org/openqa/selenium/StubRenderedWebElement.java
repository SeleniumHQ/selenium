// Copyright 2011 Google Inc. All Rights Reserved.
package org.openqa.selenium;

import org.openqa.selenium.internal.Locatable;
import org.openqa.selenium.interactions.internal.Coordinates;

/**
 * Stub rendered web element.
 */
public class StubRenderedWebElement extends StubElement implements RenderedWebElement, Locatable {

  public Point getLocationOnScreenOnceScrolledIntoView() {
    return null;
  }

  public Coordinates getCoordinates() {
    return null;
  }

  public boolean isDisplayed() {
    return false;
  }

  public Point getLocation() {
    return null;
  }

  public Dimension getSize() {
    return null;
  }

  public void hover() { }

  public void dragAndDropBy(int moveRightBy, int moveDownBy) { }

  public void dragAndDropOn(RenderedWebElement element) { }

  public String getValueOfCssProperty(String propertyName) {
    return null;
  }
}
