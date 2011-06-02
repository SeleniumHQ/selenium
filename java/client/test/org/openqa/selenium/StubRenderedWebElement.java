// Copyright 2011 Google Inc. All Rights Reserved.
package org.openqa.selenium;

import org.openqa.selenium.internal.Locatable;
import org.openqa.selenium.interactions.internal.Coordinates;

/**
 * Stub rendered web element.
 */
public class StubRenderedWebElement extends StubElement implements Locatable, WebElement {

  public Point getLocationOnScreenOnceScrolledIntoView() {
    return null;
  }

  public Coordinates getCoordinates() {
    return null;
  }
}
