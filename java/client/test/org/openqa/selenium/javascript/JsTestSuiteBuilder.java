/*
Copyright 2011 Software Freedom Conservancy.

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

import static com.google.common.base.Preconditions.checkArgument;
import static com.google.common.base.Preconditions.checkNotNull;
import static java.lang.System.getProperty;

import com.google.common.base.Function;
import com.google.common.base.Splitter;
import com.google.common.base.Supplier;
import com.google.common.collect.ImmutableSet;
import com.google.common.collect.Iterables;

import junit.framework.Test;
import junit.framework.TestSuite;

import org.openqa.selenium.testing.drivers.DefaultDriverSupplierSupplier;
import org.openqa.selenium.DriverTestDecorator;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.testing.InProject;

import java.io.File;
import java.io.FilenameFilter;
import java.util.LinkedList;
import java.util.List;

/**
 * Builder for {@link TestSuite suites} that run JavaScript tests.
 */
class JsTestSuiteBuilder {

  private static final String TEST_DIRECTORY_PROPERTY = "js.test.dir";
  private static final String TEST_PATH_PROPERTY = "js.test.url.path";
  private static final String TEST_EXCLUDES_PROPERTY = "js.test.excludes";

  private static final boolean KEEP_DRIVER = true;
  private static final boolean NO_FRESH_DRIVER = false;
  private static final boolean NO_REFRESH_DRIVER = false;

  private Function<String, Test> testFactory = null;
  private Class<? extends WebDriver> driverClazz = null;

  /**
   * @param driverClazz The type of {@link WebDriver} that should be used to
   *     run the tests.
   * @return A self reference.
   */
  public JsTestSuiteBuilder withDriverClazz(
      Class<? extends WebDriver> driverClazz) {
    this.driverClazz = checkNotNull(driverClazz);
    return this;
  }

  /**
   * @param testFactory The function that converts a URL path to a test that
   *     executes the file at that path.
   * @return A self reference.
   */
  public JsTestSuiteBuilder withTestFactory(
      Function<String, Test> testFactory) {
    this.testFactory = checkNotNull(testFactory);
    return this;
  }

  /**
   * @return The newly built test suite.
   */
  public Test build() {
    checkNotNull(testFactory, "No path to test function specified");
    checkNotNull(driverClazz, "No driver class specified");

    File testDirectory = getTestDirectory();
    ImmutableSet<File> excludedFiles = getExcludedFiles(testDirectory);
    String basePath = getTestUrlPath();

    Supplier<WebDriver> driverSupplier =
        new DefaultDriverSupplierSupplier(driverClazz).get();

    TestSuite suite = new TestSuite();
    List<File> testFiles = findTestFiles(testDirectory,
        new TestFilenameFilter(excludedFiles));
    for (File file : testFiles) {
      String testPath = getTestFilePath(basePath, testDirectory, file);
      Test test = testFactory.apply(testPath);
      test = new DriverTestDecorator(test, driverSupplier, KEEP_DRIVER,
          NO_FRESH_DRIVER, NO_REFRESH_DRIVER);
      suite.addTest(test);
    }
    return suite;
  }

  private List<File> findTestFiles(File directory, FilenameFilter filter) {
    checkArgument(directory.isDirectory());

    List<File> files = new LinkedList<File>();
    for (File file : directory.listFiles()) {
      if (file.isDirectory()) {
        files.addAll(findTestFiles(file, filter));
      } else if (filter.accept(file.getParentFile(), file.getName())) {
        files.add(file);
      }
    }
    return files;
  }

  private File getTestDirectory() {
    String testDirName = checkNotNull(getProperty(TEST_DIRECTORY_PROPERTY),
        "You must specify the test directory with the %s system property",
        TEST_DIRECTORY_PROPERTY);

    File testDir = InProject.locate(testDirName);
    checkArgument(testDir.exists(), "Test directory does not exist: %s",
        testDirName);

    return testDir;
  }

  private String getTestUrlPath() {
    String urlPath = checkNotNull(getProperty(TEST_PATH_PROPERTY),
        "You must specify the URL path to use with teh %s system property",
        TEST_PATH_PROPERTY);
    if (!urlPath.endsWith("/")) {
      urlPath += "/";
    }
    return urlPath;
  }

  private ImmutableSet<File> getExcludedFiles(final File testDirectory) {
    String excludedFiles = getProperty(TEST_EXCLUDES_PROPERTY);
    if (excludedFiles == null) {
      return ImmutableSet.of();
    }

    Iterable<String> splitExcludes =
        Splitter.on(',').omitEmptyStrings().split(excludedFiles);

    return ImmutableSet.copyOf(Iterables.transform(splitExcludes,
        new Function<String, File>() {
          public File apply(String input) {
            return new File(testDirectory, input);
          }
        }));
  }

  private String getTestFilePath(String basePath, File testDirectory,
      File testFile) {
    return basePath +
        testFile.getAbsolutePath()
            .replace(testDirectory.getAbsolutePath() + File.separator, "")
            .replace(File.separator, "/");
  }
}
