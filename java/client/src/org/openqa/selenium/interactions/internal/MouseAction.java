// Copyright 2011 Google Inc. All Rights Reserved.
package org.openqa.selenium.interactions.internal;

import org.openqa.selenium.Mouse;
import org.openqa.selenium.internal.Locatable;

/**
 * Base class for all mouse-related actions.
 */
public class MouseAction extends BaseAction {
  protected final Mouse mouse;

  protected MouseAction(Mouse mouse, Locatable locationProvider) {
    super(locationProvider);
    this.mouse = mouse;
  }

  protected Coordinates getActionLocation() {
    if (where == null) {
      return null;
    }

    return where.getCoordinates();
  }

  protected void moveToLocation() {
    // Only call mouseMove if an actual location was provided. If not,
    // the action will happen in the last known location of the mouse
    // cursor.
    if (getActionLocation() != null) {
      mouse.mouseMove(getActionLocation());
    }
  }
}
