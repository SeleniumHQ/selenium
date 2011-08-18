/*
Copyright 2011 WebDriver committers
Copyright 2011 Google Inc.

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

package org.openqa.selenium;

import org.openqa.selenium.interactions.internal.Coordinates;

/**
 * Interface representing basic touch screen operations.
 */
public interface TouchScreen {

  /**
   * Allows the execution of single tap on the screen, analogous to click using a Mouse.
   * @param where The location on the screen. Typically a {@link WebElement}
   */
  void singleTap(Coordinates where);

  /**
   * Allows the execution of the gesture 'down' on the screen.  It is typically the first of a
   * sequence of touch gestures.
   * @param x The x coordinate relative to the viewport
   * @param y The y coordinate relative to the viewport
   */
  void down(int x, int y);
}

