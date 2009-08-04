package org.openqa.selenium.remote.server;

import junit.framework.TestCase;
import junit.framework.Test;
import junit.framework.TestSuite;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.firefox.FirefoxProfile;
import org.openqa.selenium.JavascriptExecutor;

import java.util.logging.Logger;

/**
 * Automated test runner for the JS API.
 * 
 * @author jmleyba@gmail.com (Jason Leyba)
 */
public class JsApiTestSuite extends TestCase {

  private static final Logger LOGGER =
      Logger.getLogger(JsApiTestSuite.class.getName());

  private static final long FIFTEEN_MINUTES = 15 * 60 * 1000;
  private static final String IS_FINISHED_SCRIPT =
      "return webdriver.TestRunner.SINGLETON.isFinished();";
  private static final String NUM_PASSED_SCRIPT =
      "return webdriver.TestRunner.SINGLETON.getNumPassed();";
  private static final String NUM_TESTS_SCRIPT =
      "return webdriver.TestRunner.SINGLETON.getNumTests();";
  private static final String GET_REPORT_SCRIPT =
      "return webdriver.TestRunner.SINGLETON.getReport();";


  protected JsApiTestServer testServer;
  protected FirefoxDriver driver;

  public static Test suite() throws Exception {
    TestSuite suite = new TestSuite();
    suite.setName(JsApiTestSuite.class.getName());
    suite.addTestSuite(JsApiTestSuite.class);
    return suite;
  }

  @Override
  protected void setUp() throws Exception {
    super.setUp();
    testServer = new JsApiTestServer();

    Thread t = new Thread() {
      @Override
      public void run() {
        testServer.start();
      }
    };
    t.setDaemon(true);
    t.start();
    Thread.sleep(1000);

    FirefoxProfile profile = new FirefoxProfile();
    profile.setEnableNativeEvents(false);  // Native events aren't 100% yet.
    driver = new FirefoxDriver(profile);
  }

  @Override
  protected void tearDown() throws Exception {
    super.tearDown();
    testServer.stop();
    driver.quit();
  }

  public void testLocalCommandProcessorOnFirefox() throws Exception {
    String url = testServer.whereIs(
        "/remote", "selenium/tests/localcommandprocessor_testsuite.html");
    driver.get(url);
    JavascriptExecutor executor = (JavascriptExecutor) driver;
    long start = System.currentTimeMillis();

    do {
      Thread.sleep(3 * 1000);
      Object result = executor.executeScript(IS_FINISHED_SCRIPT);
      if (null != result && (Boolean) result) {
        break;
      }

      long now = System.currentTimeMillis();
      long ellapsed = now - start;
      if (ellapsed > FIFTEEN_MINUTES) {
        fail("TIMEOUT: JS API tests should not take more than 15 minutes");
      }
    } while (true);

    Object result = executor.executeScript(NUM_PASSED_SCRIPT);
    Long numPassed = result == null ? 0: (Long) result;

    result = executor.executeScript(NUM_TESTS_SCRIPT);
    Long numTests = result == null ? 0: (Long) result;

    String report = (String) executor.executeScript(GET_REPORT_SCRIPT);
    assertEquals(report, numTests, numPassed);
  }

}
