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

import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Interaction;
import org.openqa.selenium.interactions.IsInteraction;
import org.openqa.selenium.interactions.Keyboard;
import org.openqa.selenium.interactions.Locatable;
import org.openqa.selenium.interactions.Mouse;
import org.openqa.selenium.interactions.PointerInput;
import org.openqa.selenium.interactions.PointerInput.MouseButton;
import org.openqa.selenium.interactions.PointerInput.Origin;

import java.time.Duration;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

/**
 * Represents a general action related to keyboard input.
 */
@Deprecated
public abstract class KeysRelatedAction extends BaseAction implements IsInteraction {
  protected final Keyboard keyboard;
  protected final Mouse mouse;

  protected KeysRelatedAction(Keyboard keyboard, Mouse mouse, Locatable locationProvider) {
    super(locationProvider);
    this.keyboard = keyboard;
    this.mouse = mouse;
  }

  protected void focusOnElement() {
    if (where != null) {
      mouse.click(where.getCoordinates());
    }
  }

  protected Collection<Interaction> optionallyClickElement(PointerInput mouse) {
    List<Interaction> interactions = new ArrayList<>();

    Optional<WebElement> target = getTargetElement();
    if (target.isPresent()) {

      interactions.add(mouse.createPointerMove(
          Duration.ofMillis(500),
          target.map(Origin::fromElement).orElse(Origin.pointer()),
          0,
          0));

      interactions.add(mouse.createPointerDown(MouseButton.LEFT.asArg()));
      interactions.add(mouse.createPointerUp(MouseButton.LEFT.asArg()));
    }

    return Collections.unmodifiableList(interactions);
  }
}
