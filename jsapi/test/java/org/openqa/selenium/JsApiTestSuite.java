package org.openqa.selenium;

import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.chrome.ChromeDriver;

import junit.framework.TestCase;
import junit.framework.Test;
import junit.framework.TestSuite;

/**
 * Test suite for running the WebDriver JS API test cases against all of its
 * supported browsers.
 *
 * @author jmleyba@gmail.com (Jason Leyba)
 */
public class JsApiTestSuite extends TestCase {

  public static Test suite() throws Exception {
    TestSuite all = new TestSuite();
    all.setName(JsApiTestSuite.class.getSimpleName());
    all.addTest(createDriverSuite(FirefoxDriver.class, Ignore.Driver.FIREFOX));
    all.addTest(createDriverSuite(ChromeDriver.class, Ignore.Driver.CHROME));
    return all;
  }

  private static Test createDriverSuite(Class<? extends WebDriver> driverClass,
                                        Ignore.Driver driverTag) throws Exception {
    return new TestSuiteBuilder()
        .usingDriver(driverClass)
        .exclude(driverTag)
        .includeJsApiTests()
        .create();
  }
}
