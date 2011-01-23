package org.openqa.selenium.server.browserlaunchers.locators;

import org.openqa.selenium.browserlaunchers.locators.SingleBrowserLocator;

/**
 * Discovers a valid Firefox installation on local system.
 */
public abstract class FirefoxLocator extends SingleBrowserLocator {

    protected String browserPathOverridePropertyName() {
        return "firefoxDefaultPath";
    }

}
