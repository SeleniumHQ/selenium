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

package org.openqa.selenium.remote.server.handler.interactions;

import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.interactions.Coordinates;
import org.openqa.selenium.interactions.PointerInput;

/**
 * Interface representing basic touch screen operations.
 *
 * @deprecated Replaced by {@link Actions} and {@link PointerInput}.
 */
@Deprecated
public interface TouchScreen {

  /**
   * Allows the execution of single tap on the screen, analogous to click using a Mouse.
   *
   * @param where The location on the screen. Typically a {@link org.openqa.selenium.WebElement}
   */
  void singleTap(Coordinates where);

  /**
   * Allows the execution of the gesture 'down' on the screen. It is typically the first of a
   * sequence of touch gestures.
   *
   * @param x The x coordinate relative to the viewport
   * @param y The y coordinate relative to the viewport
   */
  void down(int x, int y);

  /**
   * Allows the execution of the gesture 'up' on the screen. It is typically the last of a sequence
   * of touch gestures.
   *
   * @param x The x coordinate relative to the viewport
   * @param y The y coordinate relative to the viewport
   */
  void up(int x, int y);

  /**
   * Allows the execution of the gesture 'move' on the screen.
   *
   * @param x The x coordinate relative to the viewport
   * @param y The y coordinate relative to the viewport
   */
  void move(int x, int y);

  /**
   * Creates a scroll gesture that starts on a particular screen location.
   *
   * @param where the location where the scroll starts, usually a {@link org.openqa.selenium.WebElement}.
   * @param xOffset The x offset to scroll
   * @param yOffset The y offset to scroll
   */
  void scroll(Coordinates where, int xOffset, int yOffset);

  /**
   * Allows the execution of double tap on the screen, analogous to double click using a Mouse.
   *
   * @param where The coordinates of the element to double tap
   */
  void doubleTap(Coordinates where);

  /**
   * Allows the execution of long press gestures.
   *
   * @param where The coordinate of the element to long press
   */
  void longPress(Coordinates where);

  /**
   * Allows the view to be scrolled by an x and y offset.
   *
   * @param xOffset The horizontal offset relative to the viewport
   * @param yOffset The vertical offset relative to the viewport
   */
  void scroll(int xOffset, int yOffset);

  /**
   * Sends a flick gesture to the current view.
   *
   * @param xSpeed The horizontal speed in pixels/second
   * @param ySpeed The vertical speed in pixels/second
   */
  void flick(int xSpeed, int ySpeed);

  /**
   * Allows the execution of flick gestures starting in a location's element.
   *
   * @param where The coordinate of the element to flick on
   * @param xOffset The x offset relative to the viewport
   * @param yOffset The y offset relative to the viewport
   * @param speed speed in pixels/second
   */
  void flick(Coordinates where, int xOffset, int yOffset, int speed);
}
