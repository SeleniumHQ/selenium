package org.openqa.selenium.server.browserlaunchers;

import junit.framework.TestCase;
import org.openqa.selenium.server.browserlaunchers.locators.BrowserLocator;

/**
 * {@link BrowserInstallationCache} unit test class.
 */
public class BrowserLocationCacheUnitTest extends TestCase {

    public void tesCacheKeyIsTheBrowserStringWhenNoCustomPathIsProvided() {
        assertEquals("*aBrowser", new BrowserInstallationCache().cacheKey("*aBrowser", null));
    }

    public void testCacaheIsTheBrowserStringConcatenatedWithCustomPathWhenCustomPathIsProvided() {
        assertEquals("*aBrowseraCustomPath", new BrowserInstallationCache().cacheKey("*aBrowser", "aCustomPath"));
    }

    public void testLocateBrowserInstallationUseLocatorWhenCacheIsEmpty() {
        final BrowserInstallation expectedInstallation;
        final BrowserLocator locator;

        expectedInstallation = new BrowserInstallation(null, null);
        locator = new BrowserLocator() {

            public BrowserInstallation findBrowserLocationOrFail() {
                return expectedInstallation;
            }

            public BrowserInstallation retrieveValidInstallationPath(String customLauncherPath) {
                throw new UnsupportedOperationException();
            }

        };

        assertEquals(expectedInstallation,
                     new BrowserInstallationCache().locateBrowserInstallation("aBrowser", null, locator));
    }

    public void testLocateBrowserInstallationUseCacheOnSecondAccess() {
        final BrowserInstallation expectedInstallation;
        final BrowserInstallationCache cache;
        final BrowserLocator locator;

        expectedInstallation = new BrowserInstallation(null, null);
        locator = new BrowserLocator() {

            public BrowserInstallation findBrowserLocationOrFail() {
                return expectedInstallation;
            }

            public BrowserInstallation retrieveValidInstallationPath(String customLauncherPath) {
                throw new UnsupportedOperationException();
            }
        };

        cache = new BrowserInstallationCache();
        cache.locateBrowserInstallation("aBrowser", null, locator);
        assertEquals(expectedInstallation, cache.locateBrowserInstallation("aBrowser", null, null));
    }

    public void testLocateBrowserInstallationUseLocatorWhenCacheIsEmptyAndACustomPathIsProvided() {
        final BrowserInstallation expectedInstallation;
        final BrowserLocator locator;

        expectedInstallation = new BrowserInstallation(null, null);
        locator = new BrowserLocator() {

            public BrowserInstallation findBrowserLocationOrFail() {
                throw new UnsupportedOperationException();
            }

            public BrowserInstallation retrieveValidInstallationPath(String customLauncherPath) {
                if ("aCustomLauncher".equals(customLauncherPath)) {
                    return expectedInstallation;
                }
                throw new UnsupportedOperationException(customLauncherPath);
            }

        };

        assertEquals(expectedInstallation,
                     new BrowserInstallationCache().locateBrowserInstallation("aBrowser", "aCustomLauncher", locator));
    }

    public void testLocateBrowserInstallationUseCacheOnSecondAccessWhenCustomLauncherIsProvided() {
        final BrowserInstallation expectedInstallation;
        final BrowserInstallationCache cache;
        final BrowserLocator locator;

        expectedInstallation = new BrowserInstallation(null, null);
        locator = new BrowserLocator() {

            public BrowserInstallation findBrowserLocationOrFail() {
                throw new UnsupportedOperationException();
            }

            public BrowserInstallation retrieveValidInstallationPath(String customLauncherPath) {
                if ("aCustomLauncher".equals(customLauncherPath)) {
                    return expectedInstallation;
                }
                throw new UnsupportedOperationException(customLauncherPath);
            }
        };

        cache = new BrowserInstallationCache();
        cache.locateBrowserInstallation("aBrowser", "aCustomLauncher", locator);
        assertEquals(expectedInstallation, cache.locateBrowserInstallation("aBrowser", "aCustomLauncher", null));
    }

}
