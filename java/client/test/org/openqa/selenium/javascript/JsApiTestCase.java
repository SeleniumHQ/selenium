package org.openqa.selenium.javascript;

import static org.openqa.selenium.Ignore.Driver.CHROME;
import static org.openqa.selenium.Ignore.Driver.HTMLUNIT;
import static org.openqa.selenium.Ignore.Driver.IE;
import static org.openqa.selenium.Ignore.Driver.IPHONE;
import static org.openqa.selenium.Ignore.Driver.OPERA;
import static org.openqa.selenium.Ignore.Driver.REMOTE;

import org.openqa.selenium.AbstractDriverTestCase;
import org.openqa.selenium.Ignore;
import org.openqa.selenium.JavascriptEnabled;
import org.openqa.selenium.JavascriptExecutor;

/**
 * Runs a WebDriverJS test.
 *
 * @author jmleyba@gmail.com (Jason Leyba)
 */
@Ignore(value = { HTMLUNIT, IE, IPHONE, CHROME, REMOTE, OPERA })
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
    long numPassed = result == null ? 0: (Long) result;

    result = executor.executeScript(Query.NUM_TESTS.script);
    long numTests = result == null ? 0: (Long) result;

    result = executor.executeScript(Query.NUM_ERRORS.script);
    long numErrors = result == null ? 0 : (Long) result;


    String report = (String) executor.executeScript(Query.GET_REPORT.script);
    assertEquals(report, numTests, numPassed);
    assertEquals(report, 0L, numErrors);
    assertTrue("No tests run!", numTests >= 0);
  }

  private static enum Query {
    IS_FINISHED("return !!tr && tr.isFinished();"),
    NUM_PASSED("return tr.testCase.result_.successCount;"),
    NUM_TESTS("return tr.testCase.result_.totalCount;"),
    NUM_ERRORS("return tr.testCase.result_.errors.length;"),
    GET_REPORT("return tr.getReport();");

    private final String script;

    private Query(String script) {
      this.script = "var tr = window.G_testRunner;" + script;
    }
  }
}
