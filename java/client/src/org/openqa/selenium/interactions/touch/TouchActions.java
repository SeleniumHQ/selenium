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

package org.openqa.selenium.interactions.touch;

import org.openqa.selenium.HasInputDevices;
import org.openqa.selenium.HasTouchScreen;
import org.openqa.selenium.Keyboard;
import org.openqa.selenium.TouchScreen;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.internal.Locatable;

/**
 * Implements actions for touch enabled devices, reusing the available composite and builder design
 * patterns from Actions
 */
public class TouchActions extends Actions {

  protected TouchScreen touchScreen;

  public TouchActions(WebDriver driver) {
    this(((HasInputDevices) driver).getKeyboard(),
          ((HasTouchScreen) driver).getTouch());
  }

  public TouchActions(Keyboard keyboard, TouchScreen touchScreen) {
    super(keyboard);
    this.touchScreen = touchScreen;
  }

  public TouchActions singleTap(WebElement onElement) {    
    action.addAction(new SingleTapAction(touchScreen, (Locatable) onElement));
    return this;
  }
}