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
import org.apache.tools.ant.taskdefs.condition.Os;
import org.openqa.jetty.log.LogFactory;
import org.openqa.selenium.browserlaunchers.WindowsProxyManager;
import org.openqa.selenium.browserlaunchers.WindowsUtils;
import org.openqa.selenium.server.ApplicationRegistry;
import org.openqa.selenium.server.BrowserConfigurationOptions;
import org.openqa.selenium.server.RemoteControlConfiguration;
import org.openqa.selenium.server.browserlaunchers.locators.SafariLocator;

import java.io.*;


public class SafariCustomProfileLauncher extends AbstractBrowserLauncher {

  private final static Log LOGGER = LogFactory.getLog(SafariCustomProfileLauncher.class);

  private static final String REDIRECT_TO_GO_TO_SELENIUM = "redirect_to_go_to_selenium.htm";

  protected File customProfileDir;
  protected String[] cmdarray;
  private boolean closed = false;
  protected BrowserInstallation browserInstallation;
  protected Process process;
  protected WindowsProxyManager wpm;
  protected MacProxyManager mpm;
  private File backedUpCookieFile;
  private File originalCookieFile;
  private String originalCookieFilePath;

  protected static AsyncExecute exe = new AsyncExecute();

  protected BrowserInstallation locateSafari(String browserLaunchLocation) {
    return ApplicationRegistry.instance().browserInstallationCache().locateBrowserInstallation(
        "safari", browserLaunchLocation, new SafariLocator());
  }

  public SafariCustomProfileLauncher(BrowserConfigurationOptions browserOptions, RemoteControlConfiguration configuration, String sessionId, String browserLaunchLocation) {
    super(sessionId, configuration, browserOptions);

    this.browserInstallation = locateSafari(browserLaunchLocation);

    if (browserInstallation == null) {
      LOGGER.error("The specified path to the browser executable is invalid.");
      throw new InvalidBrowserExecutableException(
          "The specified path to the browser executable is invalid.");
    }

    if (configuration.shouldOverrideSystemProxy()) {
      createSystemProxyManager(sessionId);
    }
    exe.setLibraryPath(browserInstallation.libraryPath());
    customProfileDir = LauncherUtils.createCustomProfileDir(sessionId);

  }

  protected void launch(String url) {
    try {
      if (!browserConfigurationOptions.is("honorSystemProxy")) {
        setupSystemProxy();
      }

      if (browserConfigurationOptions.is("ensureCleanSession")) {
        ensureCleanSession();
      }

      launchSafari(url);
    } catch (IOException e) {
      throw new RuntimeException(e);
    }
  }

  protected void launchSafari(String url) throws IOException {
    cmdarray = new String[]{browserInstallation.launcherFilePath()};
    if (Os.isFamily("mac")) {
      final String redirectHtmlFileName;

      redirectHtmlFileName = makeRedirectionHtml(customProfileDir, url);
      LOGGER.info("Launching Safari to visit '" + url + "' via '" + redirectHtmlFileName + "'...");
      cmdarray = new String[]{
          browserInstallation.launcherFilePath(),
          redirectHtmlFileName
      };
    } else {
      LOGGER.info("Launching Safari ...");
      cmdarray = new String[]{
          browserInstallation.launcherFilePath(),
          "-url",
          url
      };
    }

    exe.setCommandline(cmdarray);
    process = exe.asyncSpawn();
  }

  public void close() {
    final int exitValue;

    if (closed) {
      return;
    }
    if (!browserConfigurationOptions.is("honorSystemProxy")) {
      restoreSystemProxy();
    }

    if (process == null) {
      return;
    }
    LOGGER.info("Killing Safari...");
    exitValue = AsyncExecute.killProcess(process);
    if (exitValue == 0) {
      LOGGER.warn("Safari seems to have ended on its own (did we kill the real browser???)");
    }
    closed = true;

    if (backedUpCookieFile != null && backedUpCookieFile.exists()) {
      File sessionCookieFile = new File(originalCookieFilePath);
      boolean success = sessionCookieFile.delete();
      if (success) {
        LOGGER.info("Session's cookie file deleted.");
      } else {
        LOGGER.info("Session's cookie *not* deleted.");
      }
      LOGGER.info("Trying to restore originalCookieFile...");
      originalCookieFile = new File(originalCookieFilePath);
      LauncherUtils.copySingleFile(backedUpCookieFile, originalCookieFile);
    }
  }

