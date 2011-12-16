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
import org.openqa.selenium.browserlaunchers.locators.Firefox3Locator;
import org.openqa.selenium.server.ApplicationRegistry;
import org.openqa.selenium.server.RemoteControlConfiguration;

public class Firefox3Launcher extends FirefoxChromeLauncher {

  public Firefox3Launcher(Capabilities browserOptions, RemoteControlConfiguration configuration,
      String sessionId, String browserLaunchLocation) {
    super(browserOptions, configuration,
        sessionId,
        ApplicationRegistry.instance().browserInstallationCache().locateBrowserInstallation(
            "firefox3", browserLaunchLocation, new Firefox3Locator()));
  }

}
