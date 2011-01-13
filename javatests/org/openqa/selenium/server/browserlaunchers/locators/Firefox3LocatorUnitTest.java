package org.openqa.selenium.server.browserlaunchers.locators;

import junit.framework.TestCase;

/**
 * {@link org.openqa.selenium.server.browserlaunchers.locators.Firefox3Locator} unit test class.
 */
public class Firefox3LocatorUnitTest extends TestCase {

    public void testUsualLauncherLocationsOnWindows() {
        final Firefox3Locator locator;

        locator = new Firefox3Locator() {
            protected boolean runningOnWindows() {
                return true;
            }
        };

        assertEquals(3 ,locator.usualLauncherLocations().length);
        assertTrue(locator.usualLauncherLocations()[0].endsWith("\\Firefox-3"));
        assertTrue(locator.usualLauncherLocations()[1].endsWith("\\Mozilla Firefox"));
        assertTrue(locator.usualLauncherLocations()[2].endsWith("\\Firefox"));
    }

    public void testUsualLauncherLocationsOnOSX() {
        final Firefox3Locator locator;

        locator = new Firefox3Locator() {
            protected boolean runningOnWindows() {
                return false;
            }

            @Override
            protected String[] firefoxDefaultLocationsOnUbuntu() {
                return new String[] {};
            }
        };

        assertEquals(2 ,locator.usualLauncherLocations().length);
        assertEquals("/Applications/Firefox-3.app/Contents/MacOS", locator.usualLauncherLocations()[0]);
        assertEquals("/Applications/Firefox.app/Contents/MacOS", locator.usualLauncherLocations()[1]);
    }

    public void testUsualLauncherLocationsOnUbuntu() {
        final Firefox3Locator locator;

        locator = new Firefox3Locator() {
            protected boolean runningOnWindows() {
                return false;
            }

            @Override
            protected String[] firefoxDefaultLocationsOnUbuntu() {
                return new String[] { "firefox-3.0.3" };
            }
        };

        assertEquals(1 ,locator.usualLauncherLocations().length);
        assertEquals("/usr/lib/firefox-3.0.3", locator.usualLauncherLocations()[0]);
    }


}