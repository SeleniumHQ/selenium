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

import com.google.common.collect.ImmutableList;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.internal.MouseAction;
import org.openqa.selenium.internal.Locatable;

import java.util.List;

/**
 * Presses the left mouse button without releasing it.
 *
 * @deprecated Use {@link Actions#clickAndHold(WebElement)}
 */
@Deprecated
public class ClickAndHoldAction extends MouseAction implements Action {
  public ClickAndHoldAction(Mouse mouse, Locatable locationProvider) {
    super(mouse, locationProvider);
  }

  /**
   * Holds down the mouse button on a selected element. If this action is called out of sequence
   * (i.e. twice in a row, without releasing the button after the first action) the results will be
   * different between browsers.
   */
  public void perform() {
    moveToLocation();
    mouse.mouseDown(getActionLocation());
  }

  @Override
  public List<Interaction> asInteractions(PointerInput mouse, KeyInput keyboard) {
    ImmutableList.Builder<Interaction> interactions = ImmutableList.builder();

    moveToLocation(mouse, interactions);

    return interactions.build();
  }
}