  protected void ensureCleanSession() {
    // see: http://www.macosxhints.com/article.php?story=20051107093733174&lsrc=osxh
    if (Os.isFamily("mac")) {
      String user = System.getenv("USER");
      File cacheDir = new File("/Users/" + user + "/Library/Caches/Safari");
      originalCookieFilePath = "/Users/" + user + "/Library/Cookies" + "/Cookies.plist";
      originalCookieFile = new File(originalCookieFilePath);

      LauncherUtils.deleteTryTryAgain(cacheDir, 6);
    } else {
      originalCookieFilePath =
          System.getenv("APPDATA") + "/Apple Computer/Safari/Cookies/Cookies.plist";
      originalCookieFile = new File(originalCookieFilePath);
      String localAppData = System.getenv("LOCALAPPDATA");
      if (localAppData == null) {
        localAppData = System.getenv("USERPROFILE") + "/Local Settings/Application Data";
      }
      File cacheFile = new File(localAppData + "/Apple Computer/Safari/Cache.db");
      if (cacheFile.exists()) {
        cacheFile.delete();
      }
    }

    LOGGER.info("originalCookieFilePath: " + originalCookieFilePath);

    String backedUpCookieFilePath = customProfileDir.toString() + "/Cookies.plist";
    backedUpCookieFile = new File(backedUpCookieFilePath);
    LOGGER.info("backedUpCookieFilePath: " + backedUpCookieFilePath);

    if (originalCookieFile.exists()) {
      LauncherUtils.copySingleFile(originalCookieFile, backedUpCookieFile);
      originalCookieFile.delete();
    }
  }


  protected String makeRedirectionHtml(File parentDir, String url) {
    File f = new File(parentDir, REDIRECT_TO_GO_TO_SELENIUM);
    PrintStream out = null;
    FileOutputStream fileOutputStream = null;

    try {
      fileOutputStream = new FileOutputStream(f);
      out = new PrintStream(fileOutputStream);
      out.println("<script language=\"JavaScript\">\n" +
                  "    location = \"" + url + "\"\n" +
                  "</script>\n");
    } catch (FileNotFoundException e) {
      throw new RuntimeException("troublemaking redirection HTML: " + e);
    } finally {
      if (null != out) {
        out.close();
      }
      if (null != fileOutputStream) {
        try {
          fileOutputStream.close();
        } catch (IOException e) {
          LOGGER.warn("Ignoring exception while closing HTML redirection stream", e);
        }
      }
    }
    return f.getAbsolutePath();
  }


  public Process getProcess() {
    return process;
  }

  private void setupSystemProxy() throws IOException {
    if (WindowsUtils.thisIsWindows()) {
      wpm.backupRegistrySettings();
      changeRegistrySettings();
    } else {
      mpm.backupNetworkSettings();
      mpm.changeNetworkSettings();
    }
  }

  private void restoreSystemProxy() {
    if (WindowsUtils.thisIsWindows()) {
      wpm.restoreRegistrySettings(browserConfigurationOptions.is("ensureCleanSession"));
    } else {
      mpm.restoreNetworkSettings();
    }
  }

  protected void changeRegistrySettings() throws IOException {
    wpm.changeRegistrySettings(browserConfigurationOptions.asCapabilities());
  }

  private void createSystemProxyManager(String sessionId) {
    if (WindowsUtils.thisIsWindows()) {
      wpm = new WindowsProxyManager(true, sessionId, getPort(), getPort());
    } else {
      mpm = new MacProxyManager(sessionId, getPort());
    }
  }

}
