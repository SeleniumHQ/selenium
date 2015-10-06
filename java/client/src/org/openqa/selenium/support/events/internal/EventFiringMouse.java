// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.


package org.openqa.selenium.support.events.internal;

import java.lang.reflect.Proxy;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.interactions.HasInputDevices;
import org.openqa.selenium.interactions.Mouse;
import org.openqa.selenium.interactions.internal.Coordinates;
import org.openqa.selenium.support.events.EventFiringInvocationHandler;
import org.openqa.selenium.support.events.listeners.MouseEventListener;

/**
 * A mouse that fires events.
 */
public class EventFiringMouse implements Mouse {
  private final WebDriver driver;
  private final MouseEventListener dispatcher;
  private final Mouse mouse;

  public EventFiringMouse(WebDriver driver, MouseEventListener dispatcher) {
    this.driver = driver;
    this.dispatcher = dispatcher;
    this.mouse = (Mouse) Proxy.newProxyInstance(Mouse.class.getClassLoader(),
        new Class[] { Mouse.class }, new EventFiringInvocationHandler(
            dispatcher, driver, ((HasInputDevices) this.driver).getMouse()));
  }

  public void click(Coordinates where) {
    dispatcher.beforeClick(driver, where);
    mouse.click(where);
    dispatcher.afterClick(driver, where);
  }

  public void doubleClick(Coordinates where) {
    dispatcher.beforeDoubleClick(driver, where);
    mouse.doubleClick(where);
    dispatcher.afterDoubleClick(driver, where);
  }

  public void mouseDown(Coordinates where) {
    dispatcher.beforeMouseIsMoved(driver, where, 0, 0);
    mouse.mouseDown(where);
    dispatcher.afterMouseIsMoved(driver, where, 0, 0);
  }

  public void mouseUp(Coordinates where) {
    dispatcher.beforeMouseIsMoved(driver, where, 0, 0);
    mouse.mouseUp(where);
    dispatcher.afterMouseIsMoved(driver, where, 0, 0);
  }

  public void mouseMove(Coordinates where) {
    dispatcher.beforeMouseIsMoved(driver, where, 0, 0);
    mouse.mouseMove(where);
    dispatcher.afterMouseIsMoved(driver, where, 0, 0);
  }

  public void mouseMove(Coordinates where, long xOffset, long yOffset) {
    dispatcher.beforeMouseIsMoved(driver, where, xOffset, yOffset);
    mouse.mouseMove(where, xOffset, yOffset);
    dispatcher.afterMouseIsMoved(driver, where, xOffset, yOffset);
  }

  public void contextClick(Coordinates where) {
    dispatcher.beforeContextClick(driver, where);
    mouse.contextClick(where);
    dispatcher.afterContextClick(driver, where);
  }
}
