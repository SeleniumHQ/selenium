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


package com.thoughtworks.selenium;

import static com.thoughtworks.selenium.BrowserConfigurationOptions.MULTI_WINDOW;
import static com.thoughtworks.selenium.BrowserConfigurationOptions.SINGLE_WINDOW;
import static org.openqa.selenium.UnexpectedAlertBehaviour.IGNORE;
import static org.openqa.selenium.remote.CapabilityType.UNEXPECTED_ALERT_BEHAVIOUR;

import com.google.common.base.Charsets;
import com.google.common.base.Throwables;
import com.google.common.io.Files;
import com.google.common.io.Resources;

import com.thoughtworks.selenium.testing.SeleniumTestEnvironment;
import com.thoughtworks.selenium.webdriven.WebDriverBackedSelenium;

import org.junit.After;
import org.junit.Assume;
import org.junit.BeforeClass;
import org.junit.Rule;
import org.junit.rules.ExternalResource;
import org.junit.rules.RuleChain;
import org.junit.rules.TestRule;
import org.junit.rules.TestWatcher;
import org.junit.runner.Description;
import org.junit.runners.model.Statement;
import org.openqa.selenium.Build;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.environment.GlobalTestEnvironment;
import org.openqa.selenium.internal.WrapsDriver;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.testing.DevMode;
import org.openqa.selenium.testing.InProject;
import org.openqa.selenium.testing.drivers.Browser;
import org.openqa.selenium.testing.drivers.WebDriverBuilder;

import java.io.File;
import java.io.IOException;
import java.net.URL;
import java.util.Arrays;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.logging.Logger;

public class InternalSelenseTestBase extends SeleneseTestBase {
  private static final Logger log = Logger.getLogger(InternalSelenseTestBase.class.getName());
  private static final ThreadLocal<Selenium> instance = new ThreadLocal<>();
  private static String seleniumServerUrl;

  private static final AtomicBoolean mustBuild = new AtomicBoolean(true);

  @BeforeClass
  public static void buildJavascriptLibraries() throws IOException {
    if (!DevMode.isInDevMode() || !mustBuild.compareAndSet(true, false)) {
      return;
    }

    log.info("In dev mode. Copying required files in case we're using a WebDriver-backed Selenium");

    try {
      new Build().of(
          "//java/client/src/com/thoughtworks/selenium/webdriven",
          "//third_party/js/sizzle"
      ).go();

      File buildDir = InProject.locate("java/client/build/production/com/thoughtworks/selenium/webdriven");
      buildDir = new File(buildDir, "selenium_atoms");
      if (!buildDir.exists()) {
        assertTrue(buildDir.mkdir());
      }
      File atomsDir = InProject.locate("build/javascript/selenium-atoms");

      File[] atomsFiles = atomsDir.listFiles();
      if (atomsFiles != null) {
        for (File file : atomsFiles) {
          if (file.getName().endsWith(".js")) {
            File dest = new File(buildDir, file.getName());
            Files.copy(file, dest);
          }
        }
      }

      File sizzle = InProject.locate("third_party/js/sizzle/sizzle.js");
      Files.copy(sizzle, new File(buildDir, "sizzle.js"));

      File seDir = InProject.locate("java/client/test/com/thoughtworks/selenium");
      File destDir = InProject.locate("java/client/build/production/com/thoughtworks/selenium");
      File[] seFiles = seDir.listFiles();
      if (seFiles != null) {
        for (File file : seFiles) {
          if (file.getName().endsWith(".js")) {
            File dest = new File(destDir, file.getName());
            Files.copy(file, dest);
          }
        }
      }

    } catch (WebDriverException e) {
      System.err.println("Cannot build javascript libraries for selenium emulation: " + e.getMessage());
    }
  }

  @BeforeClass
  public static void initializeServer() {
    SeleniumTestEnvironment env = GlobalTestEnvironment.get(SeleniumTestEnvironment.class);
    seleniumServerUrl = env.getSeleniumServerUrl();
  }

  public TestWatcher traceMethodName = new TestWatcher() {
    @Override
    protected void starting(Description description) {
      super.starting(description);
      log.info(">>> Starting " + description);
    }

    @Override
    protected void finished(Description description) {
      super.finished(description);
      log.info("<<< Finished " + description);
    }
  };

