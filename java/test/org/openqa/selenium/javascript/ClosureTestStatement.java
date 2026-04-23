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

import static java.lang.System.nanoTime;
import static java.util.Objects.requireNonNull;
import static java.util.concurrent.TimeUnit.NANOSECONDS;

import java.net.URL;
import java.util.concurrent.TimeUnit;
import java.util.function.Function;
import java.util.function.Supplier;
import java.util.logging.Logger;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;

class ClosureTestStatement {

  private static final Logger LOG = Logger.getLogger(ClosureTestStatement.class.getName());

  private final Supplier<WebDriver> driverSupplier;
  private final String testPath;
  private final Function<String, URL> filePathToUrlFn;
  private final long timeoutSeconds;

  public ClosureTestStatement(
      Supplier<WebDriver> driverSupplier,
      String testPath,
      Function<String, URL> filePathToUrlFn,
      long timeoutSeconds) {
    this.driverSupplier = driverSupplier;
    this.testPath = testPath;
    this.filePathToUrlFn = filePathToUrlFn;
    this.timeoutSeconds = Math.max(0, timeoutSeconds);
  }

  public void evaluate() throws Throwable {
    URL testUrl = filePathToUrlFn.apply(testPath);
    LOG.info("Running: " + testUrl);

    long start = nanoTime();

    WebDriver driver = driverSupplier.get();

    // Attempt to make the window as big as possible.
    try {
      driver.manage().window().maximize();
    } catch (RuntimeException ignored) {
      // We tried.
    }

    JavascriptExecutor executor = (JavascriptExecutor) driver;
    // Avoid Safari JS leak between tests - clear both Closure and QUnit runners
    executor.executeScript(
        "if (window && window.top) { window.top.G_testRunner = null; window.top.QUnitTestRunner ="
            + " null; }");

    driver.get(testUrl.toString());

    // Detect which test runner is being used and poll accordingly
    TestRunner runner = detectTestRunner(executor);

    while (!runner.isFinished(executor)) {
      long elapsedTime = NANOSECONDS.toSeconds(nanoTime() - start);
      if (timeoutSeconds > 0 && elapsedTime > timeoutSeconds) {
        throw new JavaScriptAssertionError(
            "Tests timed out after "
                + elapsedTime
                + " s. \nCaptured Errors: "
                + ((JavascriptExecutor) driver).executeScript("return window.errors;")
                + "\nPageSource: "
                + driver.getPageSource()
                + "\nScreenshot: "
                + ((TakesScreenshot) driver).getScreenshotAs(OutputType.BASE64));
      }
      TimeUnit.MILLISECONDS.sleep(100);
    }

    if (!runner.isSuccess(executor)) {
      String report = runner.getReport(executor);
      throw new JavaScriptAssertionError(report);
    }
  }

  private TestRunner detectTestRunner(JavascriptExecutor executor) throws InterruptedException {
    // It may take a while for the test runner to initialise
    for (int i = 0; i < 50; i++) {
      boolean hasQUnit =
          (boolean)
              requireNonNull(
                  executor.executeScript("return !!(window.top.QUnitTestRunner || window.QUnit);"));
      if (hasQUnit) {
        LOG.fine("Detected QUnit test runner");
        return TestRunner.QUNIT;
      }

      Boolean hasClosure = (Boolean) executor.executeScript("return !!window.top.G_testRunner;");
      if (Boolean.TRUE.equals(hasClosure)) {
        LOG.fine("Detected Closure test runner");
        return TestRunner.CLOSURE;
      }

      TimeUnit.MILLISECONDS.sleep(100);
    }

    // Default to Closure for backward compatibility
    LOG.warning("Could not detect test runner, defaulting to Closure");
    return TestRunner.CLOSURE;
  }

  private enum TestRunner {
    CLOSURE {
      private static final String PREFIX = "var tr = window.top.G_testRunner;";

      @Override
      boolean isFinished(JavascriptExecutor executor) {
        return Boolean.TRUE.equals(
            executor.executeScript(PREFIX + "return !!tr && tr.isFinished();"));
      }

      @Override
      boolean isSuccess(JavascriptExecutor executor) {
        return Boolean.TRUE.equals(
            executor.executeScript(PREFIX + "return !!tr && tr.isSuccess();"));
      }

      @Override
      String getReport(JavascriptExecutor executor) {
        return (String) executor.executeScript(PREFIX + "return tr.getReport(true);");
      }
    },

    QUNIT {
      private static final String PREFIX = "var tr = window.top.QUnitTestRunner;";

      @Override
      boolean isFinished(JavascriptExecutor executor) {
        return Boolean.TRUE.equals(
            executor.executeScript(PREFIX + "return !!tr && tr.isFinished();"));
      }

      @Override
      boolean isSuccess(JavascriptExecutor executor) {
        return Boolean.TRUE.equals(
            executor.executeScript(PREFIX + "return !!tr && tr.isSuccess();"));
      }

      @Override
      String getReport(JavascriptExecutor executor) {
        return (String) executor.executeScript(PREFIX + "return tr.getReport();");
      }
    };

    abstract boolean isFinished(JavascriptExecutor executor);

    abstract boolean isSuccess(JavascriptExecutor executor);

    abstract String getReport(JavascriptExecutor executor);
  }
}
