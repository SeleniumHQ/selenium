// Copyright 2011 Google Inc. All Rights Reserved.
package org.openqa.selenium.interactions.internal;

import org.openqa.selenium.Point;

/**
 * Provides coordinates of an element for advanced interactions.
 * Note that some coordinates (such as screen coordinates) are evaluated lazily
 * since the element may have to be scrolled into view.
 */
public interface Coordinates {
  Point getLocationOnScreen();
  Point getLocationInViewPort();
  Point getLocationInDOM();

  Object getAuxiliry();
}
