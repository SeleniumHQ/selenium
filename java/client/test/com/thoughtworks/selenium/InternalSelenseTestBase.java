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

import static java.nio.file.StandardCopyOption.REPLACE_EXISTING;
import static org.openqa.selenium.UnexpectedAlertBehaviour.IGNORE;
import static org.openqa.selenium.remote.CapabilityType.UNEXPECTED_ALERT_BEHAVIOUR;

import com.google.common.base.Charsets;
import com.google.common.base.Throwables;
import com.google.common.collect.ImmutableSet;
import com.google.common.io.Resources;

import com.thoughtworks.selenium.testing.SeleniumTestEnvironment;
import com.thoughtworks.selenium.webdriven.WebDriverBackedSelenium;

import org.junit.After;
import org.junit.AfterClass;
import org.junit.Assume;
import org.junit.BeforeClass;
import org.junit.Rule;
import org.junit.rules.ExternalResource;
import org.junit.rules.RuleChain;
import org.junit.rules.TestRule;
import org.junit.rules.TestWatcher;
import org.junit.runner.Description;
import org.junit.runners.model.Statement;
import org.openqa.selenium.BuckBuild;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.environment.GlobalTestEnvironment;
import org.openqa.selenium.internal.WrapsDriver;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.testing.DevMode;
import org.openqa.selenium.testing.InProject;
import org.openqa.selenium.testing.drivers.Browser;
import org.openqa.selenium.testing.drivers.WebDriverBuilder;

import java.io.IOException;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Arrays;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.logging.Logger;

public class InternalSelenseTestBase extends SeleneseTestBase {
  private static final Logger log = Logger.getLogger(InternalSelenseTestBase.class.getName());

  private static final ImmutableSet<String> ATOM_TARGETS = ImmutableSet.of(
    "findElement",
    "findOption",
    "fireEvent",
    "fireEventAt",
    "getAttribute",
    "getText",
    "linkLocator",
    "isElementPresent",
    "isSomethingSelected",
    "isTextPresent",
    "isVisible",
    "setCursorPosition",
    "type");

  private static Selenium INSTANCE;

  private static final AtomicBoolean MUST_BUILD = new AtomicBoolean(true);

  @BeforeClass
  public static void buildJavascriptLibraries() throws IOException {
    if (!DevMode.isInDevMode() || !MUST_BUILD.compareAndSet(true, false)) {
      return;
    }

    log.info("In dev mode. Copying required files in case we're using a WebDriver-backed Selenium");

    Path dir =
      InProject.locate("java/client/build/production/com/thoughtworks/selenium/webdriven");
    Files.createDirectories(dir);
    for (String target : ATOM_TARGETS) {
      Path atom = new BuckBuild().of("//javascript/selenium-atoms:" + target).go();
      Files.copy(atom, dir.resolve(atom.getFileName()), REPLACE_EXISTING);
    }
    Path sizzle = InProject.locate("third_party/js/sizzle/sizzle.js");
    Files.copy(sizzle, dir.resolve("sizzle.js"), REPLACE_EXISTING);

    Path seDir = InProject.locate("java/client/test/com/thoughtworks/selenium");
    Path destDir =
      InProject.locate("java/client/build/production/com/thoughtworks/selenium");
    Files.list(seDir)
      .filter(path -> path.getFileName().toString().endsWith(".js"))
      .forEach(path -> {
        try {
          Files.copy(path, destDir.resolve(path.getFileName()), REPLACE_EXISTING);
        } catch (IOException e) {
          throw new RuntimeException(e);
        }
      });
  }

  @BeforeClass
  public static void initializeServer() {
    GlobalTestEnvironment.get(SeleniumTestEnvironment.class);
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
      selenium = INSTANCE;
      if (selenium != null) {
        return;
      }

      DesiredCapabilities caps = createCapabilities();
      caps.setCapability(UNEXPECTED_ALERT_BEHAVIOUR, IGNORE);

      String baseUrl = whereIs("selenium-server/");

      WebDriver driver = new WebDriverBuilder().setDesiredCapabilities(caps).get();
      selenium = new WebDriverBackedSelenium(driver, baseUrl);

      selenium.setBrowserLogLevel("debug");
      INSTANCE = selenium;
    }
  };

  private DesiredCapabilities createCapabilities() {
    String property = System.getProperty("selenium.browser", "ff");

    Browser browser = Browser.valueOf(property);
    switch (browser) {
      case chrome:
        return DesiredCapabilities.chrome();

      case edge:
        return DesiredCapabilities.edge();

      case ie:
        return DesiredCapabilities.internetExplorer();

      case ff:
        return DesiredCapabilities.firefox();

      case opera:
      case operablink:
        return DesiredCapabilities.operaBlink();

      case safari:
        return DesiredCapabilities.safari();

      default:
        fail("Attempt to use an unsupported browser: " + property);
        // we never get here, but keep null checks happy anyway
        return new DesiredCapabilities();
    }
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

  @AfterClass
  public static void destroyDriver() {
    if (Boolean.getBoolean("webdriver.singletestsuite.leaverunning")) {
      return;
    }

    Selenium selenium = INSTANCE;
    if (selenium != null) {
      selenium.stop();
      INSTANCE = null;
    }
  }
}
