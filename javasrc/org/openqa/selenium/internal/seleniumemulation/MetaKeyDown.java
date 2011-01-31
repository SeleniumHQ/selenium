package org.openqa.selenium.internal.seleniumemulation;

import org.openqa.selenium.WebDriver;

public class MetaKeyDown extends SeleneseCommand<Void> {
  private final KeyState keyState;

  public MetaKeyDown(KeyState keyState) {
    this.keyState = keyState;
  }

  @Override
  protected Void handleSeleneseCommand(WebDriver driver, String locator, String value) {
    keyState.metaKeyDown = true;
    return null;
  }
}