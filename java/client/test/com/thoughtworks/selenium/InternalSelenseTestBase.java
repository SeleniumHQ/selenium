package com.thoughtworks.selenium;

import com.google.common.base.Charsets;
import com.google.common.io.Files;
import com.google.common.io.Resources;

import org.openqa.selenium.Build;
import org.openqa.selenium.testing.DevMode;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverBackedSelenium;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.environment.GlobalTestEnvironment;
import org.openqa.selenium.testing.InProject;
import org.openqa.selenium.internal.WrapsDriver;
import org.openqa.selenium.v1.SeleniumTestEnvironment;

import org.junit.After;
import org.junit.Before;
import org.junit.BeforeClass;
import org.testng.Assert;

import java.io.File;
import java.io.IOException;
import java.net.URL;
import java.util.logging.Logger;

public class InternalSelenseTestBase extends SeleneseTestBase {
  private static final Logger log = Logger.getLogger(InternalSelenseTestBase.class.getName());

  @BeforeClass
  public static void buildJavascriptLibraries() throws IOException {
    if (!DevMode.isInDevMode()) {
      return;
    }

    log.info("In dev mode. Copying required files in case we're using a WebDriver-backed Selenium");

    try {
      new Build().of(
          "//java/client/src/org/openqa/selenium/internal/seleniumemulation",
          "//third_party/js/sizzle"
      ).go();

      File buildDir = InProject.locate("out/production/selenium/org/openqa/selenium/internal/seleniumemulation");
      File atomsDir = InProject.locate("build/javascript/selenium-atoms");

      for (File file : atomsDir.listFiles()) {
        if (file.getName().endsWith(".js")) {
          File dest = new File(buildDir, file.getName());
          Files.copy(file, dest);
        }
      }

      File sizzle = InProject.locate("third_party/js/sizzle/sizzle.js");
      Files.copy(sizzle, new File(buildDir, "sizzle.js"));

      File seDir = InProject.locate("java/client/test/com/thoughtworks/selenium");
      File destDir = InProject.locate("out/production/selenium/com/thoughtworks/selenium");
      for (File file : seDir.listFiles()) {
        if (file.getName().endsWith(".js")) {
          File dest = new File(destDir, file.getName());
          Files.copy(file, dest);
        }
      }

    } catch (WebDriverException e) {
      System.err.println("Cannot build javascript libraries for selenium emulation: " + e.getMessage());
    }
  }

  @BeforeClass
  public static void initializeServer() {
    GlobalTestEnvironment.get(SeleniumTestEnvironment.class);
  }

  @Before
  public void addNecessaryJavascriptCommands() {
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
      Assert.fail("Cannot read script", e);
    }
  }

  private String whereIs(String location) {
    return GlobalTestEnvironment.get().getAppServer().whereIs(location);
  }

  @Before
  public void focusOnMainWindow() {
    if (selenium == null) {
      return;
    }
    selenium.windowFocus();
  }

  @Before
  public void returnFocusToMainWindow() {
    if (selenium == null) {
      return;
    }

    try {
      selenium.selectWindow("");
    } catch (SeleniumException e) {
      // TODO(simon): Window switching in Opera is picky.
      if (!isOperaDriver(selenium)) {
        throw e;
      }
    }
  }

  private boolean isOperaDriver(Selenium selenium) {
    if (!(selenium instanceof WrapsDriver)) {
      return false;
    }

    WebDriver driver = ((WrapsDriver) selenium).getWrappedDriver();
    return "OperaDriver".equals(driver.getClass().getSimpleName());
  }

  @Before
  public void initializeSelenium() {
    selenium = ((SeleniumTestEnvironment) GlobalTestEnvironment.get())
        .getSeleniumInstance(runtimeBrowserString());
  }

  @After
  public void checkVerifications() {
    checkForVerificationErrors();
  }
}
