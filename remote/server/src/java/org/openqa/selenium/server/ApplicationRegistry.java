package org.openqa.selenium.server;

import org.openqa.selenium.server.browserlaunchers.BrowserInstallationCache;

/**
 * Application Registry. Global object to find common objects and services.
 *
 * See http://martinfowler.com/eaaCatalog/registry.html
 */
public class ApplicationRegistry {

    private static ApplicationRegistry instance;
    private final BrowserInstallationCache browserInstallationCache;

    public ApplicationRegistry() {
        browserInstallationCache = new BrowserInstallationCache();
    }

    /**
     * Return the singleton instance.
     *
     * @return The singleton instance. Never null.
     */
    public static ApplicationRegistry instance() {
       /*
        * In theory the is no guard against concurrent code and multiple instances
        * could be created. In practice this is not a problem, this scenario is
        * unlikely and all registries would be equivalent.
        */   
        if (null == instance) {
            instance = new ApplicationRegistry();
        }
        return instance;
    }

    public BrowserInstallationCache browserInstallationCache() {
        return browserInstallationCache;
    }

}
