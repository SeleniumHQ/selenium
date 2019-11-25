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

import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.PointerInput.Origin;
import org.openqa.selenium.interactions.internal.MouseAction;

import java.time.Duration;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

/**
 * Move the mouse to a location within the element provided. The coordinates provided specify the
 * offset from the top-left corner of the element.
 *
 * @deprecated Use {@link Actions#moveToElement(WebElement, int, int)}
 */
@Deprecated
public class MoveToOffsetAction extends MouseAction implements Action {
  private final int xOffset;
  private final int yOffset;

  public MoveToOffsetAction(Mouse mouse, Locatable locationProvider, int x, int y) {
    super(mouse, locationProvider);
    xOffset = x;
    yOffset = y;
  }

  @Override
  public void perform() {
    mouse.mouseMove(getActionLocation(), xOffset, yOffset);
  }

  @Override
  public List<Interaction> asInteractions(PointerInput mouse, KeyInput keyboard) {
    Optional<WebElement> target = getTargetElement();

    List<Interaction> interactions = new ArrayList<>();

    interactions.add(mouse.createPointerMove(
        Duration.ofMillis(500),
        target.map(Origin::fromElement).orElse(Origin.pointer()),
        xOffset,
        yOffset));

    return Collections.unmodifiableList(interactions);
  }
}