  public ExternalResource initializeSelenium = new ExternalResource() {
    @Override
    protected void before() throws Throwable {
      selenium = instance.get();
      if (selenium != null) {
        return;
      }

      DesiredCapabilities caps = new DesiredCapabilities();
      caps.setCapability(UNEXPECTED_ALERT_BEHAVIOUR, IGNORE);
      if (Boolean.getBoolean("singlewindow")) {
        caps.setCapability(SINGLE_WINDOW, true);
        caps.setCapability(MULTI_WINDOW, "");
      }
      if (Boolean.getBoolean("webdriver.debug")) {
        caps.setCapability("browserSideLog", true);
      }

      String baseUrl = whereIs("/selenium-server/tests/");
      caps.setCapability("selenium.base.url", baseUrl);
      caps.setCapability("selenium.server.url", seleniumServerUrl);

      if (Boolean.getBoolean("selenium.browser.selenium")) {
        URL serverUrl = new URL(seleniumServerUrl);
        selenium = new DefaultSelenium(serverUrl.getHost(), serverUrl.getPort(), determineBrowserName(), baseUrl);
        selenium.start();

      } else {
        WebDriver driver = new WebDriverBuilder().setDesiredCapabilities(caps).get();
        selenium = new WebDriverBackedSelenium(driver, baseUrl);
      }

      selenium.setBrowserLogLevel("debug");
      instance.set(selenium);
    }
  };

  private String determineBrowserName() {
    String property = System.getProperty("selenium.browser");
    if (property == null) {
      return "*chrome";  // Default to firefox
    }

    if (property.startsWith("*")) {
      return property;
    }

    Browser browser = Browser.valueOf(property);
    switch (browser) {
      case chrome:
        return "*googlechrome";

      case ie:
        return "*iexplore";

      case ff:
        return "*firefox";

      case safari:
        return "*safari";

      default:
        fail("Attempt to use an unsupported browser: " + property);
    }

    return null; // we never get here.
  }

  public ExternalResource addNecessaryJavascriptCommands = new ExternalResource() {
    @Override
    protected void before() throws Throwable {
      if (selenium == null || !(selenium instanceof WebDriverBackedSelenium)) {
        return;
      }

      // We need to be a on page where we can execute JS
      WebDriver driver = ((WrapsDriver) selenium).getWrappedDriver();
      driver.get(whereIs("/selenium-server"));

      try {
        URL scriptUrl =
            Resources.getResource(getClass(), "/com/thoughtworks/selenium/testHelpers.js");
        String script = Resources.toString(scriptUrl, Charsets.UTF_8);

        ((JavascriptExecutor) driver).executeScript(script);
      } catch (IOException e) {
        fail("Cannot read script: " + Throwables.getStackTraceAsString(e));
      }
    }
  };

  public ExternalResource returnFocusToMainWindow = new ExternalResource() {
    @Override
    protected void before() throws Throwable {
      if (selenium == null) {
        return;
      }

      selenium.selectWindow("");
      selenium.windowFocus();
    }
  };

  public TestWatcher filter = new TestWatcher() {
    @Override
    public Statement apply(Statement base, Description description) {
      String onlyRun = System.getProperty("only_run");
      Assume.assumeTrue(onlyRun == null ||
          Arrays.asList(onlyRun.split(",")).contains(description.getTestClass().getSimpleName()));
      String mth = System.getProperty("method");
      Assume.assumeTrue(mth == null ||
          Arrays.asList(mth.split(",")).contains(description.getMethodName()));
      return super.apply(base, description);
    }
  };

  @Rule
  public TestRule chain =
      RuleChain.outerRule(filter)
               .around(initializeSelenium)
               .around(returnFocusToMainWindow)
               .around(addNecessaryJavascriptCommands)
               .around(traceMethodName);

  @After
  public void checkVerifications() {
    checkForVerificationErrors();
  }

  private String whereIs(String location) {
    return GlobalTestEnvironment.get().getAppServer().whereIs(location);
  }

  public static void destroyDriver() {
    if (Boolean.getBoolean("webdriver.singletestsuite.leaverunning")) {
      return;
    }

    Selenium selenium = instance.get();
    if (selenium != null) {
      selenium.stop();
      instance.remove();
    }
  }
}
