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

package org.openqa.selenium.interactions.internal;

import org.openqa.selenium.Keys;
import org.openqa.selenium.interactions.Keyboard;
import org.openqa.selenium.interactions.Locatable;
import org.openqa.selenium.interactions.Mouse;

/**
 * Used both by KeyDownAction and KeyUpAction
 *
 */
@Deprecated
public abstract class SingleKeyAction extends KeysRelatedAction {
  protected final Keys key;
  private static final Keys[] MODIFIER_KEYS = {Keys.SHIFT, Keys.CONTROL, Keys.ALT, Keys.META,
                                               Keys.COMMAND, Keys.LEFT_ALT, Keys.LEFT_CONTROL,
                                               Keys.LEFT_SHIFT};

  protected SingleKeyAction(Keyboard keyboard, Mouse mouse, Keys key) {
    this(keyboard, mouse, null, key);
  }

  protected SingleKeyAction(Keyboard keyboard, Mouse mouse, Locatable locationProvider, Keys key) {
    super(keyboard, mouse, locationProvider);
    this.key = key;
    boolean isModifier = false;
    for (Keys modifier : MODIFIER_KEYS) {
      isModifier = isModifier || modifier.equals(key);
    }

    if (!isModifier) {
      throw new IllegalArgumentException("Key Down / Up events only make sense for modifier keys.");
    }
  }
}
