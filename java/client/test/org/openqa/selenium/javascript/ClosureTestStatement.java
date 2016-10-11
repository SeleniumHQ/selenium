// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

package org.openqa.selenium.javascript;

import static org.junit.Assert.fail;

import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;

import com.google.common.base.Function;
import com.google.common.base.Stopwatch;
import com.google.common.base.Supplier;
import org.junit.runners.model.Statement;

import java.net.URL;
import java.util.concurrent.TimeUnit;
import java.util.logging.Logger;

public class ClosureTestStatement extends Statement {

  private static final Logger LOG = Logger.getLogger(ClosureTestStatement.class.getName());

  private final Supplier<WebDriver> driverSupplier;
  private final String testPath;
  private final Function<String, URL> filePathToUrlFn;
  private final long timeoutSeconds;

  public ClosureTestStatement(Supplier<WebDriver> driverSupplier,
      String testPath, Function<String, URL> filePathToUrlFn, long timeoutSeconds) {
    this.driverSupplier = driverSupplier;
    this.testPath = testPath;
    this.filePathToUrlFn = filePathToUrlFn;
    this.timeoutSeconds = Math.max(0, timeoutSeconds);
  }

  @Override
  public void evaluate() throws Throwable {
    URL testUrl = filePathToUrlFn.apply(testPath);
    LOG.info("Running: " + testUrl);

    Stopwatch stopwatch = Stopwatch.createStarted();

    WebDriver driver = driverSupplier.get();

    // Attempt to make the window as big as possible.
    try {
      driver.manage().window().maximize();
    } catch (RuntimeException ignored) {
      // We tried.
    }


    JavascriptExecutor executor = (JavascriptExecutor) driver;
    // Avoid Safari JS leak between tests.
    executor.executeScript("if (window && window.top) window.top.G_testRunner = null");

    try {
      driver.get(testUrl.toString());
    } catch (WebDriverException e) {
      fail("Test failed to load: " + e.getMessage());
    }

    while (!getBoolean(executor, Query.IS_FINISHED)) {
      long elapsedTime = stopwatch.elapsed(TimeUnit.SECONDS);
      if (timeoutSeconds > 0 && elapsedTime > timeoutSeconds) {
        throw new JavaScriptAssertionError("Tests timed out after " + elapsedTime + " s. \nCaptured Errors: " +
                                           ((JavascriptExecutor) driver).executeScript("return window.errors;")
                                           + "\nPageSource: " + driver.getPageSource() + "\nScreenshot: " +
                                           ((TakesScreenshot)driver).getScreenshotAs(OutputType.BASE64));
      }
      TimeUnit.MILLISECONDS.sleep(100);
    }

    if (!getBoolean(executor, Query.IS_SUCCESS)) {
      String report = getString(executor, Query.GET_REPORT);
      throw new JavaScriptAssertionError(report);
    }
  }

  private boolean getBoolean(JavascriptExecutor executor, Query query) {
    return (Boolean) executor.executeScript(query.script);
  }

  private String getString(JavascriptExecutor executor, Query query) {
    return (String) executor.executeScript(query.script);
  }

  private static enum Query {
    IS_FINISHED("return !!tr && tr.isFinished();"),
    IS_SUCCESS("return !!tr && tr.isSuccess();"),
    GET_REPORT("return tr.getReport(true);");

    private final String script;

    private Query(String script) {
      this.script = "var tr = window.top.G_testRunner;" + script;
    }
  }
}
