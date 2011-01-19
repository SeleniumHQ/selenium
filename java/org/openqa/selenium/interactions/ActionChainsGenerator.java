/*
Copyright 2007-2011 WebDriver committers
Copyright 2007-2011 Google Inc.

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

import org.openqa.selenium.Keys;
import org.openqa.selenium.WebElement;

/**
 * Generate user actions.
 */

public interface ActionChainsGenerator {
  // Keyboard-related actions.

  public ActionChainsGenerator keyDown(Keys theKey);

  public ActionChainsGenerator keyDown(WebElement element, Keys theKey);

  public ActionChainsGenerator keyUp(Keys theKey);

  public ActionChainsGenerator keyUp(WebElement element, Keys theKey);

  public ActionChainsGenerator sendKeys(CharSequence... keysToSend);

  public ActionChainsGenerator sendKeys(WebElement element, CharSequence... keysToSend);

  // Mouse-related actions.
  public ActionChainsGenerator clickAndHold(WebElement onElement);

  public ActionChainsGenerator release(WebElement onElement);

  public ActionChainsGenerator click(WebElement onElement);

  // Click where the mouse was last moved to.
  public ActionChainsGenerator click();

  public ActionChainsGenerator doubleClick(WebElement onElement);

  public ActionChainsGenerator moveToElement(WebElement toElement);

  public ActionChainsGenerator moveToElement(WebElement toElement, int xOffset, int yOffset);

  public ActionChainsGenerator moveByOffset(int xOffset, int yOffset);

  public ActionChainsGenerator contextClick(WebElement onElement);

  public ActionChainsGenerator dragAndDrop(WebElement source, WebElement target);

  public Action build();
}
