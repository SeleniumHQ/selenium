package org.openqa.selenium.internal.seleniumemulation;

import org.openqa.selenium.WebDriver;

public class AltKeyDown extends SeleneseCommand<Void> {
  private final KeyState keyState;

  public AltKeyDown(KeyState keyState) {
    this.keyState = keyState;
  }

  @Override
  protected Void handleSeleneseCommand(WebDriver driver, String locator, String value) {
    keyState.altKeyDown = true;
    return null;
  }
}