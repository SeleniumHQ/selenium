/*
Copyright 2007-2010 Selenium committers

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

package org.openqa.selenium.htmlunit;

import org.openqa.selenium.Keys;

/**
 * Holds the state of the modifier keys (Shift, ctrl, alt) for HtmlUnit.
 */
class KeyboardModifiersState {
  private boolean shiftPressed = false;
  private boolean ctrlPressed = false;
  private boolean altPressed = false;

  public boolean isShiftPressed() {
    return shiftPressed;
  }

  public boolean isCtrlPressed() {
    return ctrlPressed;
  }

  public boolean isAltPressed() {
    return altPressed;
  }

  public void storeKeyDown(CharSequence key) {
    storeIfEqualsShift(key, true);
    storeIfEqualsCtrl(key, true);
    storeIfEqualsAlt(key, true);
  }

  public void storeKeyUp(CharSequence key) {
    storeIfEqualsShift(key, false);
    storeIfEqualsCtrl(key, false);
    storeIfEqualsAlt(key, false);
  }

  private void storeIfEqualsShift(CharSequence key, boolean keyState) {
    if (key.equals(Keys.SHIFT))
      shiftPressed = keyState;
  }

  private void storeIfEqualsCtrl(CharSequence key, boolean keyState) {
    if (key.equals(Keys.CONTROL))
      ctrlPressed = keyState;
  }

  private void storeIfEqualsAlt(CharSequence key, boolean keyState) {
    if (key.equals(Keys.ALT))
      altPressed = keyState;
  }
}
