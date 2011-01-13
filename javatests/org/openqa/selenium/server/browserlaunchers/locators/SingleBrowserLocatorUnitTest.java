package org.openqa.selenium.server.browserlaunchers.locators;

import junit.framework.TestCase;

/**
 * {@link org.openqa.selenium.server.browserlaunchers.AbstractBrowserLauncher} unit test class.
 */
public class SingleBrowserLocatorUnitTest extends TestCase {

    public void testHumanFriendlyLauncherFileNamesReturnsEmptyStringWhenThereIsNoStandardFileNames() {
        final SingleBrowserLocator locator;

        locator = new SingleBrowserLocator() {
            protected String[] standardlauncherFilenames() {
                return new String[0];
            }

            protected String browserName() {
                return null;
            }

            protected String seleniumBrowserName() {
                return null;
            }

            protected String browserPathOverridePropertyName() {
                return null;
            }

            protected String[] usualLauncherLocations() {
                return new String[0];
            }

        };
        assertEquals("", locator.humanFriendlyLauncherFileNames());
    }

    public void testHumanFriendlyLauncherFileNamesReturnsQuotedFileNameWhenThereIsASingleFileName() {
        final SingleBrowserLocator locator;

        locator = new SingleBrowserLocator() {

            protected String[] standardlauncherFilenames() {
                return new String[] { "a-single-browser"};
            }

            protected String browserName() {
                return null;
            }

            protected String seleniumBrowserName() {
                return null;
            }

            protected String browserPathOverridePropertyName() {
                return null;
            }

            protected String[] usualLauncherLocations() {
                return new String[0];
            }

        };
        assertEquals("'a-single-browser'", locator.humanFriendlyLauncherFileNames());
    }

    public void testHumanFriendlyLauncherFileNamesReturnsAllFileNamesOrSeperatedWhenThereIsMoreThanOneFileName() {
        final SingleBrowserLocator locator;

        locator = new SingleBrowserLocator() {

            protected String[] standardlauncherFilenames() {
                return new String[] { "a-browser", "another-one"};
            }

            protected String browserName() {
                return null;
            }

            protected String seleniumBrowserName() {
                return null;
            }

            protected String browserPathOverridePropertyName() {
                return null;
            }

            protected String[] usualLauncherLocations() {
                return new String[0];
            }

        };
        assertEquals("'a-browser' or 'another-one'", locator.humanFriendlyLauncherFileNames());
    }

}