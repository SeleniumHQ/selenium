/*
Copyright 2007-2010 WebDriver committers
Copyright 2007-2010 Google Inc.

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

package org.openqa.selenium.internal.interactions;

import org.openqa.selenium.HasInputDevices;
import org.openqa.selenium.Keyboard;
import org.openqa.selenium.Mouse;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

/**
 * Base class for all actions.
 */
public abstract class BaseAction {
  protected final WebDriver parent;
  protected final WebElement onElement;

  protected BaseAction(WebDriver parent, WebElement onElement) {
    this.parent = parent;
    this.onElement = onElement;
  }

  protected Keyboard getKeyboard() {
    return ((HasInputDevices) parent).getKeyboard();
  }

  protected Mouse getMouse() {
    return ((HasInputDevices) parent).getMouse();
  }

}
