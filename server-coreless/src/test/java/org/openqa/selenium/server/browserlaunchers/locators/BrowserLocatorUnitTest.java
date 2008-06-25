package org.openqa.selenium.server.browserlaunchers.locators;

import junit.framework.TestCase;
import junit.framework.Assert;
import static junit.framework.Assert.assertEquals;
import org.openqa.selenium.server.RemoteControlConfiguration;
import org.openqa.selenium.server.browserlaunchers.AbstractBrowserLauncher;

/**
 * {@link org.openqa.selenium.server.browserlaunchers.AbstractBrowserLauncher} unit test class.
 */
public class BrowserLocatorUnitTest extends TestCase {

    public void testHumanFriendlyLauncherFileNamesReturnsEmptyStringWhenThereIsNoStandardFileNames() {
        final BrowserLocator locator;

        locator = new BrowserLocator() {
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
        final BrowserLocator locator;

        locator = new BrowserLocator() {

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
        final BrowserLocator locator;

        locator = new BrowserLocator() {

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