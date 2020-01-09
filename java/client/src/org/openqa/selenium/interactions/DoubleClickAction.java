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
import org.openqa.selenium.interactions.internal.MouseAction;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Double-clicks an element.
 *
 * @deprecated Use {@link Actions#doubleClick(WebElement)}
 */
@Deprecated
public class DoubleClickAction extends MouseAction implements Action {
  public DoubleClickAction(Mouse mouse, Locatable locationProvider) {
    super(mouse, locationProvider);
  }

  /**
   * Double-clicks on the given element.
   */
  @Override
  public void perform() {
    moveToLocation();
    mouse.doubleClick(getActionLocation());
  }

  @Override
  public List<Interaction> asInteractions(PointerInput mouse, KeyInput keyboard) {
    List<Interaction> interactions = new ArrayList<>(moveToLocation(mouse));

    interactions.add(mouse.createPointerDown(Button.LEFT.asArg()));
    interactions.add(mouse.createPointerUp(Button.LEFT.asArg()));
    interactions.add(mouse.createPointerDown(Button.LEFT.asArg()));
    interactions.add(mouse.createPointerUp(Button.LEFT.asArg()));

    return Collections.unmodifiableList(interactions);
  }
}
