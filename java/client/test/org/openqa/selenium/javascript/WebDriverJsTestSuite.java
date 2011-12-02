/*
Copyright 2010 WebDriver committers
Copyright 2010 Google Inc.

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

package org.openqa.selenium.javascript;

import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

import junit.extensions.TestSetup;
import junit.framework.Test;
import junit.framework.TestCase;
import junit.framework.TestSuite;

import org.openqa.selenium.DefaultDriverSupplierSupplier;
import org.openqa.selenium.DriverTestDecorator;
import org.openqa.selenium.NeedsDriver;
import org.openqa.selenium.Platform;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.environment.webserver.AppServer;
import org.openqa.selenium.environment.webserver.Jetty7AppServer;
import org.openqa.selenium.internal.InProject;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;

import java.io.File;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.Arrays;
import java.util.concurrent.TimeUnit;

public class WebDriverJsTestSuite {

  public static Test suite() {
    TestSuite suite = new TestSuite();

    String testDirName = System.getProperty("js.test.dir");
    assertNotNull("You must set the test directory name", testDirName);

    File testDir = InProject.locate(testDirName);
    assertTrue("Test directory does not exist: " + testDirName, testDir.exists());

    String urlPath = System.getProperty("js.test.url.path");
    assertNotNull("You must set the url path to use", urlPath);
    if (!urlPath.endsWith("/")) {
      urlPath += "/";
    }

    ResultsServlet resultsServlet = new ResultsServlet();
    AppServer appServer = createAppServer(resultsServlet);

    for (File file : testDir.listFiles(new TestFilenameFilter())) {
      String path = file.getAbsolutePath()
          .replace(testDir.getAbsolutePath() + File.separator, "")
          .replace(File.separator, "/");
      TestCase test = new WebDriverJsTestCase(urlPath + path, appServer,
          resultsServlet);
      suite.addTest(new DriverTestDecorator(test, new DefaultDriverSupplierSupplier(RemoteWebDriverForTest.class).get(),
          /* keepDriver= */true, /* freshDriver= */false,
          /* refreshDriver= */false));
    }

    Test test = new DriverQuitter(suite);
    test = new WebDriverServerStarter(test, appServer);
    test = new WebDriverServerStarter(test, RemoteServer.INSTANCE);
    return test;
  }

  private static AppServer createAppServer(ResultsServlet resultsServlet) {
    Jetty7AppServer appServer = new Jetty7AppServer();
    appServer.addServlet("/testResults", resultsServlet);
    return appServer;
  }

  private static DesiredCapabilities getCapabilities() {
    DesiredCapabilities capabilities = new DesiredCapabilities();
    capabilities.setBrowserName(System.getProperty("selenium.browser", "firefox"));
    capabilities.setVersion("");
    capabilities.setPlatform(Platform.ANY);
    capabilities.setJavascriptEnabled(true);
    capabilities.setCapability("chrome.switches",
        Arrays.asList("--disable-popup-blocking"));
    capabilities.setCapability("opera.arguments", "-nowin");
    return capabilities;
  }

  public static class RemoteWebDriverForTest extends RemoteWebDriver {
    public RemoteWebDriverForTest() throws MalformedURLException {
      super(new URL(RemoteServer.INSTANCE.whereIs("/wd/hub")),
          WebDriverJsTestSuite.getCapabilities());
    }
  }

  private static class WebDriverJsTestCase extends TestCase implements NeedsDriver {

    private final String relativeUrl;
    private final AppServer appServer;
    private final ResultsServlet resultsServlet;
    private RemoteWebDriverForTest driver;

    private WebDriverJsTestCase(String relativeUrl, AppServer appServer,
        ResultsServlet resultsServlet) {
      this.relativeUrl = relativeUrl;
      this.appServer = appServer;
      this.resultsServlet = resultsServlet;
      this.setName(relativeUrl);
    }

    @Override
    protected void runTest() throws MalformedURLException {
      String testUrl = appServer.whereIs(relativeUrl)
          + "?wdsid=" + driver.getSessionId()
          + "&wdurl=" + RemoteServer.INSTANCE.whereIs("/wd/hub");
      driver.get(testUrl);
      long start = System.nanoTime();

      try {
        ResultSet resultSet = resultsServlet.getResultSet(2, TimeUnit.MINUTES); // Note, MINUTES is jdk6
        if (resultSet == null) {
          long now = System.nanoTime();
          fail(String.format("TIMEOUT after %d ms",
              TimeUnit.MILLISECONDS.convert(now - start, TimeUnit.NANOSECONDS)));
        }
        assertTrue(resultSet.getReport(), resultSet.isSuccess());
      } catch (InterruptedException e) {
        long now = System.nanoTime();
        fail(String.format("Test thread was interrupted after %d ms",
            TimeUnit.MILLISECONDS.convert(now - start, TimeUnit.NANOSECONDS)));
      }
    }

    public void setDriver(WebDriver driver) {
      this.driver = (RemoteWebDriverForTest) driver;
    }
  }

  private static class DriverQuitter extends TestSetup {

    public DriverQuitter(Test test) {
      super(test);
    }

    @Override
    protected void tearDown() {
      DriverTestDecorator.getDriver().quit();
    }
  }

  private static class WebDriverServerStarter extends TestSetup {
    private final AppServer appServer;

    public WebDriverServerStarter(Test test, AppServer appServer) {
      super(test);
      this.appServer = appServer;
    }

    @Override
    protected void setUp() throws Exception {
      System.out.println("Starting " + appServer.whereIs("/"));
      appServer.start();
      super.setUp();
    }

    @Override
    protected void tearDown() throws Exception {
      System.out.println("Stopping " + appServer.whereIs("/"));
      appServer.stop();
      super.tearDown();
    }
  }
}
