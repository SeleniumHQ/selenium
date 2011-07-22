// Copyright 2010 Google Inc. All Rights Reserved.
package org.openqa.selenium.support.events.internal;

import org.openqa.selenium.HasInputDevices;
import org.openqa.selenium.Mouse;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.interactions.internal.Coordinates;
import org.openqa.selenium.support.events.WebDriverEventListener;

/**
 * A mouse that fires events.
 */
public class EventFiringMouse implements Mouse {
  private final WebDriver driver;
  private final WebDriverEventListener dispatcher;
  private final Mouse mouse;

  public EventFiringMouse(WebDriver driver, WebDriverEventListener dispatcher) {
    this.driver = driver;
    this.dispatcher = dispatcher;
    this.mouse = ((HasInputDevices) this.driver).getMouse();
  }

  public void click(Coordinates where) {
    mouse.click(where);
  }

  public void doubleClick(Coordinates where) {
    mouse.doubleClick(where);
  }

  public void mouseDown(Coordinates where) {
    mouse.mouseDown(where);
  }

  public void mouseUp(Coordinates where) {
    mouse.mouseUp(where);
  }

  public void mouseMove(Coordinates where) {
    mouse.mouseMove(where);
  }

  public void mouseMove(Coordinates where, long xOffset, long yOffset) {
    mouse.mouseMove(where, xOffset, yOffset);
  }

  public void contextClick(Coordinates where) {
    mouse.contextClick(where);
  }
}
