/*
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.

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

package org.openqa.selenium.remote.server;

import com.google.common.collect.Maps;

import junit.extensions.TestSetup;
import junit.framework.Test;
import junit.framework.TestSuite;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.TestSuiteBuilder;
import org.openqa.selenium.environment.webserver.AppServer;
import org.openqa.selenium.environment.webserver.Jetty7AppServer;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.HttpRequest;
import org.openqa.selenium.remote.LocalFileDetector;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.testing.InProject;
import org.openqa.selenium.testing.drivers.Browser;

import java.io.File;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.Map;

public class RemoteWebDriverTestSuite extends TestSuite {
  public static Test suite() throws Exception {
    System.setProperty("selenium.browser.remote", "true");

    Test rawSuite =
        new TestSuiteBuilder()
            .addSourceDir("java/client/test")
            .addSourceDir("java/server/test")
            .keepDriverInstance()
            .includeJavascriptTests()
            .using(Browser.ff)
            .excludePattern(".*IntegrationTest")
            .excludePattern(".*CaptureNetworkTrafficTest")
            .excludePattern(".*FirefoxMiniHTMLRunnerTest")
            .excludePattern(".*LinuxHTMLRunnerMultiWindowTest")
            .excludePattern(".*CaptureNetworkTrafficCommandTest")
            .excludePattern(".*HtmlIdentifierTest")
            .excludePattern(".*\\.browserlaunchers\\..*")
            .excludePattern(".*FunctionalTest")
            .excludePattern(".*UnitTest")
            .excludePattern(".*LauncherTest")
            .create();

    TestSuite toReturn = new TestSuite();
    toReturn.addTest(new RemoteDriverServerStarter(rawSuite));
    return toReturn;
  }

  public static class RemoteWebDriverForTest extends RemoteWebDriver {
    // For the pleasure of cglib
    public RemoteWebDriverForTest() throws MalformedURLException {
      this(DesiredCapabilities.firefox());
    }

    public RemoteWebDriverForTest(Capabilities ignored) throws MalformedURLException {
      super(new URL("http://localhost:6000/common/hub"), DesiredCapabilities.firefox());
      // Use the local file detector so that we exercise the file upload paths
      setFileDetector(new LocalFileDetector());
    }
  }

  public static class RemoteDriverServerStarter extends TestSetup {
    private AppServer appServer;

    public RemoteDriverServerStarter(Test test) {
      super(test);
    }

    @Override
    protected void setUp() throws Exception {
      appServer = new Jetty7AppServer() {
        @Override
        protected File findRootOfWebApp() {
          File file = InProject.locate("remote/server/src/web");
          System.out.println(
              String.format("file exists %s and is: %s", file.exists(), file.getAbsolutePath()));
          return file;
        }
      };
      appServer.listenOn(6000);
      appServer.listenSecurelyOn(7000);
      appServer.addServlet("remote webdriver", "/hub/*", DriverServlet.class);
      appServer.start();

      if (isInDevMode()) {
        Map<String, Object> payload = Maps.newHashMap();
        payload.put("capabilities", DesiredCapabilities.firefox());
        payload
            .put("class", "org.openqa.selenium.testing.drivers.SynthesizedFirefoxDriver");

        new HttpRequest(
            HttpRequest.Method.POST, "http://localhost:6000/common/hub/config/drivers",
            payload);
      }

      super.setUp();
    }

    private boolean isInDevMode() {
      return FirefoxDriver.class.getResource("/webdriver-extension.zip") == null;
    }

    @Override
    protected void tearDown() throws Exception {
      appServer.stop();

      super.tearDown();
    }
  }
}
