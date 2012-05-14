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

package org.openqa.selenium.interactions;

import org.openqa.selenium.Keyboard;
import org.openqa.selenium.Mouse;
import org.openqa.selenium.interactions.internal.KeysRelatedAction;
import org.openqa.selenium.internal.Locatable;

/**
 * Sending a sequence of keys to an element.
 * 
 */
public class SendKeysAction extends KeysRelatedAction implements Action {
  private final CharSequence[] keysToSend;

  public SendKeysAction(Keyboard keyboard, Mouse mouse, Locatable locationProvider,
      CharSequence... keysToSend) {
    super(keyboard, mouse, locationProvider);
    this.keysToSend = keysToSend;
  }

  public SendKeysAction(Keyboard keyboard, Mouse mouse, CharSequence... keysToSend) {
    this(keyboard, mouse, null, keysToSend);
  }

  public void perform() {
    focusOnElement();

    keyboard.sendKeys(keysToSend);
  }
}
