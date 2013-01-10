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
import org.openqa.selenium.Platform;
import org.openqa.selenium.browserlaunchers.Sleeper;
import org.openqa.selenium.browserlaunchers.LauncherUtils;
import org.openqa.selenium.browserlaunchers.Proxies;
import org.openqa.selenium.os.CommandLine;
import org.openqa.selenium.os.WindowsUtils;
import org.openqa.selenium.server.RemoteControlConfiguration;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.PrintStream;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Pattern;

public class OperaCustomProfileLauncher extends AbstractBrowserLauncher {

  static Logger log = Logger.getLogger(OperaCustomProfileLauncher.class.getName());
  // TODO What is this really?
  private static final String DEFAULT_NONWINDOWS_LOCATION =
      "/Applications/Opera.app/Contents/MacOS/opera";

  private static boolean simple = false;

  private File customProfileDir;
  private String[] cmdarray;
  private boolean closed = false;
  private String commandPath;
  private CommandLine process;

  // Opera has been a real pain for me (Lightbody), and so I'm adding a simple hook in the browser
  // launcher that lets
  // me define, in an amazingly ghetto way, define additional browser settings to write out to the
  // ini file. For
  // example, I will use this to pre-determine the window size and location simply because it
  // appears Opera 9.2
  // has a regression in which window.resizeTo() and window.moveTo() simply do not work!
  private static String additionalSettings = "";

  protected File locateBinaryInPath(String commandPath) {
    return new File(CommandLine.find(commandPath));
  }

  public OperaCustomProfileLauncher(Capabilities browserOptions,
      RemoteControlConfiguration configuration, String sessionId, String browserLaunchLocation) {
    super(sessionId, configuration, browserOptions);
    commandPath =
        browserLaunchLocation == null ? findBrowserLaunchLocation() : browserLaunchLocation;
    this.sessionId = sessionId;
  }

  private void getOperaBinary(CommandLine command) {
    if (!WindowsUtils.thisIsWindows()) {
      // On unix, add command's directory to LD_LIBRARY_PATH
      File operaBin = locateBinaryInPath(commandPath);
      if (operaBin == null) {
        File execDirect = new File(commandPath);
        if (execDirect.isAbsolute() && execDirect.exists()) operaBin = execDirect;
      }

      String libPathKey = CommandLine.getLibraryPathPropertyName();
      String libPath = WindowsUtils.loadEnvironment().getProperty(libPathKey);
      command.setEnvironmentVariable(libPathKey, libPath + ":" + operaBin.getParent());
    }
  }


  public static void setAdditionalSettings(String additionalSettings) {
    OperaCustomProfileLauncher.additionalSettings = additionalSettings;
  }

  protected String findBrowserLaunchLocation() {
    String defaultPath = System.getProperty("operaDefaultPath");
    if (defaultPath == null) {
      if (WindowsUtils.thisIsWindows()) {
        defaultPath = WindowsUtils.getProgramFilesPath() + "\\Opera\\opera.exe";
      } else {
        defaultPath = DEFAULT_NONWINDOWS_LOCATION;
      }
    }
    File defaultLocation = new File(defaultPath);
    if (defaultLocation.exists()) {
      return defaultLocation.getAbsolutePath();
    }
    String operaBin = CommandLine.find("opera");
    if (operaBin != null) return operaBin;
    throw new RuntimeException("Opera could not be found in the path!\n" +
        "Please add the directory containing opera.exe to your PATH environment\n" +
        "variable, or explicitly specify a path to Opera like this:\n *opera " +
        (Platform.getCurrent().is(Platform.WINDOWS) ? "/blah/blah/opera" : "C:\\blah\\opera.exe"));
  }

  static final Pattern JAVA_STYLE_UNC_URL = Pattern.compile("^file:////([^/]+/.*)$");
  static final Pattern JAVA_STYLE_LOCAL_URL = Pattern.compile("^file:/([A-Z]:/.*)$");

