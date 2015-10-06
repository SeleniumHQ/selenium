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
import org.openqa.selenium.interactions.HasTouchScreen;
import org.openqa.selenium.interactions.TouchScreen;
import org.openqa.selenium.interactions.internal.Coordinates;
import org.openqa.selenium.support.events.EventFiringInvocationHandler;
import org.openqa.selenium.support.events.listeners.TouchEventLitener;

/**
 * A touch screen that fires events.
 */
public class EventFiringTouch implements TouchScreen {

  private final WebDriver driver;
  private final TouchEventLitener dispatcher;
  private final TouchScreen touchScreen;

  public EventFiringTouch(WebDriver driver, TouchEventLitener dispatcher) {
    this.driver = driver;
    this.dispatcher = dispatcher;
    this.touchScreen = (TouchScreen) Proxy.newProxyInstance(TouchScreen.class
        .getClassLoader(), new Class[] { TouchScreen.class },
        new EventFiringInvocationHandler(dispatcher, driver,
            ((HasTouchScreen) this.driver).getTouch()));
  }

  public void singleTap(Coordinates where) {
    dispatcher.beforeSingleTap(driver, where);
    touchScreen.singleTap(where);
    dispatcher.afterSingleTap(driver, where);
  }

  public void down(int x, int y) {
    dispatcher.beforeMovingTo(driver, x, y);
    touchScreen.down(x, y);
    dispatcher.afterMovingTo(driver, x, y);
  }

  public void up(int x, int y) {
    dispatcher.beforeMovingTo(driver, x, y);
    touchScreen.up(x, y);
    dispatcher.afterMovingTo(driver, x, y);
  }

  public void move(int x, int y) {
    dispatcher.beforeMovingTo(driver, x, y);
    touchScreen.move(x, y);
    dispatcher.afterMovingTo(driver, x, y);
  }

  public void scroll(Coordinates where, int xOffset, int yOffset) {
    dispatcher.beforeScroll(driver, where, xOffset, yOffset);
    touchScreen.scroll(where, xOffset, yOffset);
    dispatcher.afterScroll(driver, where, xOffset, yOffset);
  }

  public void doubleTap(Coordinates where) {
    dispatcher.beforeDoubleTap(driver, where);
    touchScreen.doubleTap(where);
    dispatcher.afterDoubleTap(driver, where);
  }

  public void longPress(Coordinates where) {
    dispatcher.beforeLongPress(driver, where);
    touchScreen.longPress(where);
    dispatcher.afterLongPress(driver, where);
  }

  public void scroll(int xOffset, int yOffset) {
    dispatcher.beforeScroll(driver, null, xOffset, yOffset);
    touchScreen.scroll(xOffset, yOffset);
    dispatcher.afterScroll(driver, null, xOffset, yOffset);
  }

  public void flick(int xSpeed, int ySpeed) {
    dispatcher.beforeFlick(driver, null, 0, 0, xSpeed, ySpeed, 0);
    touchScreen.flick(xSpeed, ySpeed);
    dispatcher.afterFlick(driver, null, 0, 0, xSpeed, ySpeed, 0);
  }

  public void flick(Coordinates where, int xOffset, int yOffset, int speed) {
    dispatcher.beforeFlick(driver, where, xOffset, yOffset, 0, 0, speed);
    touchScreen.flick(where, xOffset, yOffset, speed);
    dispatcher.afterFlick(driver, where, xOffset, yOffset, 0, 0, speed);
  }
}
