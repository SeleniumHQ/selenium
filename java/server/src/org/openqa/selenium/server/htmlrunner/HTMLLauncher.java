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

package org.openqa.selenium.server.htmlrunner;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.browserlaunchers.Sleeper;
import org.openqa.selenium.browserlaunchers.BrowserLauncher;
import org.openqa.selenium.net.Urls;
import org.openqa.selenium.remote.BrowserType;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.server.BrowserSessionFactory.BrowserSessionInfo;
import org.openqa.selenium.server.FrameGroupCommandQueueSet;
import org.openqa.selenium.server.RemoteControlConfiguration;
import org.openqa.selenium.server.SeleniumCommandTimedOutException;
import org.openqa.selenium.server.SeleniumServer;
import org.openqa.selenium.server.browserlaunchers.BrowserLauncherFactory;
import org.openqa.selenium.server.browserlaunchers.BrowserOptions;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Runs HTML Selenium test suites.
 * 
 * 
 * @author dfabulich
 * 
 */
public class HTMLLauncher implements HTMLResultsListener {

  static Logger log = Logger.getLogger(HTMLLauncher.class.getName());
  private SeleniumServer remoteControl;
  private HTMLTestResults results;

  public HTMLLauncher(SeleniumServer remoteControl) {
    this.remoteControl = remoteControl;
  }

  /**
   * Launches a single HTML Selenium test suite.
   * 
   * @param browser - the browserString ("*firefox", "*iexplore" or an executable path)
   * @param browserURL - the start URL for the browser
   * @param suiteURL - the relative URL to the HTML suite
   * @param outputFile - The file to which we'll output the HTML results
   * @param timeoutInSeconds - the amount of time (in seconds) to wait for the browser to finish
   * @param multiWindow TODO
   * @return PASS or FAIL
   * @throws IOException if we can't write the output file
   */
  public String runHTMLSuite(String browser, String browserURL, String suiteURL, File outputFile,
      long timeoutInSeconds, boolean multiWindow) throws IOException {
    return runHTMLSuite(browser, browserURL, suiteURL, outputFile,
        timeoutInSeconds, multiWindow, "info");
  }

  protected BrowserLauncher getBrowserLauncher(String browser, String sessionId,
      RemoteControlConfiguration configuration, Capabilities browserOptions) {
    BrowserLauncherFactory blf = new BrowserLauncherFactory();
    return blf.getBrowserLauncher(browser, sessionId, configuration, browserOptions);
  }

  protected void sleepTight(long timeoutInMs) {
    long now = System.currentTimeMillis();
    long end = now + timeoutInMs;
    while (results == null && System.currentTimeMillis() < end) {
      Sleeper.sleepTight(500);
    }
  }

  protected FileWriter getFileWriter(File outputFile) throws IOException {
    return new FileWriter(outputFile);
  }

  protected void writeResults(File outputFile) throws IOException {
    if (outputFile != null) {
      FileWriter fw = getFileWriter(outputFile);
      results.write(fw);
      fw.close();
    }
  }

  /**
   * Launches a single HTML Selenium test suite.
   * 
   * @param browser - the browserString ("*firefox", "*iexplore" or an executable path)
   * @param browserURL - the start URL for the browser
   * @param suiteURL - the relative URL to the HTML suite
   * @param outputFile - The file to which we'll output the HTML results
   * @param multiWindow TODO
   * @param defaultLogLevel TODO
   * @param timeoutInSeconds - the amount of time (in seconds) to wait for the browser to finish
   * @return PASS or FAIL
   * @throws IOException if we can't write the output file
   */
  private String runHTMLSuite(String browser, String browserURL, String suiteURL, File outputFile,
      long timeoutInSeconds, boolean multiWindow, String defaultLogLevel) throws IOException {
    outputFile.createNewFile();
    if (!outputFile.canWrite()) {
      throw new IOException("Can't write to outputFile: " + outputFile.getAbsolutePath());
    }
    long timeoutInMs = 1000l * timeoutInSeconds;
    if (timeoutInMs < 0) {
      log.warning("Looks like the timeout overflowed, so resetting it to the maximum.");
      timeoutInMs = Long.MAX_VALUE;
    }

    RemoteControlConfiguration configuration = remoteControl.getConfiguration();
    remoteControl.handleHTMLRunnerResults(this);

    String sessionId = Long.toString(System.currentTimeMillis() % 1000000);
    FrameGroupCommandQueueSet.makeQueueSet(
        sessionId, configuration.getPortDriversShouldContact(), configuration);

    Capabilities browserOptions =
        configuration.copySettingsIntoBrowserOptions(new DesiredCapabilities());
    browserOptions = BrowserOptions.setSingleWindow(browserOptions, !multiWindow);

    BrowserLauncher launcher =
        getBrowserLauncher(browser, sessionId, configuration, browserOptions);
    BrowserSessionInfo sessionInfo = new BrowserSessionInfo(sessionId,
        browser, browserURL, launcher, null);

    remoteControl.registerBrowserSession(sessionInfo);

    // JB: -- aren't these URLs in the wrong order according to declaration?
    launcher.launchHTMLSuite(suiteURL, browserURL);

    sleepTight(timeoutInMs);

    launcher.close();

    remoteControl.deregisterBrowserSession(sessionInfo);

    if (results == null) {
      throw new SeleniumCommandTimedOutException();
    }

    writeResults(outputFile);

    return results.getResult().toUpperCase();
  }

