package com.thoughtworks.selenium;

import com.google.common.base.Charsets;
import com.google.common.base.Supplier;
import com.google.common.base.Throwables;
import com.google.common.io.Resources;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverBackedSelenium;
import org.openqa.selenium.environment.GlobalTestEnvironment;
import org.openqa.selenium.internal.WrapsDriver;
import org.openqa.selenium.v1.SeleniumTestEnvironment;
import org.testng.Assert;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.BeforeTest;

import java.io.IOException;
import java.net.URL;

public class InternalSelenseTestNgBase extends SeleneseTestBase {
  private static Selenium staticSelenium;

  @BeforeTest
  public void startBrowser() {
    startSeleniumServer();

    final String browser = System.getProperty("selenium.browser", runtimeBrowserString());
    int port = getDefaultPort();

    String baseUrl = "http://localhost:" + port + "/selenium-server/tests/";

    if (getDriverClass(browser) != null) {
      selenium = new WebDriverBackedSelenium(new Supplier<WebDriver>() {
        public WebDriver get() {
          try {
            return getDriverClass(browser).newInstance();
          } catch (Exception e) {
            throw Throwables.propagate(e);
          }
        }
      }, baseUrl);
    } else {
      selenium = new DefaultSelenium("localhost", port, browser, baseUrl);
    }

    selenium.start();
    staticSelenium = selenium;
  }

  private void startSeleniumServer() {
    synchronized (this) {
      if (!GlobalTestEnvironment.isSetUp()) {
        GlobalTestEnvironment.set(new SeleniumTestEnvironment());
      }
    }
  }

  private Class<? extends WebDriver> getDriverClass(String browserString) {
    if (browserString == null) {
      return null;
    }

    try {
      return Class.forName(browserString).asSubclass(WebDriver.class);
    } catch (ClassNotFoundException e) {
      return null;
    }
  }

  @BeforeMethod
  public void getSelenium() {
    selenium = staticSelenium;
  }

  @BeforeMethod
  public void returnFocusToMainWindow() {
    if (selenium == null) {
      return;
    }
    selenium.selectWindow("");
  }

  @BeforeMethod
  public void addNecessaryJavascriptCommands() {
    if (selenium == null || !(selenium instanceof WebDriverBackedSelenium)) {
      return;
    }

    // We need to be a on page where we can execute JS
    WebDriver driver = ((WrapsDriver) selenium).getWrappedDriver();
    driver.get("http://localhost:4444/selenium-server");

    try {
      URL scriptUrl = Resources.getResource(getClass(), "/com/thoughtworks/selenium/testHelpers.js");
      String script = Resources.toString(scriptUrl, Charsets.UTF_8);

      ((JavascriptExecutor) driver).executeScript(script);
    } catch (IOException e) {
      Assert.fail("Cannot read script", e);
    }
  }

  @AfterMethod
  public void checkVerifications() throws Exception {
    checkForVerificationErrors();
  }
}
