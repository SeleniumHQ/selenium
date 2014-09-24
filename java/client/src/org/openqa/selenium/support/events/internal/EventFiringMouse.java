/*
Copyright 2012 Selenium committers
Copyright 2012 Software Freedom Conservancy

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


package org.openqa.selenium.support.events.internal;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.interactions.HasInputDevices;
import org.openqa.selenium.interactions.Mouse;
import org.openqa.selenium.interactions.internal.Coordinates;
import org.openqa.selenium.support.events.WebDriverEventListener;
import org.openqa.selenium.support.events.WebDriverInputDeviceEventListener;

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

  private WebDriverInputDeviceEventListener getMouseEventListener() {
      if (dispatcher instanceof WebDriverInputDeviceEventListener) {
          return (WebDriverInputDeviceEventListener) dispatcher;
      }
      return null;
  }

  public void click(Coordinates where) {
    WebDriverInputDeviceEventListener listener = getMouseEventListener();
    if (listener == null ) {
        mouse.click(where);
        return;
    }
    listener.beforeClick(where);
    mouse.click(where);
    listener.afterClick(where);
  }

  public void doubleClick(Coordinates where) {
    WebDriverInputDeviceEventListener listener = getMouseEventListener();
    if (listener == null ) {
        mouse.doubleClick(where);
        return;
    }
    listener.beforeDoubleClick(where);
    mouse.doubleClick(where);
    listener.afterDoubleClick(where);
  }

  public void mouseDown(Coordinates where) {
    WebDriverInputDeviceEventListener listener = getMouseEventListener();
    if (listener == null ) {
        mouse.mouseDown(where);
        return;
    }
    listener.beforeMouseDown(where);
    mouse.mouseDown(where);
    listener.afterMouseDown(where);
  }

  public void mouseUp(Coordinates where) {
    WebDriverInputDeviceEventListener listener = getMouseEventListener();
    if (listener == null ) {
        mouse.mouseUp(where);
        return;
    }
    listener.beforeMouseUp(where);
    mouse.mouseUp(where);
    listener.afterMouseUp(where);
  }

  public void mouseMove(Coordinates where) {
    WebDriverInputDeviceEventListener listener = getMouseEventListener();
    if ( listener == null ) {
        mouse.mouseMove(where);
        return;
    }
    listener.beforeMouseMove(where);
    mouse.mouseMove(where);
    listener.afterMouseMove(where);
  }

  public void mouseMove(Coordinates where, long xOffset, long yOffset) {
    WebDriverInputDeviceEventListener listener = getMouseEventListener();
    if (listener == null ) {
        mouse.mouseMove(where, xOffset, yOffset);
        return;
    }
    listener.beforeMouseMove(where, xOffset, yOffset);
    mouse.mouseMove(where, xOffset, yOffset);
    listener.afterMouseMove(where, xOffset, yOffset);
  }

  public void contextClick(Coordinates where) {
    WebDriverInputDeviceEventListener listener = getMouseEventListener();
    if ( listener == null ) {
        mouse.contextClick(where);
        return;
    }
    listener.beforeContextClick(where);
    mouse.contextClick(where);
    listener.afterContextClick(where);
  }
}
