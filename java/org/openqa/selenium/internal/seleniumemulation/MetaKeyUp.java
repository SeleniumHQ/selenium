package org.openqa.selenium.internal.seleniumemulation;

import org.openqa.selenium.WebDriver;

public class MetaKeyUp extends SeleneseCommand<Void> {
  private final KeyState keyState;

  public MetaKeyUp(KeyState keyState) {
    this.keyState = keyState;
  }

  @Override
  protected Void handleSeleneseCommand(WebDriver driver, String locator, String value) {
    keyState.metaKeyDown = false;
    return null;
  }
}