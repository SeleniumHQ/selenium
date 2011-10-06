package org.openqa.selenium.browserlaunchers.locators;


/**
 * Discovers a valid Firefox installation on local system.
 */
public abstract class FirefoxLocator extends SingleBrowserLocator {

  @Override
  protected String browserPathOverridePropertyName() {
    return "firefoxDefaultPath";
  }

}
