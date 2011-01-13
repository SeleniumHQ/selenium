package org.openqa.selenium.internal.seleniumemulation;

import org.openqa.selenium.WebDriver;

public class AltKeyUp extends SeleneseCommand<Void> {
  private final KeyState keyState;

  public AltKeyUp(KeyState keyState) {
    this.keyState = keyState;
  }

  @Override
  protected Void handleSeleneseCommand(WebDriver driver, String locator, String value) {
    keyState.altKeyDown = false;
    return null;
  }
}