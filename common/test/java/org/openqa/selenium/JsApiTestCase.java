package org.openqa.selenium;

import static org.openqa.selenium.Ignore.Driver.CHROME;
import static org.openqa.selenium.Ignore.Driver.CHROME_NON_WINDOWS;
import static org.openqa.selenium.Ignore.Driver.HTMLUNIT;
import static org.openqa.selenium.Ignore.Driver.IE;
import static org.openqa.selenium.Ignore.Driver.IPHONE;
import static org.openqa.selenium.Ignore.Driver.REMOTE;

/**
 * Runs a WebDriverJS test.
 *
 * @author jmleyba@gmail.com (Jason Leyba)
 */
@Ignore(value = { HTMLUNIT, IE, IPHONE, CHROME, CHROME_NON_WINDOWS, REMOTE })
public class JsApiTestCase extends AbstractDriverTestCase {

  private static final long TWO_MINUTES = 2 * 60 * 1000;

  private final String relativeUrl;

  public JsApiTestCase(String relativeUrl) {
    this.relativeUrl = relativeUrl;
    this.setName(relativeUrl);
  }

  @Override
  @JavascriptEnabled
  protected void runTest() throws Throwable {
    String testUrl = appServer.whereIs(relativeUrl);
    driver.get(testUrl);
    JavascriptExecutor executor = (JavascriptExecutor) driver;
    long start = System.currentTimeMillis();

    do {
      Object result = executor.executeScript(Query.IS_FINISHED.script);
      if (null != result && (Boolean) result) {
        break;
      }

      long now = System.currentTimeMillis();
      long ellapsed = now - start;
      assertTrue("TIMEOUT after " + ellapsed + "ms", ellapsed <= TWO_MINUTES);
    } while (true);

    Object result = executor.executeScript(Query.NUM_PASSED.script);
    Long numPassed = result == null ? 0: (Long) result;

    result = executor.executeScript(Query.NUM_TESTS.script);
    Long numTests = result == null ? 0: (Long) result;

    String report = (String) executor.executeScript(Query.GET_REPORT.script);
    assertEquals(report, numTests, numPassed);
    assertTrue("No tests run!", numTests >= 0);
  }

  private static enum Query {
    IS_FINISHED("return !!wd && wd.TestRunner.SINGLETON.isFinished();"),
    NUM_PASSED("return wd.TestRunner.SINGLETON.getNumPassed();"),
    NUM_TESTS("return wd.TestRunner.SINGLETON.getNumTests();"),
    GET_REPORT("return wd.TestRunner.SINGLETON.getReport();");

    private final String script;

    private Query(String script) {
      this.script = "var wd = window.webdriver; " + script;
    }
  }
}
