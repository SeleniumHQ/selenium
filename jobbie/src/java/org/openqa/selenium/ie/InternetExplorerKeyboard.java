// Copyright 2010 Google Inc. All Rights Reserved.
package org.openqa.selenium.ie;

import com.sun.jna.Pointer;
import com.sun.jna.WString;

import org.openqa.selenium.Keyboard;
import org.openqa.selenium.Keys;

/**
 * Implements the Keyboard interface for IE by calling the underlying
 * IE lib.
 */
public class InternetExplorerKeyboard implements Keyboard {
  private final InternetExplorerDriver parent;
  private final ExportedWebDriverFunctions lib;
  private final ErrorHandler errors = new ErrorHandler();

  public InternetExplorerKeyboard(InternetExplorerDriver parent, ExportedWebDriverFunctions ieLib) {
    this.parent = parent;
    this.lib = ieLib;
  }

  private InternetExplorerElement getActive() {
    return (InternetExplorerElement) parent.switchTo().activeElement();
  }

  public void sendKeys(CharSequence... keysToSend) {
    getActive().sendKeys(keysToSend);
  }

  public void pressKey(Keys keyToPress) {
    getActive().sendKeyDownEvent(keyToPress);
  }

  public void releaseKey(Keys keyToRelease) {
    getActive().sendKeyUpEvent(keyToRelease);
  }

  public void sendKeys(Pointer element, String keysSequence) {
    int result = lib.wdeSendKeys(element, new WString(keysSequence));

    errors.verifyErrorCode(result, "send keys to");

    parent.waitForLoadToComplete();
  }

  public void pressKey(Pointer element, Keys modifierKey) {
    int result = lib.wdeSendKeyPress(element, new WString(modifierKey.toString()));

    errors.verifyErrorCode(result, "send key press to");

    parent.waitForLoadToComplete();
  }

  public void releaseKey(Pointer element, Keys modifierKey) {
    int result = lib.wdeSendKeyRelease(element, new WString(modifierKey.toString()));

    errors.verifyErrorCode(result, "send key release to");

    parent.waitForLoadToComplete();
  }
}
