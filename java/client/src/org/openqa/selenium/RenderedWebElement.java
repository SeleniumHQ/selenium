/*
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.

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

package org.openqa.selenium;

/**
 * @deprecated The methods in the class are
 */
@Deprecated
public interface RenderedWebElement extends WebElement {

  /**
   * Drag and drop
   *
   * @param moveRightBy how much to move to the right (negative for moving
   *                    left)
   * @param moveDownBy  how much to move to the bottom (negative for moving
   *                    up)
   * @deprecated Use ClickAndHoldAction, MoveMouseAction and
   *             ButtonReleaseAction instead
   */
  @Deprecated
  void dragAndDropBy(int moveRightBy, int moveDownBy);

  /**
   * Drag and drop this element on top of the specified element
   *
   * @param element element to be dropped on. Only RenderedElement is
   *                supported
   * @deprecated Use ClickAndHoldAction, MoveMouseAction and
   *             ButtonReleaseAction instead
   */
  @Deprecated
  void dragAndDropOn(RenderedWebElement element);

}
