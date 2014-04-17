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
import org.openqa.selenium.browserlaunchers.LauncherUtils;
import org.openqa.selenium.browserlaunchers.Proxies;
import org.openqa.selenium.browserlaunchers.Sleeper;
import org.openqa.selenium.browserlaunchers.locators.BrowserInstallation;
import org.openqa.selenium.browserlaunchers.locators.CombinedFirefoxLocator;
import org.openqa.selenium.os.CommandLine;
import org.openqa.selenium.remote.BrowserType;
import org.openqa.selenium.server.ApplicationRegistry;
import org.openqa.selenium.server.RemoteControlConfiguration;

import java.io.File;
import java.io.IOException;
import java.util.logging.Logger;

public class FirefoxCustomProfileLauncher extends AbstractBrowserLauncher {

  private static final Logger log = Logger.getLogger(FirefoxCustomProfileLauncher.class.getName());

  private boolean closed = false;
  private BrowserInstallation browserInstallation;
  private CommandLine process;

  private static boolean alwaysChangeMaxConnections = false;
  protected boolean changeMaxConnections = alwaysChangeMaxConnections;

  public FirefoxCustomProfileLauncher(Capabilities browserOptions,
      RemoteControlConfiguration configuration, String sessionId, String browserLaunchLocation)
      throws InvalidBrowserExecutableException {
    this(browserOptions, configuration,
        sessionId, ApplicationRegistry.instance().browserInstallationCache()
            .locateBrowserInstallation(
                BrowserType.FIREFOX_PROXY, browserLaunchLocation, new CombinedFirefoxLocator()));
    if (browserInstallation == null) {
      throw new InvalidBrowserExecutableException(
          "The specified path to the browser executable is invalid.");
    }
  }

  public FirefoxCustomProfileLauncher(Capabilities browserOptions,
      RemoteControlConfiguration configuration, String sessionId,
      BrowserInstallation browserInstallation) {
    super(sessionId, configuration, browserOptions);
    browserConfigurationOptions = Proxies.setProxyEverything(browserConfigurationOptions, false);
    browserConfigurationOptions =
        Proxies.setOnlyProxySeleniumTraffic(browserConfigurationOptions, true);
    init();
    this.browserInstallation = browserInstallation;
  }

  protected void init() {
  }

  @Override
  protected void launch(String url) {
    try {

      log.fine("customProfileDir = " + customProfileDir());
      makeCustomProfile(customProfileDir());

      String chromeURL = "chrome://killff/content/kill.html";

      CommandLine command = prepareCommand(browserInstallation.launcherFilePath(),
          "-profile", customProfileDir().getAbsolutePath(),
          "-chrome", chromeURL);

      /*
       * The first time we launch Firefox with an empty profile directory, Firefox will launch
       * itself, populate the profile directory, then kill/relaunch itself, so our process handle
       * goes out of date. So, the first time we launch Firefox, we'll start it up at an URL that
       * will immediately shut itself down.
       */
      log.info("Preparing Firefox profile...");
      command.execute();
      waitForFullProfileToBeCreated(20 * 1000);

      log.info("Launching Firefox...");
      process = prepareCommand(browserInstallation.launcherFilePath(),
          "-profile", customProfileDir().getAbsolutePath(), url);
      process.executeAsync();
    } catch (IOException e) {
      throw new RuntimeException(e);
    }
  }

  private CommandLine prepareCommand(String... commands) {
    CommandLine command = new CommandLine(commands);
    command.setDynamicLibraryPath(browserInstallation.libraryPath());
    // Set MOZ_NO_REMOTE in order to ensure we always get a new Firefox process
    // http://blog.dojotoolkit.org/2005/12/01/running-multiple-versions-of-firefox-side-by-side
    command.setEnvironmentVariable("MOZ_NO_REMOTE", "1");

    return command;
  }

  private void makeCustomProfile(File customProfileDirectory) throws IOException {
    File firefoxProfileTemplate =
        BrowserOptions.getFile(browserConfigurationOptions, "firefoxProfileTemplate");
    if (firefoxProfileTemplate != null) {
      LauncherUtils.copyDirectory(firefoxProfileTemplate, customProfileDir);
    }
    ResourceExtractor.extractResourcePath(getClass(), "/customProfileDirCUSTFF", customProfileDir);

    // Make sure that cert8.db of firefoxProfileTemplate is stored into customProfileDir
    if (firefoxProfileTemplate != null) {
      LauncherUtils.copySingleFileWithOverwrite(new File(firefoxProfileTemplate, "cert8.db"),
          new File(customProfileDir, "cert8.db"), true);
    }

    LauncherUtils.generatePacAndPrefJs(customProfileDirectory, getPort(), null,
        changeMaxConnections, getTimeout(), browserConfigurationOptions);
  }

  /** Implementation identical to that in FirefoxChromeLauncher. **/
  // TODO(jbevan): refactor?
  public void close() {
    if (closed) return;
    if (process != null) {
      killFirefoxProcess();
    }
    if (customProfileDir != null) {
      try {
        removeCustomProfileDir();
      } catch (RuntimeException e) {
        throw e;
      }
    }
    closed = true;
  }

  /** Wrapper to allow for stubbed-out testing **/
  protected void removeCustomProfileDir() throws RuntimeException {
    LauncherUtils.deleteTryTryAgain(customProfileDir, 6);
  }

  /** Wrapper to allow for stubbed-out testing **/
  protected void killFirefoxProcess() {
    log.info("Killing Firefox...");
    int exitValue = process.destroy();
    if (exitValue == 0) {
      log.warning("Firefox seems to have ended on its own (did we kill the real browser???)");
    }
  }

  // visible for testing
  protected void setCustomProfileDir(File value) {
    customProfileDir = value;
  }

  // visible for testing
  protected void setCommandLine(CommandLine p) {
    process = p;
  }

  private File customProfileDir = null;

  private File customProfileDir() {
    if (customProfileDir == null) {
      customProfileDir = LauncherUtils.createCustomProfileDir(sessionId);
    }
    return customProfileDir;
  }

  /**
   * Wait for one of the Firefox-generated files to come into existence, then wait for Firefox to
   * exit
   * 
   * @param timeout the maximum amount of time to wait for the profile to be created
   */
  private void waitForFullProfileToBeCreated(long timeout) {
    // This will be a characteristic file in the profile
    File testFile = new File(customProfileDir(), "extensions.ini");
    long start = System.currentTimeMillis();
    for (; System.currentTimeMillis() < start + timeout;) {

      Sleeper.sleepTight(500);
      if (testFile.exists()) break;
    }
    if (!testFile.exists())
      throw new RuntimeException("Timed out waiting for profile to be created!");
  }

  public static void setChangeMaxConnections(boolean changeMaxConnections) {
    FirefoxCustomProfileLauncher.alwaysChangeMaxConnections = changeMaxConnections;
  }
}
