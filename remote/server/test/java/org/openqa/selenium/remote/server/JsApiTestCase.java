package org.openqa.selenium.remote.server;

import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.firefox.FirefoxProfile;

import junit.framework.TestCase;

import java.net.URL;

/**
 * Runs a WebDriverJS test.
 *
 * @author jmleyba@gmail.com (Jason Leyba)
 */
public class JsApiTestCase extends TestCase {
  private static final long HALF_SECOND = 500;
  private static final long TWO_MINUTES = 2 * 60 * 1000;
  private static final String IS_FINISHED_SCRIPT =
      "return webdriver.TestRunner.SINGLETON.isFinished();";
  private static final String NUM_PASSED_SCRIPT =
      "return webdriver.TestRunner.SINGLETON.getNumPassed();";
  private static final String NUM_TESTS_SCRIPT =
      "return webdriver.TestRunner.SINGLETON.getNumTests();";
  private static final String GET_REPORT_SCRIPT =
      "return webdriver.TestRunner.SINGLETON.getReport();";

  private final URL testUrl;
  private final WebDriver driver;

  public JsApiTestCase(URL testUrl, WebDriver driver) {
    this.testUrl = testUrl;
    this.driver = driver;
    this.setName(testUrl.getPath());
  }

  @Override
  protected void runTest() throws Throwable {
    driver.get(testUrl.toString());
    JavascriptExecutor executor = (JavascriptExecutor) driver;
    long start = System.currentTimeMillis();

    do {
      Thread.sleep(HALF_SECOND);
      Object result = executor.executeScript(IS_FINISHED_SCRIPT);
      if (null != result && (Boolean) result) {
        break;
      }

      long now = System.currentTimeMillis();
      long ellapsed = now - start;
      assertTrue("TIMEOUT after " + ellapsed + "ms", ellapsed <= TWO_MINUTES);
    } while (true);

    Object result = executor.executeScript(NUM_PASSED_SCRIPT);
    Long numPassed = result == null ? 0: (Long) result;

    result = executor.executeScript(NUM_TESTS_SCRIPT);
    Long numTests = result == null ? 0: (Long) result;

    String report = (String) executor.executeScript(GET_REPORT_SCRIPT);
    assertEquals(report, numTests, numPassed);
    assertTrue("No tests run!", numTests >= 0);
  }
}
