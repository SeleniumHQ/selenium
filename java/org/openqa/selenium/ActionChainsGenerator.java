// Copyright 2011 Google Inc. All Rights Reserved.
package org.openqa.selenium;

import org.openqa.selenium.interactions.Action;

/**
 * Generate user actions.
 */

//TODO(eran): rename this.
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
