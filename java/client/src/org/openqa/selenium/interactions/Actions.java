/*
Copyright 2007-2011 Selenium committers

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

package org.openqa.selenium.interactions;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.interactions.internal.ActionsSelfType;

/**
 * The user-facing API for emulating complex user gestures. Use this class rather than using the
 * Keyboard or Mouse directly.
 *
 * Implements the builder pattern: Builds a CompositeAction containing all actions specified by the
 * method calls.
 */
public class Actions extends ActionsSelfType<Actions> {

  /**
   * Default constructor - uses the default keyboard, mouse implemented by the driver.
   * @param driver the driver providing the implementations to use.
   */
  public Actions(WebDriver driver) {
    super(driver);
  }

  /**
   * A constructor that should only be used when the keyboard or mouse were extended to provide
   * additional functionality (for example, dragging-and-dropping from the desktop).
   * @param keyboard the {@link Keyboard} implementation to delegate to.
   * @param mouse the {@link Mouse} implementation to delegate to.
   */
  public Actions(Keyboard keyboard, Mouse mouse) {
    super(keyboard, mouse);
  }

  /**
   * Only used by the TouchActions class.
   * @param keyboard implementation to delegate to.
   */
  public Actions(Keyboard keyboard) {
    super(keyboard);
  }

  @Override
  protected Actions self() {
    return this;
  }

}
