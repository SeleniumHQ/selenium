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

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.interactions.HasInputDevices;
import org.openqa.selenium.interactions.Mouse;
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
