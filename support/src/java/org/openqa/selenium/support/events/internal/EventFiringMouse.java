// Copyright 2010 Google Inc. All Rights Reserved.
package org.openqa.selenium.support.events.internal;

import org.openqa.selenium.HasInputDevices;
import org.openqa.selenium.Mouse;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.internal.WrapsElement;
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

  private WebElement getWrappedElement(WebElement proxyElement) {
    WebElement originalElement = proxyElement;
    while (originalElement instanceof WrapsElement) {
      originalElement = ((WrapsElement) originalElement).getWrappedElement();
    }

    return originalElement;
  }

  public void click(WebElement onElement) {
    WebElement unwrappedElement = getWrappedElement(onElement);
    dispatcher.beforeClickOn(unwrappedElement, driver);
    mouse.click(unwrappedElement);
    dispatcher.afterClickOn(unwrappedElement, driver);
  }

  public void doubleClick(WebElement onElement) {
    mouse.doubleClick(getWrappedElement(onElement));
  }

  public void mouseDown(WebElement onElement) {
    mouse.mouseDown(getWrappedElement(onElement));
  }

  public void mouseUp(WebElement onElement) {
    mouse.mouseUp(getWrappedElement(onElement));
  }

  public void mouseMove(WebElement toElement) {
    mouse.mouseMove(getWrappedElement(toElement));
  }

  public void mouseMove(WebElement toElement, long xOffset, long yOffset) {
    mouse.mouseMove(getWrappedElement(toElement), xOffset, yOffset);
  }

  public void contextClick(WebElement onElement) {
    mouse.contextClick(getWrappedElement(onElement));
  }
}
