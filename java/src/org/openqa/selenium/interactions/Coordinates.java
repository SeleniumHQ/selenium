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

package org.openqa.selenium.interactions;

import org.openqa.selenium.Point;

/**
 * Provides coordinates of an element for advanced interactions. Note that some coordinates (such as
 * screen coordinates) are evaluated lazily since the element may have to be scrolled into view.
 */
public interface Coordinates {

  /**
   * Gets coordinates on the element relative to the top-left corner of the monitor (screen). This
   * method automatically scrolls the page and/or frames to make element visible in viewport before
   * calculating its coordinates.
   *
   * @return coordinates on the element relative to the top-left corner of the monitor (screen).
   * @throws org.openqa.selenium.ElementNotInteractableException if the element can't be scrolled
   *     into view.
   */
  Point onScreen();

  /**
   * Gets coordinates on the element relative to the top-left corner of OS-window being used to
   * display the content. Usually it is the browser window's viewport. This method automatically
   * scrolls the page and/or frames to make element visible in viewport before calculating its
   * coordinates.
   *
   * @return coordinates on the element relative to the top-left corner of the browser window's
   *     viewport.
   * @throws org.openqa.selenium.ElementNotInteractableException if the element can't be scrolled
   *     into view.
   */
  Point inViewPort();

  /**
   * Gets coordinates on the element relative to the top-left corner of the page.
   *
   * @return coordinates on the element relative to the top-left corner of the page.
   */
  Point onPage();

  Object getAuxiliary();
}
