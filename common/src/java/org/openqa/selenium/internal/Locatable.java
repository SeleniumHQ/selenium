package org.openqa.selenium.internal;

import java.awt.Point;

public interface Locatable {
  /**
   * Use this to discover where on the screen an element is so that we can click it. This method
   * should cause the element to be scrolled into view.
   *
   * @return The top lefthand corner location on the screen, or null if the element is not visible
   */
  Point getLocationOnScreenOnceScrolledIntoView();
}
