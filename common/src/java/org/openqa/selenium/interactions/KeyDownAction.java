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

package org.openqa.selenium.interactions;

import org.openqa.selenium.*;
import org.openqa.selenium.internal.interactions.SingleKeyAction;

/**
 * Emulates key press only, without the release.
 *
 */
public class KeyDownAction extends SingleKeyAction implements Action {
  public KeyDownAction(WebDriver parent, WebElement toElement, Keys key) {
    super(parent, toElement, key);
  }

  public KeyDownAction(WebDriver parent, Keys key) {
    super(parent, key);
  }

  public void perform() {
    focusOnElement();

    Keyboard keyboard = getKeyboard();
    
    keyboard.pressKey(key);
  }
}
