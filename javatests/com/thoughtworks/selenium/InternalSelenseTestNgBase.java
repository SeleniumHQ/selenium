package com.thoughtworks.selenium;

import com.google.common.base.Charsets;
import com.google.common.base.Supplier;
import com.google.common.base.Throwables;
import com.google.common.io.Resources;

import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverBackedSelenium;
import org.openqa.selenium.environment.GlobalTestEnvironment;
import org.openqa.selenium.v1.SeleniumTestEnvironment;
import org.testng.Assert;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.BeforeTest;
import org.testng.annotations.DataProvider;
import org.testng.annotations.Optional;
import org.testng.annotations.Parameters;

import java.io.IOException;
import java.net.URL;

public class InternalSelenseTestNgBase extends SeleneseTestBase {
  private static Selenium staticSelenium;

  @DataProvider(name = "system-properties")
  public Object[][] paramsFromProperties() {
    Object[][] toReturn = new Object[2][2];

    toReturn[0] = new Object[] { "selenium.browser", System.getProperty("selenium.browser") };
    toReturn[1] = new Object[] { "selenium.browser", System.getProperty("selenium.url") };
    
    return toReturn;
  }

  @BeforeTest
  @Parameters({"selenium.url", "selenium.browser"})
  public void startBrowser(@Optional String url, @Optional String browserString)
      throws Exception {
    startSeleniumServer();

    final String browser =
        browserString == null ? runtimeBrowserString() : browserString;
    int port = getDefaultPort();

    String baseUrl = url;

    if (url == null) {
      baseUrl = "http://localhost:" + port + "/selenium-server/tests/";
    }

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


  @BeforeClass
  @Parameters({"selenium.restartSession"})
  public void getSelenium(@Optional("false") boolean restartSession) {
    selenium = staticSelenium;
    if (restartSession) {
      selenium.stop();
      selenium.start();
    }
  }

  @BeforeMethod
  public void addNecessaryJavascriptCommands() {
    if (!(selenium instanceof WebDriverBackedSelenium)) {
      return;
    }

    // We need to be a on page where we can execute JS
    ((WebDriverBackedSelenium) selenium).getUnderlyingWebDriver()
        .get("http://localhost:4444/selenium-server");

    try {
      URL scriptUrl = Resources.getResource(getClass(), "/com/thoughtworks/selenium/testHelpers.js");
      String script = Resources.toString(scriptUrl, Charsets.UTF_8);

      WebDriver driver = ((WebDriverBackedSelenium) selenium).getUnderlyingWebDriver();
      ((JavascriptExecutor) driver).executeScript(script);
    } catch (IOException e) {
      Assert.fail("Cannot read script", e);
    }
  }
}
