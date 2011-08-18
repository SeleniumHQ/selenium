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

import com.google.common.base.Throwables;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.browserlaunchers.AsyncExecute;
import org.openqa.selenium.browserlaunchers.locators.BrowserInstallation;
import org.openqa.selenium.browserlaunchers.LauncherUtils;
import org.openqa.selenium.browserlaunchers.WindowsProxyManager;
import org.openqa.selenium.browserlaunchers.locators.InternetExplorerLocator;
import org.openqa.selenium.os.WindowsUtils;
import org.openqa.selenium.os.CommandLine;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.server.ApplicationRegistry;
import org.openqa.selenium.server.RemoteControlConfiguration;

import java.io.File;
import java.io.IOException;
import java.util.logging.Level;
import java.util.logging.Logger;

public class InternetExplorerCustomProxyLauncher extends AbstractBrowserLauncher {

  private static final Logger log = Logger.getLogger(InternetExplorerCustomProxyLauncher.class.getName());

  private File customProxyPACDir;
  private String[] cmdarray;
  private BrowserInstallation browserInstallation;
  private Process process;
  protected boolean customPACappropriate = true;
  protected WindowsProxyManager wpm;

  private static boolean alwaysChangeMaxConnections = false;
  protected boolean changeMaxConnections = alwaysChangeMaxConnections;

  public InternetExplorerCustomProxyLauncher(Capabilities browserOptions, RemoteControlConfiguration configuration, String sessionId, String browserLaunchLocation) {
    this(browserOptions, configuration, sessionId,
        ApplicationRegistry.instance().browserInstallationCache().locateBrowserInstallation(
            "iexplore", browserLaunchLocation, new InternetExplorerLocator()));
  }

  public InternetExplorerCustomProxyLauncher(Capabilities browserOptions,
                                             RemoteControlConfiguration configuration, String sessionId, BrowserInstallation browserInstallation) {
    super(sessionId, configuration, browserOptions);
    this.browserInstallation = browserInstallation;
    this.wpm = new WindowsProxyManager(true, sessionId, getPort(), getPort());
  }

  protected void changeRegistrySettings() throws IOException {
    wpm.changeRegistrySettings(browserConfigurationOptions);
  }

  @Override
  public void launch(String url) {
    try {
      setupSystem(url);
      log.info("Launching Internet Explorer...");
      CommandLine exe = new CommandLine(cmdarray);
      process = exe.executeAsync();
    } catch (IOException e) {
      throw Throwables.propagate(e);
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
          log.log(Level.SEVERE, "Couldn't delete custom IE proxy directory", e);
          log.log(Level.SEVERE, "Perhaps IE proxy delete error was caused by this exception",
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
    wpm.restoreRegistrySettings(browserConfigurationOptions.is(
        CapabilityType.ForSeleniumServer.ENSURING_CLEAN_SESSION));
  }

  public Process getProcess() {
    return process;
  }

  public static void main(String[] args) {
    InternetExplorerCustomProxyLauncher l =
        new InternetExplorerCustomProxyLauncher(BrowserOptions.newBrowserOptions(),
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
