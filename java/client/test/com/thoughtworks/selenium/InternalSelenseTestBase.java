package com.thoughtworks.selenium;

import com.google.common.base.Charsets;
import com.google.common.io.Files;
import com.google.common.io.Resources;
import org.junit.After;
import org.junit.Before;
import org.junit.BeforeClass;
import org.openqa.selenium.Build;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.HasCapabilities;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverBackedSelenium;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.environment.GlobalTestEnvironment;
import org.openqa.selenium.internal.WrapsDriver;
import org.openqa.selenium.testing.DevMode;
import org.openqa.selenium.testing.InProject;
import org.openqa.selenium.testing.drivers.BackedBy;
import org.openqa.selenium.testing.drivers.Browser;
import org.openqa.selenium.v1.SeleniumTestEnvironment;
import org.testng.Assert;

import java.io.File;
import java.io.IOException;
import java.net.URL;
import java.util.logging.Logger;

import static org.openqa.selenium.remote.BrowserType.FIREFOX;
import static org.openqa.selenium.remote.BrowserType.FIREFOX_CHROME;
import static org.openqa.selenium.remote.BrowserType.FIREFOX_PROXY;
import static org.openqa.selenium.remote.BrowserType.GOOGLECHROME;
import static org.openqa.selenium.remote.BrowserType.IEXPLORE;
import static org.openqa.selenium.remote.BrowserType.IEXPLORE_PROXY;
import static org.openqa.selenium.remote.BrowserType.IE_HTA;
import static org.openqa.selenium.remote.DesiredCapabilities.chrome;
import static org.openqa.selenium.remote.DesiredCapabilities.firefox;
import static org.openqa.selenium.remote.DesiredCapabilities.internetExplorer;
import static org.openqa.selenium.remote.DesiredCapabilities.opera;
import static org.openqa.selenium.testing.drivers.BackedBy.webdriver;

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
      if (!is(webdriver, Browser.opera)) {
        throw e;
      }
    }
  }

  protected boolean is(BackedBy backedBy, Browser browser) {
    switch (backedBy) {
      case rc:
        return isRc(browser);

      case webdriver:
        return isWebDriver(browser);
    }

    return false;
  }

  private boolean isWebDriver(Browser browser) {
    if (!(selenium instanceof WrapsDriver)) {
      return false;
    }

    WebDriver driver = ((WrapsDriver) selenium).getWrappedDriver();
    Capabilities capabilities = ((HasCapabilities) driver).getCapabilities();
    String browserName = capabilities.getBrowserName();

    switch (browser) {
      case chrome:
        return chrome().getBrowserName().equals(browserName);

      case ff :
        return firefox().getBrowserName().equals(browserName);

      case ie:
        return internetExplorer().getBrowserName().equals(browserName);

      case opera:
        return opera().getBrowserName().equals(browserName);

      default:
        log.warning("Unknown browser: " + browser);
    }

    return false;
  }

  private boolean isRc(Browser browser) {
    if (selenium instanceof WrapsDriver) {
      return false;
    }

    String browserType = runtimeBrowserString();
    if (browserType.startsWith("*")) {
      browserType = browserType.substring(1);
    }

    switch (browser) {
      case chrome:
        return GOOGLECHROME.equals(browserType);

      case ff :
        return FIREFOX_PROXY.equals(browserType) ||
            FIREFOX_CHROME.equals(browserType) ||
            FIREFOX.equals(browserType);

      case ie:
        return IE_HTA.equals(browserType) ||
            IEXPLORE.equals(browserType) ||
            IEXPLORE_PROXY.equals(browserType);

      default:
        log.warning("Unknown browser: " + browser);
    }

    return false;
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
