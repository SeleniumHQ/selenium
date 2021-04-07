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

package org.openqa.selenium.interactions.touch;

import static org.openqa.selenium.interactions.PointerInput.Kind.TOUCH;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.interactions.HasTouchScreen;
import org.openqa.selenium.interactions.Locatable;
import org.openqa.selenium.interactions.PointerInput;
import org.openqa.selenium.interactions.TouchScreen;

/**
 * Implements actions for touch enabled devices, reusing the available composite and builder design
 * patterns from Actions.
 */
public class TouchActions extends Actions {

  private final PointerInput touchPointer = new PointerInput(TOUCH, "touch screen");
  protected TouchScreen touchScreen;

  public TouchActions(WebDriver driver) {
    super(driver);
    if (driver instanceof HasTouchScreen) {
      this.touchScreen = ((HasTouchScreen) driver).getTouch();
    } else {
      this.touchScreen = null;
    }
  }

  /**
   * Allows the execution of single tap on the screen, analogous to click using a Mouse.
   *
   * @param onElement the {@link WebElement} on the screen.
   * @return self
   */
  public TouchActions singleTap(WebElement onElement) {
    if (touchScreen != null) {
      action.addAction(new SingleTapAction(touchScreen, (Locatable) onElement));
    }
    tick(touchPointer.createPointerDown(0));
    tick(touchPointer.createPointerUp(0));
    return this;
  }

  /**
   * Allows the execution of the gesture 'down' on the screen. It is typically the first of a
   * sequence of touch gestures.
   *
   * @param x The x coordinate relative to the viewport
   * @param y The y coordinate relative to the viewport
   * @return self
   */
  public TouchActions down(int x, int y) {
    if (touchScreen != null) {
      action.addAction(new DownAction(touchScreen, x, y));
    }
    return this;
  }

  /**
   * Allows the execution of the gesture 'up' on the screen. It is typically the last of a sequence
   * of touch gestures.
   *
   * @param x The x coordinate relative to the viewport
   * @param y The y coordinate relative to the viewport
   * @return self
   */
  public TouchActions up(int x, int y) {
    if (touchScreen != null) {
      action.addAction(new UpAction(touchScreen, x, y));
    }
    return this;
  }

  /**
   * Allows the execution of the gesture 'move' on the screen.
   *
   * @param x The x coordinate relative to the viewport
   * @param y The y coordinate relative to the viewport
   * @return self
   */
  public TouchActions move(int x, int y) {
    if (touchScreen != null) {
      action.addAction(new MoveAction(touchScreen, x, y));
    }
    return this;
  }

  /**
   * Creates a scroll gesture that starts on a particular screen location.
   *
   * @param onElement the {@link WebElement} where the scroll starts.
   * @param xOffset   The x offset to scroll
   * @param yOffset   The y offset to scroll
   * @return self
   */
  public TouchActions scroll(WebElement onElement, int xOffset, int yOffset) {
    if (touchScreen != null) {
      action.addAction(new ScrollAction(touchScreen, (Locatable) onElement, xOffset, yOffset));
    }
    return this;
  }

  /**
   * Allows the execution of double tap on the screen, analogous to double click using a Mouse.
   *
   * @param onElement The {@link WebElement} to double tap
   * @return self
   */

  public TouchActions doubleTap(WebElement onElement) {
    if (touchScreen != null) {
      action.addAction(new DoubleTapAction(touchScreen, (Locatable) onElement));
    }
    return this;
  }

  /**
   * Allows the execution of long press gestures.
   *
   * @param onElement The {@link WebElement} to long press
   * @return self
   */

  public TouchActions longPress(WebElement onElement) {
    if (touchScreen != null) {
      action.addAction(new LongPressAction(touchScreen, (Locatable) onElement));
    }
    return this;
  }

  /**
   * Allows the view to be scrolled by an x and y offset.
   *
   * @param xOffset The horizontal offset relative to the viewport
   * @param yOffset The vertical offset relative to the viewport
   * @return self
   */

  public TouchActions scroll(int xOffset, int yOffset) {
    if (touchScreen != null) {
      action.addAction(new ScrollAction(touchScreen, xOffset, yOffset));
    }
    return this;
  }

  /**
   * Sends a flick gesture to the current view.
   *
   * @param xSpeed The horizontal speed in pixels/second
   * @param ySpeed The vertical speed in pixels/second
   * @return self
   */

  public TouchActions flick(int xSpeed, int ySpeed) {
    if (touchScreen != null) {
      action.addAction(new FlickAction(touchScreen, xSpeed, ySpeed));
    }
    return this;
  }

  /**
   * Allows the execution of flick gestures starting in a location's element.
   *
   * @param onElement The {@link WebElement} to flick on
   * @param xOffset   The x offset relative to the viewport
   * @param yOffset   The y offset relative to the viewport
   * @param speed speed to flick, 0 = normal, 1 = fast, 2 = slow
   * @return self
   */

  public TouchActions flick(WebElement onElement, int xOffset, int yOffset, int speed) {
    if (touchScreen != null) {
      action.addAction(new FlickAction(touchScreen, (Locatable) onElement, xOffset, yOffset, speed));
    }
    return this;
  }
}
