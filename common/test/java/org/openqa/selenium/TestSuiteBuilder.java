/*
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.

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

package org.openqa.selenium;

import junit.framework.Test;
import junit.framework.TestCase;
import junit.framework.TestSuite;

import java.io.File;
import java.io.FilenameFilter;
import java.lang.reflect.AnnotatedElement;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.Set;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;

public class TestSuiteBuilder {

  private File baseDir;
  private File jsTestDir;
  private Set<File> sourceDirs = new HashSet<File>();
  private Set<Ignore.Driver> ignored = new HashSet<Ignore.Driver>();
  private Class<? extends WebDriver> driverClass;
  private boolean keepDriver;
  private boolean includeJavascript;
  private boolean withDriver = true;
  private boolean withEnvironment = true;
  private String onlyRun;
  private Set<String> patterns = new HashSet<String>();
  private Set<String> excludePatterns = new HashSet<String>();
  private Set<String> testMethodNames = new HashSet<String>();
  private Set<String> decorators = new LinkedHashSet<String>();
  private boolean includeJsApiTests = false;
  private boolean outputTestNames = false;

  public TestSuiteBuilder() {
    baseDir = new File(".").getAbsoluteFile();

    while (baseDir != null && !(new File(baseDir, "Rakefile").exists())) {
      baseDir = baseDir.getParentFile();
    }

    assertThat(baseDir, notNullValue());
    assertThat(baseDir.exists(), is(true));

    jsTestDir = new File(baseDir, "common/test/js");
    assertThat(jsTestDir.isDirectory(), is(true));
  }

  public TestSuiteBuilder addSourceDir(String dirName) {
    File dir = new File(baseDir, dirName + "/test/java");

    if (dir.exists()) {
      sourceDirs.add(dir);
    }

    return this;
  }

  public TestSuiteBuilder usingDriver(Class<? extends WebDriver> ss) {
    this.driverClass = ss;
    return this;
  }

  @SuppressWarnings("unchecked")
  public TestSuiteBuilder usingDriver(String driverClassName) {
    try {
      Class<?> clazz = Class.forName(driverClassName);
      return usingDriver((Class<? extends WebDriver>) clazz);
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  }

  public TestSuiteBuilder exclude(Ignore.Driver tagToIgnore) {
    ignored.add(tagToIgnore);
    return this;
  }

  public TestSuiteBuilder keepDriverInstance() {
    keepDriver = true;

    return this;
  }

  public Test create() throws Exception {
    if (withDriver) {
      assertThat("No driver class set", driverClass, is(notNullValue()));
    }

    TestSuite suite = new TestSuite();
    for (File dir : sourceDirs) {
      addTestsRecursively(suite, dir);
    }

    if (includeJsApiTests && includeJavascript) {
      addJsApiTests(suite);
    }

    TestSuite toReturn = new TestSuite();
    if (withEnvironment) {
      toReturn.addTest(new EnvironmentStarter(suite));
    } else {
      toReturn.addTest(suite);
    }

    if (suite.countTestCases() == 0) {
      System.err.println("No test cases found");
    }
    return decorate(toReturn);
  }

  private Test decorate(TestSuite toDecorate) throws Exception {
    TestSuite toReturn = toDecorate;

    for (String name : decorators) {
      TestSuite temp = new TestSuite();
      Test test = (Test) Class.forName(name).getConstructor(Test.class).newInstance(toReturn);
      temp.addTest(test);
      toReturn = temp;
    }

    return toReturn;
  }

  private void addTestsRecursively(TestSuite suite, File dir) {
    File[] files = dir.listFiles();
    for (File file : files) {
      if (file.isDirectory()) {
        addTestsRecursively(suite, file);
      } else {
        addTestsFromFile(suite, file);
      }
    }
  }

  private void addTestsFromFile(TestSuite suite, File file) {
    Class<?> rawClass = getClassFrom(file);
    if (rawClass == null
        || !TestCase.class.isAssignableFrom(rawClass)
        || JsApiTestCase.class.isAssignableFrom(rawClass)) {
      return;
    }

    @SuppressWarnings("unchecked")
    Class<? extends TestCase> clazz = (Class<? extends TestCase>) rawClass;

    int modifiers = clazz.getModifiers();

    if (Modifier.isAbstract(modifiers) || !Modifier.isPublic(modifiers)) {
      return;
    }

    if (onlyRun != null && !clazz.getName().endsWith(onlyRun)) {
      return;
    }

    if (isIgnored(clazz)) {
      System.err.println("Ignoring test class: " + clazz + ": "
                         + clazz.getAnnotation(Ignore.class).reason());
      return;
    }

    boolean include = true;
    if (patterns.size() >0) {
      include = false;
      for (String pattern : patterns) {
        include |= clazz.getName().matches(pattern);
      }
    }
    if (!include) {
      return;
    }

    for (String excludePattern : excludePatterns) {
      if (clazz.getName().matches(excludePattern)) {
        return;
      }
    }

    Method[] methods = clazz.getMethods();
    for (Method method : methods) {
      if (isTestMethod(method)) {
        Test test = TestSuite.createTest(clazz, method.getName());
        if (test instanceof NeedsDriver) {
          boolean freshDriver = false;
          if (method.isAnnotationPresent(NeedsFreshDriver.class)) {
            freshDriver = true;
          }

          boolean restartDriver = false;
          if (method.isAnnotationPresent(NoDriverAfterTest.class)) {
            restartDriver = true;
          }

          if (withDriver) {
            test = new DriverTestDecorator(test, driverClass,
                                           keepDriver, freshDriver, restartDriver);
          }
        }
        if (outputTestNames) {
          test = new TestNameDecorator(test);
        }
        suite.addTest(test);
      }
    }
  }

  private boolean isTestMethod(Method method) {
    if (!testMethodNames.isEmpty()) {
      return testMethodNames.contains(method.getName());
    }

    if (isIgnored(method)) {
      System.err.println("Ignoring: "
                         + method.getDeclaringClass() + "."
                         + method.getName() + ": "
                         + method.getAnnotation(Ignore.class).reason());
      return false;
    }

    if (!includeJavascript
        && method.isAnnotationPresent(JavascriptEnabled.class)) {
      return false;
    }

    return method.getName().startsWith("test")
           || method.getAnnotation(org.junit.Test.class) != null;
  }

  private boolean isIgnored(AnnotatedElement annotatedElement) {
    Ignore ignore = annotatedElement.getAnnotation(Ignore.class);
    if (ignore == null || ignore.value().length == 0) {
      return false;
    }

    for (Ignore.Driver value : ignore.value()) {
      for (Ignore.Driver name : ignored) {
        if (value == name || value == Ignore.Driver.ALL) {
          return true;
        }
      }
    }

    return false;
  }

  private Class<?> getClassFrom(File file) {
    String path = file.getPath().replace('\\', '/');

    if (!path.endsWith(".java")) {
      return null;
    }

    // Assume that all classes are under a "org" package
    int index = path.indexOf("/org/");
    if (index == -1) {
      return null;
    }

    path = path.substring(index + 1, path.length() - ".java".length());
    path = path.replace("/", ".");

    try {
      return Class.forName(path);
    } catch (Throwable e) {
      return null;
    }
  }

  public TestSuiteBuilder includeJavascriptTests() {
    includeJavascript = true;

    return this;
  }

  /**
   * Include tests for WebDriverJS; implies {@link #includeJavascriptTests()}.
   * No tests will be run if {@link #usingNoDriver()} is set.
   * @return A self reference.
   * @see #includeJavascriptTests()
   * @see #usingNoDriver()
   */
  public TestSuiteBuilder includeJsApiTests() {
    this.includeJsApiTests = true;
    return includeJavascriptTests();
  }
  
  public TestSuiteBuilder outputTestNames() {
    outputTestNames = true;
    
    return this;
  }

  public TestSuiteBuilder usingNoDriver() {
    withDriver = false;

    return this;
  }

  public TestSuiteBuilder withoutEnvironment() {
    withEnvironment = false;

    return this;
  }

  public TestSuiteBuilder onlyRun(String testCaseName) {
    onlyRun = "." + testCaseName;

    return this;
  }

  public TestSuiteBuilder method(String testMethodName) {
    this.testMethodNames.add(testMethodName);

    return this;
  }

  public TestSuiteBuilder addSuiteDecorator(String decoratorClassName) {
    decorators.add(decoratorClassName);
    return this;
  }

  public TestSuiteBuilder leaveRunning() {
    System.setProperty("webdriver.singletestsuite.leaverunning", "true");
    return this;
  }

  /**
   * Adds the tests for the WebDriver JS API to the given TestSuite. The tests
   * will not be added if the given WebDriver instance is not supported by
   * WebDriverJS or if the suite is configured to run tests without a WebDriver
   * instance.
   *
   * @param suite The suite to add the JS API tests to.
   */
  private void addJsApiTests(TestSuite suite) {
    if (isIgnored(JsApiTestCase.class)) {
      System.err.println("Ignoring JS API tests for " + driverClass.getName() + ": "
                         + JsApiTestCase.class.getAnnotation(Ignore.class).reason());
      return;
    } else if (!withDriver) {
      System.err.println("Skipping JS API tests: tests require a driver instance");
      return;
    }

    for (File file : jsTestDir.listFiles(new TestFilenameFilter())) {
      String path = file.getAbsolutePath()
          .replace(jsTestDir.getAbsolutePath() + File.separator, "")
          .replace(File.separator, "/");
      TestCase test = new JsApiTestCase("/js/test/" + path);
      suite.addTest(new DriverTestDecorator(test, driverClass,
          /*keepDriver=*/true, /*freshDriver=*/false, /*refreshDriver=*/false));
    }
  }

  public TestSuiteBuilder pattern(String pattern) {
    patterns.add(pattern);
    return this;
  }

  public TestSuiteBuilder excludePattern(String pattern) {
    excludePatterns.add(pattern);
    return this;
  }

  /**
   * Filter used to identify JS API test case files in a directory.
   */
  private static class TestFilenameFilter implements FilenameFilter {
    /** @inheritDoc */
    public boolean accept(File dir, String name) {
      return name.endsWith("_test.html");
    }
  }
}
