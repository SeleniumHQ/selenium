/*
Copyright 2010 WebDriver committers

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

import org.openqa.selenium.DriverTestDecorator;
import org.openqa.selenium.NeedsDriver;
import org.openqa.selenium.Platform;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.environment.webserver.AppServer;
import org.openqa.selenium.environment.webserver.WebbitAppServer;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;

import com.google.common.base.Function;
import com.google.common.base.Supplier;
import com.google.common.base.Throwables;
import junit.extensions.TestSetup;
import junit.framework.Test;
import junit.framework.TestCase;
import org.json.JSONException;
import org.json.JSONObject;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.Arrays;
import java.util.concurrent.TimeUnit;

public class WebDriverJsTestSuite {

  public static Test suite() {
    final TestEventHandler testEventHandler = new TestEventHandler();
    final AppServer appServer = createAppServer(testEventHandler);

    Test test = new JsTestSuiteBuilder()
        .withDriverSupplier(createDriverSupplier())
        .withTestFactory(new Function<String, Test>() {
          public Test apply(String testPath) {
            return new WebDriverJsTestCase(testPath, appServer,
                testEventHandler);
          }
        })
        .build();

    test = new DriverQuitter(test);
    test = new WebDriverServerStarter(test, appServer);
    test = new WebDriverServerStarter(test, RemoteServer.INSTANCE);
    return test;
  }

  private static AppServer createAppServer(TestEventHandler resultsHandler) {
    WebbitAppServer appServer = new WebbitAppServer();
    appServer.addHandler("/testevent", resultsHandler);
    return appServer;
  }
  
  private static Supplier<WebDriver> createDriverSupplier() {
    return new Supplier<WebDriver>() {
      public WebDriver get() {
        try {
          return new RemoteWebDriverForTest();
        } catch (MalformedURLException e) {
          throw Throwables.propagate(e);
        }
      }
    };
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
    private final TestEventSupplier testEventSupplier;
    private RemoteWebDriver driver;

    private WebDriverJsTestCase(String relativeUrl, AppServer appServer,
        TestEventSupplier testEventSupplier) {
      this.relativeUrl = relativeUrl;
      this.appServer = appServer;
      this.testEventSupplier = testEventSupplier;
      this.setName(relativeUrl);
    }

    protected void runTest() throws MalformedURLException, InterruptedException, JSONException {
      String testUrl = appServer.whereIs(relativeUrl)
          + "?wdsid=" + driver.getSessionId()
          + "&wdurl=" + RemoteServer.INSTANCE.whereIs("/wd/hub");
      driver.get(testUrl);
      long start = System.nanoTime();

      while (true) {
        TestEvent testEvent = testEventSupplier.getTestEvent(1, TimeUnit.SECONDS);

        if (isRelevantEvent(relativeUrl, testEvent)) {
          if ("RESULTS".equals(testEvent.getType())) {
            handleResultsEvent(testEvent);
            return;
          }

          if ("SCREENSHOT".equals(testEvent.getType())) {
            handleScreenshotEvent(testEvent);
          }
        }

        long elapsed = System.nanoTime() - start;
        if (elapsed > TimeUnit.NANOSECONDS.convert(120, TimeUnit.SECONDS)) {
          fail(String.format("TIMEOUT after %d ms",
              TimeUnit.MILLISECONDS.convert(elapsed, TimeUnit.NANOSECONDS)));
        }
       }
     }

    public void setDriver(WebDriver driver) {
      this.driver = (RemoteWebDriver) driver;
    }

    private void handleScreenshotEvent(TestEvent testEvent) throws JSONException {
      JSONObject data = testEvent.getData();
      System.out.printf("Screenshot(%s, %s):\n\tdata:image/png;base64,%s\n",
          relativeUrl, data.getString("name"), data.getString("data"));
    }

    private void handleResultsEvent(TestEvent testEvent) throws JSONException {
      JSONObject data = testEvent.getData();
      if (!data.getBoolean("isSuccess")) {
        fail(data.getString("report"));
      }
    }

    private boolean isRelevantEvent(String id, TestEvent testEvent) throws JSONException {
      if (testEvent == null)
        return false;

      if (!id.equals(testEvent.getId())) {
        System.out.printf("While running %s, received a test event for %s\n",
            id, testEvent.getId());
        // Still log screenshots.
        if ("SCREENSHOT".equals(testEvent.getType())) {
          handleScreenshotEvent(testEvent);
        }
        return false;
      }

      return true;
    }
  }

  private static class DriverQuitter extends TestSetup {

    public DriverQuitter(Test test) {
      super(test);
    }

    @Override
    protected void tearDown() {
      WebDriver driver = DriverTestDecorator.getDriver();
      if (driver != null) {
        driver.quit();
      }
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