  @Override
  protected void launch(String url) {
    try {
      File opera6ini = makeCustomProfile();

      log.info("Launching Opera...");
      if (WindowsUtils.thisIsWindows()) {
        cmdarray = new String[] {commandPath, "/settings", opera6ini.getAbsolutePath(), url};
      } else {
        cmdarray =
            new String[] {commandPath, "-nosession", "-personaldir",
                opera6ini.getParentFile().getAbsolutePath(), url};
      }


      process = new CommandLine(cmdarray);
      process.setEnvironmentVariable("MOZ_NO_REMOTE", "1");
      getOperaBinary(process);

      process.executeAsync();
    } catch (IOException e) {
      throw new RuntimeException(e);
    }
  }


  private File makeCustomProfile() throws IOException {
    customProfileDir = LauncherUtils.createCustomProfileDir(sessionId);
    ResourceExtractor.extractResourcePath(getClass(), "/opera", customProfileDir);

    if (simple) return customProfileDir;

    File proxyPAC = Proxies
        .makeProxyPAC(customProfileDir, getPort(), browserConfigurationOptions);

    // TODO Do we want to make these preferences configurable somehow?
    File opera6ini = new File(customProfileDir, "opera6.ini");

    PrintStream out = new PrintStream(new FileOutputStream(opera6ini));
    // Configure us as the local proxy
    // TODO Proxy.pac file doesn't seem to want to work correctly
    // browser starts and just sits there on a blank page!

    out.println("[Proxy]");
    out.println("HTTP server=localhost:" + getPort());
    out.println("Enable HTTP 1.1 for proxy=1");
    out.println("Use Proxy On Local Names Check=1");
    out.println("Use HTTP=1"); // TODO This forces the proxy to be used all the time!
    out.println("Use HTTPS=1");
    out.println("Use FTP=0");
    out.println("Use GOPHER=0");
    out.println("Use WAIS=0");
    out.println("Use Automatic Proxy Configuration=0");
    out.println("HTTPS server=localhost:" + getPort());
    out.println("FTP server=localhost:" + getPort());
    out.println("Gopher server=localhost:" + getPort());
    out.println("WAIS server");
    out.println("Automatic Proxy Configuration URL=" + proxyPAC.getAbsolutePath());
    out.println("No Proxy Servers");
    out.println("No Proxy Servers Check=0");

    out.println("");
    out.println("[Cache]");
    out.println("Cache Docs=0");
    out.println("Document=0");
    out.println("Figure=0");
    out.println("Cache Figs=0");

    out.println("");
    out.println("[Disk Cache]");
    out.println("Cache Docs=0");
    out.println("Enabled=0");
    out.println("Size=0");
    out.println("Docs Modification=1");
    out.println("Figs Modification=1");
    out.println("Other Modification=1");

    out.println("");
    out.println("[State]");
    out.println("Run=0");

    // Accept License (unix only)
    out.println("Accept License=1");

    out.println("[User Prefs]");
    out.println("Automatic RAM Cache=0");
    // Put our Opera profile in the custom profile dir
    out.println("Opera Directory=" + customProfileDir.getAbsolutePath());
    out.println("Shown First Time Setup=1");
    out.println("One Time Page=");
    out.println("Show Setupdialog On Start=0");
    // Disable "do you want to remember this password?"
    out.println("Enable Wand=0");
    // Disable pop-up blocking
    out.println("Ignore Unrequested Popups=0");
    // Don't ask if we want to switch default browsers
    out.println("Show Default Browser Dialog=0");
    out.println("Check For New Opera=0");
    out.println("Show Startup Dialog=0");
    // Don't open any pages on startup (except for command line URL)
    out.println("Startup Type=4");

    // Don't tell us KDE detected (unix only)
    out.println("Has Shown KDE Shortcut Message=1");

    // new windows mode
    out.println("SDI=1");

    out.println("Maximize New Windows=3");

    out.println(additionalSettings);

    out.println("[Install]");
    out.println("HELLO=NO");
    out.println("Newest Used Version=2000");

    // TODO Disable security warnings

    out.close();
    return opera6ini;
  }

