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

import org.openqa.selenium.RenderedWebElement;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.internal.interactions.BaseAction;

import java.awt.*;

/**
 * Move the mouse to a location within the element provided. The coordinates
 * provided specify the offset from the top-left corner of the element.
 */
public class MoveToOffsetAction extends BaseAction implements Action {
  private final int xOffset;
  private final int yOffset;

  public MoveToOffsetAction(WebDriver parent, WebElement toElement, int x, int y) {
    super(parent, toElement);
    if (!(toElement instanceof RenderedWebElement)) {
      throw new ElementNotDisplayedException(String.format("Element %s has no screen " +
          "coordinates, use a driver that renders elements on screen.", toElement));
    }
    xOffset = x;
    yOffset = y;
  }

  public void perform() {
    Dimension elementSize = ((RenderedWebElement) onElement).getSize();
    if ((elementSize.getHeight() < yOffset) ||
        (elementSize.getWidth() < xOffset)) {
      throw new MoveOutsideBoundriesException(String.format("Attempted mouse move outside Element" +
          "boundries. Coordinates: x %d y %d, element size: %s", xOffset, yOffset, elementSize));
    }
    getMouse().mouseMove(onElement, xOffset, yOffset);
  }
}
