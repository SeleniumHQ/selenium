// Copyright 2010 Google Inc.  All Rights Reserved.

package org.openqa.selenium.internal.seleniumemulation;

import org.openqa.selenium.WebDriver;

/**
 * @author simonstewart@google.com (Simon Stewart)
 */
public class IsConfirmationPresent extends SeleneseCommand {
  private final AlertOverride alertOverride;

  public IsConfirmationPresent(AlertOverride alertOverride) {
    this.alertOverride = alertOverride;
  }

  @Override
  protected Object handleSeleneseCommand(WebDriver driver, String locator, String value) {
    return alertOverride.isConfirmationPresent(driver);
  }
}
