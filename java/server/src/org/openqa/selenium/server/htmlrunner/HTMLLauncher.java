// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

package org.openqa.selenium.server.htmlrunner;

import static org.openqa.selenium.firefox.FirefoxDriver.MARIONETTE;

import com.thoughtworks.selenium.Selenium;
import com.thoughtworks.selenium.webdriven.WebDriverBackedSelenium;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.edge.EdgeDriver;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.ie.InternetExplorerDriver;
import org.openqa.selenium.internal.SocketLock;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.opera.OperaDriver;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.safari.SafariDriver;
import org.seleniumhq.jetty9.server.Connector;
import org.seleniumhq.jetty9.server.HttpConfiguration;
import org.seleniumhq.jetty9.server.HttpConnectionFactory;
import org.seleniumhq.jetty9.server.Server;
import org.seleniumhq.jetty9.server.ServerConnector;
import org.seleniumhq.jetty9.server.handler.ContextHandler;
import org.seleniumhq.jetty9.server.handler.ResourceHandler;
import org.seleniumhq.jetty9.util.resource.Resource;

import java.io.File;
import java.io.IOException;
import java.io.Writer;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLConnection;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
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

  //    java -jar selenium-server-standalone-<version-number>.jar -htmlSuite "*firefox"
  //    "http://www.google.com" "c:\absolute\path\to\my\HTMLSuite.html"
  //    "c:\absolute\path\to\my\results.html"
  private static Logger log = Logger.getLogger(HTMLLauncher.class.getName());

  private Server server;
//  private HTMLTestResults results;

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

//  protected BrowserLauncher getBrowserLauncher(String browser, String sessionId,
//      RemoteControlConfiguration configuration, Capabilities browserOptions) {
//    BrowserLauncherFactory blf = new BrowserLauncherFactory();
//    return blf.getBrowserLauncher(browser, sessionId, configuration, browserOptions);
//  }
//
//  protected void sleepTight(long timeoutInMs) {
//    long now = System.currentTimeMillis();
//    long end = now + timeoutInMs;
//    while (results == null && System.currentTimeMillis() < end) {
//      Sleeper.sleepTight(500);
//    }
//  }
//
//  protected FileWriter getFileWriter(File outputFile) throws IOException {
//    return new FileWriter(outputFile);
//  }
//
//  protected void writeResults(File outputFile) throws IOException {
//    if (outputFile != null) {
//      FileWriter fw = getFileWriter(outputFile);
//      results.write(fw);
//      fw.close();
//    }
//  }

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
    File parent = outputFile.getParentFile();
    if (parent != null && !parent.exists()) {
      parent.mkdirs();
    }
    if (outputFile.exists() && !outputFile.canWrite()) {
      throw new IOException("Can't write to outputFile: " + outputFile.getAbsolutePath());
    }
    long timeoutInMs = 1000L * timeoutInSeconds;
    if (timeoutInMs < 0) {
      log.warning("Looks like the timeout overflowed, so resetting it to the maximum.");
      timeoutInMs = Long.MAX_VALUE;
    }

    WebDriver driver = null;
    try {
      driver = createDriver(browser);
      URL suiteUrl = determineSuiteUrl(browserURL, suiteURL);

      driver.get(suiteUrl.toString());
      Selenium selenium = new WebDriverBackedSelenium(driver, browserURL);
      List<WebElement> allTables = driver.findElements(By.id("suiteTable"));
      if (allTables.isEmpty()) {
        throw new RuntimeException("Unable to find suite table: " + driver.getPageSource());
      }
      Results results = new CoreTestSuite(suiteUrl.toString()).run(driver, selenium);

      HTMLTestResults htmlResults = results.toSuiteResult();
      try (Writer writer = Files.newBufferedWriter(outputFile.toPath())) {
        htmlResults.write(writer);
      }

      return results.isSuccessful() ? "PASSED" : "FAILED";
    } finally {
      if (server != null) {
        try {
          server.stop();
        } catch (Exception e) {
          // Nothing sane to do. Log the error and carry on
          log.log(Level.INFO, "Exception shutting down server. You may ignore this.", e);
        }
      }

      if (driver != null) {
        driver.quit();
      }
    }

//    if (results == null) {
//      throw new SeleniumCommandTimedOutException();
//    }
//
//    writeResults(outputFile);
//
//    return results.getResult().toUpperCase();
    }
