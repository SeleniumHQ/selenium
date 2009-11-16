package org.openqa.selenium.internal.seleniumemulation;

import org.openqa.selenium.WebDriver;

public class ShiftKeyUp extends SeleneseCommand<Void> {
  private final KeyState keyState;

  public ShiftKeyUp(KeyState keyState) {
    this.keyState = keyState;
  }

  @Override
  protected Void handleSeleneseCommand(WebDriver driver, String locator, String value) {
    keyState.shiftKeyDown = false;
    return null;
  }
}