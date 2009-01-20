package com.thoughtworks.selenium;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverBackedSelenium;
import org.openqa.selenium.SeleniumTestEnvironment;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.firefox.FirefoxProfile;
import org.openqa.selenium.ie.InternetExplorerDriver;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.AfterTest;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.BeforeTest;
import org.testng.annotations.Optional;
import org.testng.annotations.Parameters;

import java.io.File;
import java.lang.reflect.Method;

public class SeleneseTestNgHelper extends SeleneseTestBase
{
    private static Selenium staticSelenium;

    @BeforeClass
    public void startWebServer() {
      new SeleniumTestEnvironment();
    }

    @BeforeTest
    @Override
    @Parameters({"selenium.url", "selenium.browser"})
    public void setUp(@Optional String url, @Optional String browserString) throws Exception {
        if (browserString == null) browserString = runtimeBrowserString();

        WebDriver driver = null;
        if (browserString.contains("firefox") || browserString.contains("chrome")) {
          System.setProperty("webdriver.firefox.development", "true");
          driver = new FirefoxDriver();
        } else if (browserString.contains("ie") || browserString.contains("hta")) {
          driver = new InternetExplorerDriver();
        } else {
          fail("Cannot determine which browser to load: " + browserString);
        }
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
