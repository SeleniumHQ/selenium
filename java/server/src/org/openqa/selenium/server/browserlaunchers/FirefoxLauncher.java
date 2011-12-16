/*
 * Copyright 2011 Software Freedom Conservancy.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */
package org.openqa.selenium.server.browserlaunchers;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.browserlaunchers.BrowserLauncher;
import org.openqa.selenium.browserlaunchers.locators.BrowserInstallation;
import org.openqa.selenium.browserlaunchers.locators.BrowserLocator;
import org.openqa.selenium.browserlaunchers.locators.CombinedFirefoxLocator;
import org.openqa.selenium.browserlaunchers.locators.Firefox2Locator;
import org.openqa.selenium.browserlaunchers.locators.Firefox3Locator;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.remote.BrowserType;
import org.openqa.selenium.server.ApplicationRegistry;
import org.openqa.selenium.server.RemoteControlConfiguration;

public class FirefoxLauncher implements BrowserLauncher {

  final BrowserLauncher realLauncher;

  public FirefoxLauncher(Capabilities browserOptions, RemoteControlConfiguration configuration,
      String sessionId, String browserLaunchLocation)
      throws InvalidBrowserExecutableException {
    String browserName = BrowserType.FIREFOX;
    BrowserLocator locator = new CombinedFirefoxLocator();
    String version = (String) browserOptions.getCapability(CapabilityType.VERSION);
    if ("2".equals(version)) {
      browserName = BrowserType.FIREFOX_2;
      locator = new Firefox2Locator();
    }
    if ("3".equals(version)) {
      browserName = BrowserType.FIREFOX_3;
      locator = new Firefox3Locator();
    }
    String mode = (String) browserOptions.getCapability("mode");
    if (mode == null) {
      mode = "chrome";
    }
    if ("default".equals(mode)) {
      mode = "chrome";
    }

    BrowserInstallation installation =
        ApplicationRegistry.instance().browserInstallationCache().locateBrowserInstallation(
            browserName, browserLaunchLocation, locator);

    if (installation == null) {
      throw new InvalidBrowserExecutableException(
          "The specified path to the browser executable is invalid.");
    }

    if ("chrome".equals(mode)) {
      realLauncher =
          new FirefoxChromeLauncher(browserOptions, configuration, sessionId, installation);
      return;
    }

    boolean proxyInjectionMode =
        browserOptions.is("proxyInjectionMode") || "proxyInjection".equals(mode);

    // You can't just individually configure a browser for PI mode; it's a server-level
    // configuration parameter
    boolean globalProxyInjectionMode = configuration.getProxyInjectionModeArg();
    if (proxyInjectionMode && !globalProxyInjectionMode) {
      if (proxyInjectionMode) {
        throw new RuntimeException(
            "You requested proxy injection mode, but this server wasn't configured with -proxyInjectionMode on the command line");
      }
    }

    // if user didn't request PI, but the server is configured that way, just switch up to PI
    proxyInjectionMode = globalProxyInjectionMode;
    if (proxyInjectionMode) {
      realLauncher =
          new ProxyInjectionFirefoxCustomProfileLauncher(browserOptions, configuration, sessionId,
              installation);
      return;
    }

    // the mode isn't "chrome" or "proxyInjection"; at this point it had better be
    // CapabilityType.PROXY
    if (!CapabilityType.PROXY.equals(mode)) {
      throw new RuntimeException("Unrecognized browser mode: " + mode);
    }

    realLauncher =
        new FirefoxCustomProfileLauncher(browserOptions, configuration, sessionId, installation);

  }

  public void close() {
    realLauncher.close();
  }

  public void launchHTMLSuite(String suiteUrl, String baseUrl) {
    realLauncher.launchHTMLSuite(suiteUrl, baseUrl);
  }

  public void launchRemoteSession(String url) {
    realLauncher.launchRemoteSession(url);
  }

}
