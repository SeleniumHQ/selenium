package org.openqa.selenium.internal.seleniumemulation;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverBackedSelenium;

public class ShiftKeyDown extends SeleneseCommand<Void> {
  private final KeyState keyState;

  public ShiftKeyDown(KeyState keyState) {
    this.keyState = keyState;
  }

  @Override
  protected Void handleSeleneseCommand(WebDriver driver, String locator, String value) {
    keyState.shiftKeyDown = true;
    return null;
  }
}