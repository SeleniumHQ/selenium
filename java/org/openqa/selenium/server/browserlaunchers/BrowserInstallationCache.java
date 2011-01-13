package org.openqa.selenium.server.browserlaunchers;

import org.openqa.selenium.server.browserlaunchers.locators.BrowserLocator;

import java.util.Map;
import java.util.HashMap;

/**
 * Cache browser installation corresponding to a spefic browser string and launcher location.
 */
public class BrowserInstallationCache {

    private final Map<String, BrowserInstallation> cache;

    public BrowserInstallationCache() {
        this.cache = new HashMap<String,BrowserInstallation>(5);
    }

    public BrowserInstallation locateBrowserInstallation(String browserName, String customLauncherPath, BrowserLocator locator) {
        final String cacheKey;

        cacheKey = cacheKey(browserName, customLauncherPath);
        synchronized(cache) {
            if (null == cache.get(cacheKey)) {
                if (null == customLauncherPath) {
                    cache.put(cacheKey, locator.findBrowserLocationOrFail());
                } else {
                    cache.put(cacheKey, locator.retrieveValidInstallationPath(customLauncherPath));
                }
            }
            return cache.get(cacheKey);
        }
    }

    protected String cacheKey(String browserString, String customLauncherPath) {
        return (null == customLauncherPath) ? browserString : browserString + customLauncherPath;
    }


}
