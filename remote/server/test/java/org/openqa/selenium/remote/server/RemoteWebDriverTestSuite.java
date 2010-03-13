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

import junit.extensions.TestSetup;
import junit.framework.Test;
import junit.framework.TestCase;
import junit.framework.TestSuite;

import java.io.File;
import java.net.URL;
import java.util.Map;

import com.google.common.collect.Maps;
import org.openqa.selenium.TestSuiteBuilder;
import org.openqa.selenium.environment.webserver.AppServer;
import org.openqa.selenium.environment.webserver.Jetty6AppServer;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.HttpRequest;
import org.openqa.selenium.remote.RemoteWebDriver;

import static org.openqa.selenium.Ignore.Driver.FIREFOX;
import static org.openqa.selenium.Ignore.Driver.REMOTE;

public class RemoteWebDriverTestSuite extends TestCase {
  public static Test suite() throws Exception {
    System.setProperty("webdriver.development", "true");

    Test rawSuite =
        new TestSuiteBuilder()
            .addSourceDir("common")
            .addSourceDir("remote/client")
            .addSourceDir("remote/server")
            .keepDriverInstance()
            .includeJavascriptTests()
            .usingDriver(RemoteWebDriverForTest.class)
            .exclude(FIREFOX)
            .exclude(REMOTE)
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
    public RemoteWebDriverForTest() throws Exception {
      super(new URL("http://localhost:6000/common/hub"), DesiredCapabilities.firefox());
    }
  }

  public static class RemoteDriverServerStarter extends TestSetup {
    private AppServer appServer;

    public RemoteDriverServerStarter(Test test) {
      super(test);
    }

    @Override
    protected void setUp() throws Exception {
      appServer = new Jetty6AppServer() {
        protected File findRootOfWebApp() {
          File common = super.findRootOfWebApp();
          File file = new File(common, "../../../remote/server/src/web");
          System.out.println(
              String.format("file exists %s and is: %s", file.exists(), file.getAbsolutePath()));
          return file;
        }

        protected File getKeyStore() {
          return new File(findRootOfWebApp(), "../../../../common/test/java/keystore");
        }
      };
      appServer.listenOn(6000);
      appServer.listenSecurelyOn(7000);
      appServer.addServlet("remote webdriver", "/hub/*", DriverServlet.class);
      appServer.start();

      if (isInDevMode()) {
        Map<String, Object> payload = Maps.newHashMap();
        payload.put("capabilities", DesiredCapabilities.firefox());
        payload.put("class", "org.openqa.selenium.firefox.FirefoxDriverTestSuite$TestFirefoxDriver");

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
