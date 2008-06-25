package org.openqa.selenium.server.browserlaunchers.locators;

/**
 * Discovers a valid Firefox installation on local system.
 */
public abstract class FirefoxLocator extends BrowserLocator {

    protected String browserPathOverridePropertyName() {
        return "firefoxDefaultPath";
    }

}
