package com.thoughtworks.selenium;

import java.lang.reflect.Method;
import java.io.InputStream;
import java.io.IOException;
import java.io.BufferedReader;
import java.io.InputStreamReader;

import org.openqa.selenium.SeleniumTestEnvironment;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverBackedSelenium;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.environment.GlobalTestEnvironment;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.ie.InternetExplorerDriver;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.AfterTest;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.BeforeTest;
import org.testng.annotations.Optional;
import org.testng.annotations.Parameters;
import org.testng.Assert;

import static org.openqa.selenium.DevMode.isInDevMode;

public class SeleneseTestNgHelper extends SeleneseTestBase
{
    private static Selenium staticSelenium;

  @BeforeClass
  public void startWebServer() {
    synchronized (this) {
      if (!GlobalTestEnvironment.isSetUp()) {
        GlobalTestEnvironment.set(new SeleniumTestEnvironment());
      }
    }
  }

    @BeforeTest
    @Override
    @Parameters({"selenium.url", "selenium.browser"})
    public void setUp(@Optional String url, @Optional String browserString) throws Exception {
        if (browserString == null) browserString = runtimeBrowserString();

        WebDriver driver = null;
        if (browserString.contains("firefox") || browserString.contains("chrome")) {
          if (isInDevMode(FirefoxDriver.class, "webdriver.xpi")) {
            System.setProperty("webdriver.development", "true");
            driver = Class.forName("org.openqa.selenium.firefox.FirefoxDriverTestSuite$TestFirefoxDriver")
                .asSubclass(WebDriver.class).newInstance();
          } else {
            driver = new FirefoxDriver();
          }
        } else if (browserString.contains("ie") || browserString.contains("hta")) {
          if (isInDevMode(FirefoxDriver.class, "webdriver.xpi")) {
            System.setProperty("webdriver.development", "true");
            System.setProperty("jna.library.path", "..\\build;build");
          }
          driver = new InternetExplorerDriver();
        } else {
          fail("Cannot determine which browser to load: " + browserString);
        }

        if (url == null)
          url = "http://localhost:4444/selenium-server";
        selenium = new WebDriverBackedSelenium(driver, url);

        staticSelenium = selenium;
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
    public void setTestContext(Method method) {
        selenium.setContext(method.getDeclaringClass().getSimpleName() + "." + method.getName());
    }


    @BeforeMethod
    public void addNecessaryJavascriptCommands() {
      if (!(selenium instanceof WebDriverBackedSelenium))
        return;

      // We need to be a on page where we can execute JS
      ((WebDriverBackedSelenium) selenium).getUnderlyingWebDriver()
          .get("http://localhost:4444/selenium-server");
      // Read the testHelper.js script in
      String path = "/com/thoughtworks/selenium/testHelpers.js";

      InputStream is = getClass().getResourceAsStream(path);
      try {
        BufferedReader reader = new BufferedReader(new InputStreamReader(is));
        StringBuilder builder = new StringBuilder();
        for (String line = reader.readLine(); line != null; line = reader.readLine()) {
          builder.append(line)
              .append("\n");
        }
        String script = builder.toString();

        WebDriver driver = ((WebDriverBackedSelenium) selenium).getUnderlyingWebDriver();
        ((JavascriptExecutor) driver).executeScript(script);
      } catch (IOException e) {
        Assert.fail("Cannot read script", e);
      } finally {
        if (is != null) try {
          is.close();
        } catch (IOException e) {
          // Throw this away. Nothing sane to do
        }
      }
    }

    @AfterMethod
    @Override
    public void checkForVerificationErrors() {
        super.checkForVerificationErrors();
    }

    @AfterMethod(alwaysRun=true)
    public void selectDefaultWindow() {
        if (selenium != null) selenium.selectWindow("null");
    }

    @AfterTest(alwaysRun=true)
    @Override
    public void tearDown() throws Exception {
        super.tearDown();
    }

    //@Override static method of super class (which assumes JUnit conventions)
    public static void assertEquals(Object actual, Object expected) {
        SeleneseTestBase.assertEquals(expected, actual);
    }

    //@Override static method of super class (which assumes JUnit conventions)
    public static void assertEquals(String actual, String expected) {
        SeleneseTestBase.assertEquals(expected, actual);
    }

    //@Override static method of super class (which assumes JUnit conventions)
    public static void assertEquals(String actual, String[] expected) {
        SeleneseTestBase.assertEquals(expected, actual);
    }

    //@Override static method of super class (which assumes JUnit conventions)
    public static void assertEquals(String[] actual, String[] expected) {
        SeleneseTestBase.assertEquals(expected, actual);
    }

    //@Override static method of super class (which assumes JUnit conventions)
    public static boolean seleniumEquals(Object actual, Object expected) {
        return SeleneseTestBase.seleniumEquals(expected, actual);
    }

    //@Override static method of super class (which assumes JUnit conventions)
    public static boolean seleniumEquals(String actual, String expected) {
        return SeleneseTestBase.seleniumEquals(expected, actual);
    }

    @Override
    public void verifyEquals(Object actual, Object expected) {
        super.verifyEquals(expected, actual);
    }

    @Override
    public void verifyEquals(String[] actual, String[] expected) {
        super.verifyEquals(expected, actual);
    }
}
