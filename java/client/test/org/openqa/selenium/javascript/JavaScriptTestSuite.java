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

import static java.util.stream.Collectors.toList;

import org.junit.runner.Description;
import org.junit.runner.Runner;
import org.junit.runner.notification.Failure;
import org.junit.runner.notification.RunNotifier;
import org.junit.runners.ParentRunner;
import org.junit.runners.model.InitializationError;
import org.junit.runners.model.Statement;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.environment.GlobalTestEnvironment;
import org.openqa.selenium.environment.InProcessTestEnvironment;
import org.openqa.selenium.environment.TestEnvironment;
import org.openqa.selenium.environment.webserver.AppServer;
import org.openqa.selenium.build.InProject;
import org.openqa.selenium.testing.drivers.WebDriverBuilder;

import java.io.Closeable;
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.nio.file.Path;
import java.util.List;
import java.util.function.Function;
import java.util.function.Supplier;

/**
 * JUnit4 test runner for Closure-based JavaScript tests.
 */
public class JavaScriptTestSuite extends ParentRunner<Runner> {

  private final List<Runner> children;
  private final Supplier<WebDriver> driverSupplier;

  public JavaScriptTestSuite(Class<?> testClass) throws InitializationError, IOException {
    super(testClass);

    long timeout = Math.max(0, Long.getLong("js.test.timeout", 0));

    driverSupplier = new DriverSupplier();

    children = createChildren(driverSupplier, timeout);
  }

  private static boolean isBazel() {
    return InProject.findRunfilesRoot() != null;
  }

  private static List<Runner> createChildren(
      final Supplier<WebDriver> driverSupplier, final long timeout) throws IOException {
    final Path baseDir = InProject.findProjectRoot();
    final Function<String, URL> pathToUrlFn = s -> {
      AppServer appServer = GlobalTestEnvironment.get().getAppServer();
      try {
        String url = "/" + s;
        if (isBazel() && !url.startsWith("/common/generated/")) {
          url = "/filez/selenium" + url;
        }
        return new URL(appServer.whereIs(url));
      } catch (MalformedURLException e) {
        throw new RuntimeException(e);
      }
    };

    List<Path> tests = TestFileLocator.findTestFiles();
    return tests.stream()
        .map(file -> {
          final String path = TestFileLocator.getTestFilePath(baseDir, file);
          Description description = Description.createSuiteDescription(
              path.replaceAll(".html$", ""));

          Statement testStatement = new ClosureTestStatement(
              driverSupplier, path, pathToUrlFn, timeout);
          return new StatementRunner(testStatement, description);
        })
        .collect(toList());
  }

  @Override
  protected List<Runner> getChildren() {
    return children;
  }

  @Override
  protected Description describeChild(Runner child) {
    return child.getDescription();
  }

  @Override
  protected void runChild(Runner child, RunNotifier notifier) {
    child.run(notifier);
  }

  @Override
  protected Statement classBlock(RunNotifier notifier) {
    final Statement suite = super.classBlock(notifier);

    return new Statement() {
      @Override
      public void evaluate() throws Throwable {
        TestEnvironment testEnvironment = null;
        try {
          testEnvironment = GlobalTestEnvironment.getOrCreate(InProcessTestEnvironment::new);
          suite.evaluate();
        } finally {
          if (testEnvironment != null) {
            testEnvironment.stop();
          }
          if (driverSupplier instanceof Closeable) {
            ((Closeable) driverSupplier).close();
          }
        }
      }
    };
  }

  private static class StatementRunner extends Runner {

    private final Description description;
    private final Statement testStatement;

    private StatementRunner(Statement testStatement, Description description) {
      this.testStatement = testStatement;
      this.description = description;
    }

    @Override
    public Description getDescription() {
      return description;
    }

    @Override
    public void run(RunNotifier notifier) {
      notifier.fireTestStarted(description);
      try {
        testStatement.evaluate();
      } catch (Throwable throwable) {
        Failure failure = new Failure(description, throwable);
        notifier.fireTestFailure(failure);
      } finally {
        notifier.fireTestFinished(description);
      }
    }
  }

  private static class DriverSupplier implements Supplier<WebDriver>, Closeable {

    private volatile WebDriver driver;

    @Override
    public WebDriver get() {
      if (driver != null) {
        return driver;
      }

      synchronized (this) {
        if (driver == null) {
          driver = new WebDriverBuilder().get();
        }
      }

      return driver;
    }

    public void close() {
      if (driver != null) {
        driver.quit();
      }
    }
  }
}
