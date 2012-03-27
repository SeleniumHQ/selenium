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

import com.google.common.base.Throwables;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.browserlaunchers.Sleeper;
import org.openqa.selenium.browserlaunchers.WindowsProxyManager;
import org.openqa.selenium.browserlaunchers.locators.BrowserInstallation;
import org.openqa.selenium.browserlaunchers.locators.InternetExplorerLocator;
import org.openqa.selenium.os.WindowsUtils;
import org.openqa.selenium.os.WindowsProcessGroup;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.server.ApplicationRegistry;
import org.openqa.selenium.server.RemoteControlConfiguration;

import java.io.IOException;
import java.util.logging.Logger;

public class InternetExplorerCustomProxyLauncher extends AbstractBrowserLauncher {

  private static final Logger log = Logger.getLogger(InternetExplorerCustomProxyLauncher.class
      .getName());

  private String exe;
  private String[] args;
  private BrowserInstallation browserInstallation;
  private WindowsProcessGroup process;
  protected boolean customPACappropriate = true;
  protected WindowsProxyManager wpm;

  private static boolean alwaysChangeMaxConnections = false;
  protected boolean changeMaxConnections = alwaysChangeMaxConnections;

  public InternetExplorerCustomProxyLauncher(Capabilities browserOptions,
      RemoteControlConfiguration configuration, String sessionId, String browserLaunchLocation) {
    this(browserOptions, configuration, sessionId,
        ApplicationRegistry.instance().browserInstallationCache().locateBrowserInstallation(
            "iexplore", browserLaunchLocation, new InternetExplorerLocator()));
  }

  public InternetExplorerCustomProxyLauncher(Capabilities browserOptions,
      RemoteControlConfiguration configuration, String sessionId,
      BrowserInstallation browserInstallation) {
    super(sessionId, configuration, browserOptions);
    this.browserInstallation = browserInstallation;
    this.wpm = new WindowsProxyManager(true, sessionId, getPort(), getPort());
  }

  protected void changeRegistrySettings() {
    wpm.changeRegistrySettings(browserConfigurationOptions);
  }

  @Override
  public void launch(String url) {
    try {
      setupSystem(url);
    } catch (IOException e) {
      throw Throwables.propagate(e);
    }
    log.info("Launching Internet Explorer...");

    process = new WindowsProcessGroup(exe, args);
    process.executeAsync();
  }

  private void setupSystem(String url) throws IOException {
    if (WindowsUtils.thisIsWindows()) {

      if (!browserConfigurationOptions.is("honorSystemProxy")) {
        setupSystemProxy();
      }
      exe = browserInstallation.launcherFilePath();

      args = new String[] {
          "-new",
          url
      };
    } else {
      // DGF IEs4Linux, perhaps? It could happen!
      args = new String[] {
          url
      };
    }
  }

  public void close() {
    if (WindowsUtils.thisIsWindows()) {
      if (!browserConfigurationOptions.is("honorSystemProxy")) {
        try {
          restoreSystemProxy();
        } catch (RuntimeException e) {
          log.warning("Unable to restore original system proxy settings");
          // But we should still valiantly attempt to close the browser
        }
      }
    }
    if (process == null) {
      return;
    }
    if (browserConfigurationOptions.is("killProcessesByName")) {
      WindowsUtils.tryToKillByName("iexplore.exe");
    }
    process.destroy();
  }

  private void restoreSystemProxy() {
    wpm.restoreRegistrySettings(browserConfigurationOptions.is(
        CapabilityType.ForSeleniumServer.ENSURING_CLEAN_SESSION));
  }

  public static void main(String[] args) {
    InternetExplorerCustomProxyLauncher l =
        new InternetExplorerCustomProxyLauncher(BrowserOptions.newBrowserOptions(),
            new RemoteControlConfiguration(), "CUSTIE", (String) null);
    l.launch("http://www.google.com/");
    int seconds = 5;
    System.out.println("Killing browser in " + Integer.toString(seconds) + " seconds");
    Sleeper.sleepTight(seconds * 1000);
    l.close();
    System.out.println("He's dead now, right?");
  }


  public static void setChangeMaxConnections(boolean changeMaxConnections) {
    InternetExplorerCustomProxyLauncher.alwaysChangeMaxConnections = changeMaxConnections;
  }

  private void setupSystemProxy() {
    wpm.backupRegistrySettings();
    changeRegistrySettings();
  }


}
