/*
Copyright 2012 Selenium committers
Copyright 2012 Software Freedom Conservancy

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/


package org.openqa.selenium.javascript;

import static org.openqa.selenium.testing.Ignore.Driver.HTMLUNIT;
import static org.openqa.selenium.testing.Ignore.Driver.IE;
import static org.openqa.selenium.testing.Ignore.Driver.IPHONE;
import static org.openqa.selenium.testing.Ignore.Driver.OPERA;
import static org.openqa.selenium.testing.Ignore.Driver.REMOTE;

import org.openqa.selenium.AbstractDriverTestCase;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JavascriptEnabled;
import org.openqa.selenium.JavascriptExecutor;

/**
 * Runs a WebDriverJS test.
 * 
 * @author jmleyba@gmail.com (Jason Leyba)
 */
@Ignore(value = {HTMLUNIT, IE, IPHONE, REMOTE, OPERA})
public class ClosureTestCase extends AbstractDriverTestCase {

  private static final long TWO_MINUTES = 2 * 60 * 1000;

  private final String relativeUrl;

  public ClosureTestCase(String relativeUrl) {
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
    long numPassed = result == null ? 0 : (Long) result;

    result = executor.executeScript(Query.NUM_TESTS.script);
    long numTests = result == null ? 0 : (Long) result;

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
