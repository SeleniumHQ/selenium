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
import org.openqa.selenium.interactions.Coordinates;
import org.openqa.selenium.interactions.HasTouchScreen;
import org.openqa.selenium.interactions.TouchScreen;
import org.openqa.selenium.support.events.WebDriverEventListener;

/**
 * A touch screen that fires events.
 */
public class EventFiringTouch implements TouchScreen {

  private final WebDriver driver;
  private final WebDriverEventListener dispatcher;
  private final TouchScreen touchScreen;

  public EventFiringTouch(WebDriver driver, WebDriverEventListener dispatcher) {
    this.driver = driver;
    this.dispatcher = dispatcher;
    this.touchScreen = ((HasTouchScreen) this.driver).getTouch();
  }

  @Override
  public void singleTap(Coordinates where) {
    touchScreen.singleTap(where);
  }

  @Override
  public void down(int x, int y) {
    touchScreen.down(x, y);
  }

  @Override
  public void up(int x, int y) {
    touchScreen.up(x, y);
  }

  @Override
  public void move(int x, int y) {
    touchScreen.move(x, y);
  }

  @Override
  public void scroll(Coordinates where, int xOffset, int yOffset) {
    touchScreen.scroll(where, xOffset, yOffset);
  }

  @Override
  public void doubleTap(Coordinates where) {
    touchScreen.doubleTap(where);
  }

  @Override
  public void longPress(Coordinates where) {
    touchScreen.longPress(where);
  }

  @Override
  public void scroll(int xOffset, int yOffset) {
    touchScreen.scroll(xOffset, yOffset);
  }

  @Override
  public void flick(int xSpeed, int ySpeed) {
    touchScreen.flick(xSpeed, ySpeed);
  }

  @Override
  public void flick(Coordinates where, int xOffset, int yOffset, int speed) {
    touchScreen.flick(where, xOffset, yOffset, speed);
  }
}
