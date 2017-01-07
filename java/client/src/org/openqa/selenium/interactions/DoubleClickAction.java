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

import org.openqa.selenium.interactions.internal.MouseAction;
import org.openqa.selenium.internal.Locatable;

import java.util.Arrays;
import java.util.List;

/**
 * Double-clicks an element.
 *
 */
public class DoubleClickAction extends MouseAction implements Action {
  public DoubleClickAction(Mouse mouse, Locatable locationProvider) {
    super(mouse, locationProvider);
  }

  /**
   * Double-clicks on the given element.
   */
  public void perform() {
    moveToLocation();
    mouse.doubleClick(getActionLocation());
  }

  public List<Object> asList() {
    return Arrays.asList("click", getTargetId(), Button.LEFT, 2);
  }
}
