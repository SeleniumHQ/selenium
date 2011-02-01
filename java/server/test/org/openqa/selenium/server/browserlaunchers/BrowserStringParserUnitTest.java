package org.openqa.selenium.server.browserlaunchers;

import junit.framework.TestCase;

/**
 * {@link BrowserInstallationCache} unit test class.
 */
public class BrowserStringParserUnitTest extends TestCase {

    public void testBrowserStartCommandMatchWhenBrowserStringIsTheBrowserName() {
        final BrowserStringParser.Result result;

        result = new BrowserStringParser().parseBrowserStartCommand("firefox", "firefox");
        assertTrue(result.match());
        assertNull(result.customLauncher());
    }
    public void testBrowserStartCommandMatchWhenBrowserStringIsStarTheBrowserName() {
        final BrowserStringParser.Result result;

        result = new BrowserStringParser().parseBrowserStartCommand("firefox", "*firefox");
        assertTrue(result.match());
    }

    public void testBrowserStartCommandDoNotMatchWhenBrowsersAreWayDifferent() {
        final BrowserStringParser.Result result;

        result = new BrowserStringParser().parseBrowserStartCommand("firefox", "*safari");
        assertFalse(result.match());
        assertNull(result.customLauncher());
    }

    public void testBrowserStartCommandMatchWhenCustomLauncherIsProvided() {
        final BrowserStringParser.Result result;

        result = new BrowserStringParser().parseBrowserStartCommand("firefox", "*firefox /a/custom/launcher");
        assertTrue(result.match());
        assertEquals("/a/custom/launcher", result.customLauncher());
    }

    public void testBrowserStartCommandDoNotMatchWhenBrowsersisASubstring() {
        final BrowserStringParser.Result result;

        result = new BrowserStringParser().parseBrowserStartCommand("firefox", "*firefoxproxy");
        assertFalse(result.match());
        assertNull(result.customLauncher());
    }

    public void testBrowserStartCommandIsNullWhenThereIsNothingButSpaceAfterTheBrowserName() {
        final BrowserStringParser.Result result;

        result = new BrowserStringParser().parseBrowserStartCommand("firefox", "firefox    ");
        assertTrue(result.match());
        assertNull(result.customLauncher());
    }

    public void testBrowserStartCommandMatchIgnoredTrailingSpacesWhenCustomLauncherIsProvided() {
        final BrowserStringParser.Result result;

        result = new BrowserStringParser().parseBrowserStartCommand("iexplore", "*iexplore /a/custom/launcher   ");
        assertTrue(result.match());
        assertEquals("/a/custom/launcher", result.customLauncher());
    }

    public void testBrowserStartCommandMatchPreservedSpacesWhithinCustomLauncher() {
        final BrowserStringParser.Result result;

        result = new BrowserStringParser().parseBrowserStartCommand("hta", "*hta '/a/custom/launcher with space'   ");
        assertTrue(result.match());
        assertEquals("'/a/custom/launcher with space'", result.customLauncher());
    }

}
