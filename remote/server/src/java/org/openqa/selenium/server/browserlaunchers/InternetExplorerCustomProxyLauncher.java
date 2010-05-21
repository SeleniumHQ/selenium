/*
 * Copyright 2006 ThoughtWorks, Inc.
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

import org.apache.commons.logging.Log;
import org.openqa.jetty.log.LogFactory;
import org.openqa.selenium.browserlaunchers.WindowsProxyManager;
import org.openqa.selenium.browserlaunchers.WindowsUtils;
import org.openqa.selenium.server.ApplicationRegistry;
import org.openqa.selenium.server.BrowserConfigurationOptions;
import org.openqa.selenium.server.RemoteControlConfiguration;
import org.openqa.selenium.server.browserlaunchers.locators.InternetExplorerLocator;

import java.io.File;
import java.io.IOException;

public class InternetExplorerCustomProxyLauncher extends AbstractBrowserLauncher {

  private static final Log LOGGER = LogFactory.getLog(InternetExplorerCustomProxyLauncher.class);

  private File customProxyPACDir;
  private String[] cmdarray;
  private BrowserInstallation browserInstallation;
  private Process process;
  protected boolean customPACappropriate = true;
  protected WindowsProxyManager wpm;

  private static boolean alwaysChangeMaxConnections = false;
  protected boolean changeMaxConnections = alwaysChangeMaxConnections;

  public InternetExplorerCustomProxyLauncher(BrowserConfigurationOptions browserOptions, RemoteControlConfiguration configuration, String sessionId, String browserLaunchLocation) {
    this(browserOptions, configuration, sessionId,
        ApplicationRegistry.instance().browserInstallationCache().locateBrowserInstallation(
            "iexplore", browserLaunchLocation, new InternetExplorerLocator()));
  }

  public InternetExplorerCustomProxyLauncher(BrowserConfigurationOptions browserOptions,
                                             RemoteControlConfiguration configuration, String sessionId, BrowserInstallation browserInstallation) {
    super(sessionId, configuration, browserOptions);
    this.browserInstallation = browserInstallation;
    this.wpm = new WindowsProxyManager(true, sessionId, getPort(), getPort());
  }

  protected void changeRegistrySettings() throws IOException {
    wpm.changeRegistrySettings(browserConfigurationOptions.asCapabilities());
  }

  @Override
  public void launch(String url) {
    final AsyncExecute exe;

    try {
      setupSystem(url);
      LOGGER.info("Launching Internet Explorer...");
      exe = new AsyncExecute();
      exe.setCommandline(cmdarray);
      process = exe.asyncSpawn();
    } catch (IOException e) {
      throw new RuntimeException(e);
    }
  }

  private void setupSystem(String url) throws IOException {
    if (WindowsUtils.thisIsWindows()) {
      final File killableProcessWrapper;

      if (!browserConfigurationOptions.is("honorSystemProxy")) {
        setupSystemProxy();
      }
      customProxyPACDir = wpm.getCustomProxyPACDir();
      killableProcessWrapper = new File(customProxyPACDir, "killableprocess.exe");
      ResourceExtractor.extractResourcePath(InternetExplorerCustomProxyLauncher.class,
          "/killableprocess/killableprocess.exe", killableProcessWrapper);
      cmdarray = new String[]{
          killableProcessWrapper.getAbsolutePath(),
          browserInstallation.launcherFilePath(),
          "-new",
          url
      };
    } else {
      // DGF IEs4Linux, perhaps?  It could happen!
      cmdarray = new String[]{
          browserInstallation.launcherFilePath(),
          url
      };
    }
  }

  public void close() {
    Exception taskKillException = null;
    if (WindowsUtils.thisIsWindows()) {
      if (!browserConfigurationOptions.is("honorSystemProxy")) {
        restoreSystemProxy();
      }
    }
    if (process == null) {
      return;
    }
    if (browserConfigurationOptions.is("killProcessesByName")) {
      WindowsUtils.tryToKillByName("iexplore.exe");
    }
    try { // DGF killableprocess.exe should commit suicide if we send it a newline
      process.getOutputStream().write('\n');
      process.getOutputStream().flush();
      Thread.sleep(200);
    } catch (Exception ignored) {
    }
    AsyncExecute.killProcess(process);
    if (customPACappropriate) {
      try {
        LauncherUtils.recursivelyDeleteDir(customProxyPACDir);
      } catch (RuntimeException e) {
        if (taskKillException != null) {
          LOGGER.error("Couldn't delete custom IE proxy directory", e);
          LOGGER.error("Perhaps IE proxy delete error was caused by this exception",
              taskKillException);
          throw new RuntimeException("Couldn't delete custom IE " +
                                     "proxy directory, presumably because task kill failed; " +
                                     "see error log!", e);
        }
        throw e;
      }
    }
  }

  private void restoreSystemProxy() {
    wpm.restoreRegistrySettings(browserConfigurationOptions.is("ensureCleanSession"));
  }

  public Process getProcess() {
    return process;
  }

  public static void main(String[] args) {
    InternetExplorerCustomProxyLauncher l =
        new InternetExplorerCustomProxyLauncher(new BrowserConfigurationOptions(),
            new RemoteControlConfiguration(), "CUSTIE", (String) null);
    l.launch("http://www.google.com/");
    int seconds = 5;
    System.out.println("Killing browser in " + Integer.toString(seconds) + " seconds");
    AsyncExecute.sleepTight(seconds * 1000);
    l.close();
    System.out.println("He's dead now, right?");
  }


  public static void setChangeMaxConnections(boolean changeMaxConnections) {
    InternetExplorerCustomProxyLauncher.alwaysChangeMaxConnections = changeMaxConnections;
  }

  private void setupSystemProxy() throws IOException {
    wpm.backupRegistrySettings();
    changeRegistrySettings();
  }


}
