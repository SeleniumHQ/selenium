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
import static org.junit.jupiter.api.DynamicTest.dynamicTest;

import java.io.Closeable;
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.nio.file.Path;
import java.util.Collection;
import java.util.List;
import java.util.function.Function;
import java.util.function.Supplier;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DynamicTest;
import org.junit.jupiter.api.TestFactory;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.build.InProject;
import org.openqa.selenium.environment.GlobalTestEnvironment;
import org.openqa.selenium.environment.InProcessTestEnvironment;
import org.openqa.selenium.environment.TestEnvironment;
import org.openqa.selenium.environment.webserver.AppServer;
import org.openqa.selenium.testing.drivers.WebDriverBuilder;

/** JUnit5 test base for Closure-based JavaScript tests. */
class JavaScriptTestSuite {

  private final Supplier<WebDriver> driverSupplier;

  private final long timeout;

  private TestEnvironment testEnvironment;

  public JavaScriptTestSuite() {
    this.timeout = Math.max(0, Long.getLong("js.test.timeout", 0));
    this.driverSupplier = new DriverSupplier();
  }

  private static boolean isBazel() {
    return InProject.findRunfilesRoot() != null;
  }

  @BeforeEach
  public void setup() {
    testEnvironment = GlobalTestEnvironment.getOrCreate(InProcessTestEnvironment::new);
  }

  @AfterEach
  public void teardown() throws IOException {
    if (testEnvironment != null) {
      testEnvironment.stop();
    }
    if (driverSupplier != null) {
      ((Closeable) driverSupplier).close();
    }
  }

  @TestFactory
  public Collection<DynamicTest> dynamicTests() throws IOException {
    final Path baseDir = InProject.findProjectRoot();
    final Function<String, URL> pathToUrlFn =
        s -> {
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
        .map(
            file -> {
              final String path = TestFileLocator.getTestFilePath(baseDir, file);
              String title = path.replaceAll(".html$", "");
              ClosureTestStatement testStatement =
                  new ClosureTestStatement(driverSupplier, path, pathToUrlFn, timeout);

              return dynamicTest(title, testStatement::evaluate);
            })
        .collect(toList());
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