  public void close() {
    if (closed) return;
    if (process == null) return;
    log.info("Killing Opera...");
    Exception taskKillException = null;
    Exception fileLockException = null;
    if (false) {
      try {
        // try to kill with windows taskkill
        WindowsUtils.kill(cmdarray);
      } catch (Exception e) {
        taskKillException = e;
      }
    }
    int exitValue = process.destroy();
    if (exitValue == 0) {
      log.warning("Opera seems to have ended on its own (did we kill the real browser???)");
    }
    try {
      waitForFileLockToGoAway(5 * 000, 500);
    } catch (FileLockRemainedException e1) {
      fileLockException = e1;
    }


    try {
      LauncherUtils.deleteTryTryAgain(customProfileDir, 6);
    } catch (RuntimeException e) {
      if (taskKillException != null || fileLockException != null) {
        log.log(Level.SEVERE, "Couldn't delete custom Opera profile directory", e);
        log.severe("Perhaps caused by this exception:");
        if (taskKillException != null)
          log.log(Level.SEVERE, "Perhaps caused by this exception:", taskKillException);
        if (fileLockException != null)
          log.log(Level.SEVERE, "Perhaps caused by this exception:", fileLockException);
        throw new RuntimeException("Couldn't delete custom Opera " +
            "profile directory, presumably because task kill failed; " +
            "see error log!", e);
      }
      throw e;
    }
    closed = true;
  }

  /**
   * Opera knows it's running by using a "parent.lock" file in the profile directory. Wait for this
   * file to go away (and stay gone)
   * 
   * @param timeout max time to wait for the file to go away
   * @param timeToWait minimum time to wait to make sure the file is gone
   * @throws FileLockRemainedException
   */
  private void waitForFileLockToGoAway(long timeout, long timeToWait)
      throws FileLockRemainedException {
    File lock = new File(customProfileDir, "parent.lock");
    for (long start = System.currentTimeMillis(); System.currentTimeMillis() < start + timeout;) {
      Sleeper.sleepTight(500);
      if (!lock.exists() && makeSureFileLockRemainsGone(lock, timeToWait)) return;
    }
    if (lock.exists())
      throw new FileLockRemainedException("Lock file still present! " + lock.getAbsolutePath());
  }

  /**
   * When initializing the profile, Opera rapidly starts, stops, restarts and stops again; we need
   * to wait a bit to make sure the file lock is really gone.
   * 
   * @param lock the parent.lock file in the profile directory
   * @param timeToWait minimum time to wait to see if the file shows back up again. This is not a
   *        timeout; we will always wait this amount of time or more.
   * @return true if the file stayed gone for the entire timeToWait; false if the file exists (or
   *         came back)
   */
  private boolean makeSureFileLockRemainsGone(File lock, long timeToWait) {
    for (long start = System.currentTimeMillis(); System.currentTimeMillis() < start + timeToWait;) {
      Sleeper.sleepTight(500);
      if (lock.exists()) return false;
    }
    return !lock.exists();
  }

  public static void main(String[] args) throws Exception {
    OperaCustomProfileLauncher l =
        new OperaCustomProfileLauncher(BrowserOptions.newBrowserOptions(),
            new RemoteControlConfiguration(), "CUSTFF", null);
    l.launch("http://www.google.com");
    int seconds = 15;
    System.out.println("Killing browser in " + Integer.toString(seconds) + " seconds");
    Sleeper.sleepTight(seconds * 1000);
    l.close();
    System.out.println("He's dead now, right?");
  }

  private class FileLockRemainedException extends Exception {
    FileLockRemainedException(String message) {
      super(message);
    }
  }

  public String getCommandPath() {
    return commandPath;
  }

  public void setCommandPath(String commandPath) {
    this.commandPath = commandPath;
  }
}
