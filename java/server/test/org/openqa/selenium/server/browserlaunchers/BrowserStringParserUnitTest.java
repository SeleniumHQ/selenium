/*
Copyright 2012 Selenium committers
Copyright 2012 Software Freedom Conservancy

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/


package org.openqa.selenium.server.browserlaunchers;

import org.junit.Test;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;

/**
 * {@link BrowserInstallationCache} unit test class.
 */
public class BrowserStringParserUnitTest {

  @Test
  public void testBrowserStartCommandMatchWhenBrowserStringIsTheBrowserName() {
    final BrowserStringParser.Result result;

    result = new BrowserStringParser().parseBrowserStartCommand("firefox", "firefox");
    assertTrue(result.match());
    assertNull(result.customLauncher());
  }

  @Test
  public void testBrowserStartCommandMatchWhenBrowserStringIsStarTheBrowserName() {
    final BrowserStringParser.Result result;

    result = new BrowserStringParser().parseBrowserStartCommand("firefox", "*firefox");
    assertTrue(result.match());
  }

  @Test
  public void testBrowserStartCommandDoNotMatchWhenBrowsersAreWayDifferent() {
    final BrowserStringParser.Result result;

    result = new BrowserStringParser().parseBrowserStartCommand("firefox", "*safari");
    assertFalse(result.match());
    assertNull(result.customLauncher());
  }

  @Test
  public void testBrowserStartCommandMatchWhenCustomLauncherIsProvided() {
    final BrowserStringParser.Result result;

    result =
        new BrowserStringParser()
            .parseBrowserStartCommand("firefox", "*firefox /a/custom/launcher");
    assertTrue(result.match());
    assertEquals("/a/custom/launcher", result.customLauncher());
  }

  @Test
  public void testBrowserStartCommandDoNotMatchWhenBrowsersisASubstring() {
    final BrowserStringParser.Result result;

    result = new BrowserStringParser().parseBrowserStartCommand("firefox", "*firefoxproxy");
    assertFalse(result.match());
    assertNull(result.customLauncher());
  }

  @Test
  public void testBrowserStartCommandIsNullWhenThereIsNothingButSpaceAfterTheBrowserName() {
    final BrowserStringParser.Result result;

    result = new BrowserStringParser().parseBrowserStartCommand("firefox", "firefox    ");
    assertTrue(result.match());
    assertNull(result.customLauncher());
  }

  @Test
  public void testBrowserStartCommandMatchIgnoredTrailingSpacesWhenCustomLauncherIsProvided() {
    final BrowserStringParser.Result result;

    result =
        new BrowserStringParser().parseBrowserStartCommand("iexplore",
            "*iexplore /a/custom/launcher   ");
    assertTrue(result.match());
    assertEquals("/a/custom/launcher", result.customLauncher());
  }

  @Test
  public void testBrowserStartCommandMatchPreservedSpacesWhithinCustomLauncher() {
    final BrowserStringParser.Result result;

    result =
        new BrowserStringParser().parseBrowserStartCommand("hta",
            "*hta '/a/custom/launcher with space'   ");
    assertTrue(result.match());
    assertEquals("'/a/custom/launcher with space'", result.customLauncher());
  }

}