//
//  /**
//   * Launches a single HTML Selenium test suite.
//   *
//   * @param browser - the browserString ("*firefox", "*iexplore" or an executable path)
//   * @param browserURL - the start URL for the browser
//   * @param suiteFile - a file containing the HTML suite to run
//   * @param outputFile - The file to which we'll output the HTML results
//   * @param timeoutInSeconds - the amount of time (in seconds) to wait for the browser to finish
//   * @param multiWindow - whether to run the browser in multiWindow or else framed mode
//   * @return PASSED or FAIL
//   * @throws IOException if we can't write the output file
//   */
//  public String runHTMLSuite(String browser, String browserURL, File suiteFile, File outputFile,
//      long timeoutInSeconds, boolean multiWindow) throws IOException {
//    if (browser == null) throw new IllegalArgumentException("browser may not be null");
//    if (!suiteFile.exists()) {
//      throw new IOException("Can't find HTML Suite file:" + suiteFile.getAbsolutePath());
//    }
//    if (!suiteFile.canRead()) {
//      throw new IOException("Can't read HTML Suite file: " + suiteFile.getAbsolutePath());
//    }
//    remoteControl.addNewStaticContent(suiteFile.getParentFile());
//
//    // DGF this is a hack, but I can't find a better place to put it
//    String urlEncodedSuiteFilename = URLEncoder.encode(suiteFile.getName(), "UTF-8");
//    String suiteURL;
//    if (browser.startsWith("*chrome") || browser.startsWith("*firefox") ||
//        browser.startsWith("*iehta") || browser.startsWith("*iexplore")) {
//      suiteURL =
//          "http://localhost:" + remoteControl.getConfiguration().getPortDriversShouldContact() +
//              "/selenium-server/tests/" + urlEncodedSuiteFilename;
//    } else {
//      suiteURL =
//          Urls.toProtocolHostAndPort(browserURL) + "/selenium-server/tests/" + urlEncodedSuiteFilename;
//    }
//    return runHTMLSuite(browser, browserURL, suiteURL, outputFile, timeoutInSeconds, multiWindow,
//        "info");
//  }

  private URL determineSuiteUrl(String browserUrl, String suiteURL) throws IOException {
    String url = null;

    if (suiteURL.startsWith("https://") || suiteURL.startsWith("http://")) {
      return verifySuiteUrl(new URL(suiteURL));
    }

    // Is the suiteURL a file?
    Path path = Paths.get(suiteURL);
    if (Files.exists(path)) {
      // Not all drivers can read files from the disk, so we need to host the suite somewhere.
      try (SocketLock lock = new SocketLock()) {
        server = new Server();
        HttpConfiguration httpConfig = new HttpConfiguration();

        ServerConnector http = new ServerConnector(server, new HttpConnectionFactory(httpConfig));
        int port = PortProber.findFreePort();
        http.setPort(port);
        http.setIdleTimeout(500000);
        server.setConnectors(new Connector[]{http});

        ResourceHandler handler = new ResourceHandler();
        handler.setDirectoriesListed(true);
        handler.setWelcomeFiles(new String[]{"index.html"});
        handler.setBaseResource(Resource.newResource(path.toFile()));

        ContextHandler context = new ContextHandler("/tests");
        context.setHandler(handler);

        server.setHandler(handler);
        server.start();

        PortProber.pollPort(port);

        URL serverUrl = server.getURI().toURL();
        return new URL(serverUrl.getProtocol(), serverUrl.getHost(), serverUrl.getPort(),
                       "/tests/");
      } catch (Exception e) {
        throw new IOException(e);
      }
    }

    // Well then, it must be a URL relative to whatever the browserUrl. Probe and find out.
    URL browser = new URL(browserUrl);
    return verifySuiteUrl(new URL(browser, suiteURL));
  }

  private URL verifySuiteUrl(URL url) throws IOException {
    // Now probe.
    URLConnection connection = url.openConnection();
    if (!(connection instanceof HttpURLConnection)) {
      throw new IOException("The HTMLLauncher only supports relative HTTP URLs");
    }
    HttpURLConnection httpConnection = (HttpURLConnection) connection;
    httpConnection.setInstanceFollowRedirects(true);
    httpConnection.setRequestMethod("HEAD");
    int responseCode = httpConnection.getResponseCode();
    if (responseCode != HttpURLConnection.HTTP_OK) {
      throw new IOException("Invalid suite URL: " + url);
    }
    return url;
 }

  /** Accepts HTMLTestResults for later asynchronous handling */
  public void processResults(HTMLTestResults resultsParm) {
//    this.results = resultsParm;
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
    browsers = new String[] {args[4]};

    HTMLLauncher launcher = new HTMLLauncher();

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

    return passed ? 1 : 0;
  }

  public static void main(String[] args) throws Exception {
    System.exit(mainInt(args));
  }

//  public HTMLTestResults getResults() {
//    return results;
//  }
//
//  public void setResults(HTMLTestResults results) {
//    this.results = results;
//  }

  private WebDriver createDriver(String browser) {
    switch (browser) {
      case "*chrome":
      case "*firefox":
      case "*firefoxproxy":
      case "*firefoxchrome":
      case "*pifirefox":
        DesiredCapabilities caps = new DesiredCapabilities();
        caps.setCapability(MARIONETTE, true);
        return new FirefoxDriver(caps);

      case "*iehta":
      case "*iexplore":
      case "*iexploreproxy":
      case "*piiexplore":
        return new InternetExplorerDriver();

      case "*googlechrome":
        return new ChromeDriver();

      case "*MicrosoftEdge":
        return new EdgeDriver();

      case "*opera":
      case "*operablink":
        return new OperaDriver();

      case "*safari":
      case "*safariproxy":
        return new SafariDriver();

      default:
        throw new RuntimeException("Unrecognized browser: " + browser);
    }
  }
}