  /**
   * Launches a single HTML Selenium test suite.
   * 
   * @param browser - the browserString ("*firefox", "*iexplore" or an executable path)
   * @param browserURL - the start URL for the browser
   * @param suiteFile - a file containing the HTML suite to run
   * @param outputFile - The file to which we'll output the HTML results
   * @param timeoutInSeconds - the amount of time (in seconds) to wait for the browser to finish
   * @param multiWindow - whether to run the browser in multiWindow or else framed mode
   * @return PASSED or FAIL
   * @throws IOException if we can't write the output file
   */
  public String runHTMLSuite(String browser, String browserURL, File suiteFile, File outputFile,
      long timeoutInSeconds, boolean multiWindow) throws IOException {
    if (browser == null) throw new IllegalArgumentException("browser may not be null");
    if (!suiteFile.exists()) {
      throw new IOException("Can't find HTML Suite file:" + suiteFile.getAbsolutePath());
    }
    if (!suiteFile.canRead()) {
      throw new IOException("Can't read HTML Suite file: " + suiteFile.getAbsolutePath());
    }
    remoteControl.addNewStaticContent(suiteFile.getParentFile());

    // DGF this is a hack, but I can't find a better place to put it
    String suiteURL;
    if (browser.startsWith("*chrome") || browser.startsWith("*firefox") ||
        browser.startsWith("*iehta") || browser.startsWith("*iexplore")) {
      suiteURL =
          "http://localhost:" + remoteControl.getConfiguration().getPortDriversShouldContact() +
              "/selenium-server/tests/" + suiteFile.getName();
    } else {
      suiteURL =
          Urls.toProtocolHostAndPort(browserURL) + "/selenium-server/tests/" + suiteFile.getName();
    }
    return runHTMLSuite(browser, browserURL, suiteURL, outputFile, timeoutInSeconds, multiWindow,
        "info");
  }


  /** Accepts HTMLTestResults for later asynchronous handling */
  public void processResults(HTMLTestResults resultsParm) {
    this.results = resultsParm;
  }

  public static int mainInt(String... args) throws Exception {
    if (args.length != 5 && args.length != 4) {
      throw new IllegalAccessException(
          "Usage: HTMLLauncher outputDir testSuite startUrl multiWindow browser");
    }

    File dir = new File(args[0]);
    if (!dir.exists() && !dir.mkdirs()) {
      throw new RuntimeException("Cannot create output directory for: " + dir);
    }

    String suite = args[1];
    String startURL = args[2];
    boolean multiWindow = Boolean.parseBoolean(args[3]);
    String[] browsers;
    if (args.length == 4) {
      log.info("Running self tests");
      browsers = new String[] {BrowserType.FIREFOX, BrowserType.IEXPLORE_PROXY, BrowserType.OPERA, BrowserType.CHROME};
    } else {
      browsers = new String[] {args[4]};
    }

    SeleniumServer server = new SeleniumServer(false, new RemoteControlConfiguration());
    server.start();
    HTMLLauncher launcher = new HTMLLauncher(server);

    boolean passed = true;
    for (String browser : browsers) {
      // Turns out that Windows doesn't like "*" in a path name
      File results = new File(dir, browser.substring(1) + ".results");
      String result = "FAILED";

      try {
        result = launcher.runHTMLSuite(browser, startURL, suite, results, 600, multiWindow);
        passed &= "PASSED".equals(result);
      } catch (Throwable e) {
        log.log(Level.WARNING, "Test of browser failed: " + browser, e);
        passed = false;
      }
    }
    server.stop();

    return passed ? 1 : 0;
  }

  public static void main(String[] args) throws Exception {
    System.exit(mainInt(args));
  }

  public HTMLTestResults getResults() {
    return results;
  }

  public void setResults(HTMLTestResults results) {
    this.results = results;
  }
}
