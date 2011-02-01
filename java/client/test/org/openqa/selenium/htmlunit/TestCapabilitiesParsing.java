/*
Copyright 2007-2011 WebDriver committers

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

package org.openqa.selenium.htmlunit;

import com.gargoylesoftware.htmlunit.BrowserVersion;

import junit.framework.TestCase;

import org.openqa.selenium.Platform;
import org.openqa.selenium.remote.DesiredCapabilities;

/**
 * Test the determineBrowserVersion method.
 */
public class TestCapabilitiesParsing extends TestCase {
  public void testConfigurationViaDirectCapabilities() {
    DesiredCapabilities ie7Capabilities =
        new DesiredCapabilities("internet explorer", "7", Platform.ANY);

    assertEquals(HtmlUnitDriver.determineBrowserVersion(ie7Capabilities),
        BrowserVersion.INTERNET_EXPLORER_7);

    DesiredCapabilities ieCapabilities =
        new DesiredCapabilities("internet explorer", "", Platform.ANY);

    assertEquals(HtmlUnitDriver.determineBrowserVersion(ieCapabilities),
        BrowserVersion.INTERNET_EXPLORER_8);

    DesiredCapabilities firefoxCapabilities =
        new DesiredCapabilities("firefox", "", Platform.ANY);

    assertEquals(HtmlUnitDriver.determineBrowserVersion(firefoxCapabilities),
        BrowserVersion.FIREFOX_3);
  }

  public void testConfigurationOfFirefoxViaRemote() {
    DesiredCapabilities firefoxCapabilities =
        new DesiredCapabilities("htmlunit", "firefox", Platform.ANY);

    assertEquals(HtmlUnitDriver.determineBrowserVersion(firefoxCapabilities),
        BrowserVersion.FIREFOX_3);
  }

  public void testConfigurationOfIEViaRemote() {
    DesiredCapabilities ieCapabilities =
        new DesiredCapabilities("htmlunit", "internet explorer", Platform.ANY);

    assertEquals(HtmlUnitDriver.determineBrowserVersion(ieCapabilities),
        BrowserVersion.INTERNET_EXPLORER_8);

    DesiredCapabilities ie7Capabilities =
        new DesiredCapabilities("htmlunit", "internet explorer-7", Platform.ANY);

    assertEquals(HtmlUnitDriver.determineBrowserVersion(ie7Capabilities),
        BrowserVersion.INTERNET_EXPLORER_7);
  }

}
