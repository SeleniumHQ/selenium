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

import org.openqa.selenium.Mouse;
import org.openqa.selenium.interactions.internal.MouseAction;
import org.openqa.selenium.internal.Locatable;

/**
 * Move the mouse to a location within the element provided. The coordinates provided specify the
 * offset from the top-left corner of the element.
 */
public class MoveToOffsetAction extends MouseAction implements Action {
  private final int xOffset;
  private final int yOffset;

  public MoveToOffsetAction(Mouse mouse, Locatable locationProvider, int x, int y) {
    super(mouse, locationProvider);
    xOffset = x;
    yOffset = y;
  }

  public void perform() {
    mouse.mouseMove(getActionLocation(), xOffset, yOffset);
  }
}
