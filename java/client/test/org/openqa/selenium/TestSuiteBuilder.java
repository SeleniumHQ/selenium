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

import com.google.common.base.Supplier;
import com.google.common.collect.Lists;
import com.google.common.collect.Sets;

import junit.framework.Test;
import junit.framework.TestCase;
import junit.framework.TestSuite;

import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.IgnoredTestCallback;
import org.openqa.selenium.testing.InProject;
import org.openqa.selenium.testing.JavascriptEnabled;
import org.openqa.selenium.testing.NeedsLocalEnvironment;
import org.openqa.selenium.testing.drivers.Browser;
import org.openqa.selenium.testing.drivers.SauceDriver;
import org.openqa.selenium.testing.drivers.TestIgnorance;
import org.openqa.selenium.testing.drivers.WebDriverBuilder;

import java.io.File;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.util.List;
import java.util.Set;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.junit.Assert.assertTrue;

public class TestSuiteBuilder {
  private Set<File> sourceDirs = Sets.newHashSet();
  private boolean keepDriver;
  private boolean includeJavascript;
  private boolean withDriver = true;
  private boolean withEnvironment = true;
  private List<String> onlyRun = Lists.newArrayList();
  private Set<String> patterns = Sets.newHashSet();
  private Set<String> excludePatterns = Sets.newHashSet();
  private Set<String> testMethodNames = Sets.newHashSet();
  private Set<String> decorators = Sets.newLinkedHashSet();
  private Set<Package> packages = Sets.newLinkedHashSet();
  private Set<IgnoredTestCallback> ignoredTestCallbacks = Sets.newHashSet();
  private boolean outputTestNames = false;
  private File baseDir;
  private TestIgnorance ignorance = new TestIgnorance(Browser.none);
  private Browser browser;

  public TestSuiteBuilder() {
    baseDir = InProject.locate("Rakefile").getParentFile();
  }

  public TestSuiteBuilder addSourceDir(String dirName) {
    File toAdd = new File(baseDir, dirName);
    assertTrue("Directory does not exist:" + dirName, toAdd.exists());
    assertTrue("Directory is not a directory:" + dirName, toAdd.isDirectory());
    sourceDirs.add(toAdd);
    return this;
  }

  public TestSuiteBuilder using(Browser browser) {
    this.browser = browser;
    ignorance.setBrowser(browser);
    return this;
  }

  public TestSuiteBuilder keepDriverInstance() {
    keepDriver = true;

    return this;
  }

  /**
   * If the onlyRun list and the testMethodNames list are empty, the class name and the method name
   * defined in the system properties are added to the lists if they exist.
   */
  private void applySystemProperties() {
    // Add the test case rules defined in the system properties only if there
    // were no other test cases specified in the test suite specification.
    String onlyRunProperty = System.getProperty("only_run");
    if (onlyRunProperty != null) {
      for (String classname : onlyRunProperty.split(",")) {
        onlyRun(classname);
      }
    }

    if (testMethodNames.isEmpty()) {
      String methodProperty = System.getProperty("method");
      if (methodProperty != null) {
        method(methodProperty);
      }
    }
  }

  public Test create() throws Exception {
    applySystemProperties();

    if (ignoredTestCallbacks.isEmpty()) {
      ignoredTestCallbacks.add(new LoggingIgnoreCallback());
    }

    if (withDriver) {
      assertThat("No driver class set", browser, is(notNullValue()));
    }

    TestSuite suite = new TestSuite();
    for (File dir : sourceDirs) {
      addTestsRecursively(suite, dir);
    }

    TestSuite toReturn = new TestSuite();
    if (withEnvironment) {
      toReturn.addTest(new EnvironmentStarter(suite));
    } else {
      toReturn.addTest(suite);
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
        || !TestCase.class.isAssignableFrom(rawClass)) {
      return;
    }

    @SuppressWarnings("unchecked")
    Class<? extends TestCase> clazz = (Class<? extends TestCase>) rawClass;

    int modifiers = clazz.getModifiers();

    if (Modifier.isAbstract(modifiers) || !Modifier.isPublic(modifiers)) {
      return;
    }

    if (!onlyRun.isEmpty() && !onlyRun.contains(rawClass.getSimpleName())) {
      return;
    }

    if (!packages.isEmpty() && !packages.contains(rawClass.getPackage())) {
      return;
    }

    if (ignorance.isIgnored(clazz)) {
      invokeIgnoreCallbacks(clazz, "", clazz.getAnnotation(Ignore.class));
      return;
    }

    if (clazz.isAnnotationPresent(NeedsLocalEnvironment.class) && !isUsingLocalTestEnvironment()) {
      String reason = clazz.getAnnotation(NeedsLocalEnvironment.class).reason();
      System.err.printf(
        "Ignoring %s (Needs local environment%s)%n",
        clazz.getName(),
        reason == null ? "" : ": " + reason);
      return;
    }

    if (!withDriver && NeedsDriver.class.isAssignableFrom(clazz)) {
      return;
    }

    boolean include = true;
    if (!patterns.isEmpty()) {
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

          if (withDriver && browser != null) {
            Supplier<WebDriver> supplier = new WebDriverBuilder(browser);
            test = new DriverTestDecorator(test, supplier,
                keepDriver, freshDriver, restartDriver);
          }
        }
        if (outputTestNames) {
          test = new TestNameDecorator(test);
        }
        System.err.println(test);
        suite.addTest(test);
      }
    }
  }

  private boolean isTestMethod(Method method) {
    if (!testMethodNames.isEmpty()) {
      return testMethodNames.contains(method.getName());
    }

    if (ignorance.isIgnored(method)) {
      invokeIgnoreCallbacks(method.getDeclaringClass(), method.getName(), method.getAnnotation(Ignore.class));
      return false;
    }
    
    if (method.isAnnotationPresent(NeedsLocalEnvironment.class) && !isUsingLocalTestEnvironment()) {
      String reason = method.getAnnotation(NeedsLocalEnvironment.class).reason();
      System.err.printf(
        "Ignoring %s.%s (Needs local environment%s)%n",
        method.getDeclaringClass().getName(),
        method.getName(),
        reason == null ? "" : ": " + reason);
      return false;
    }

    if (!includeJavascript
        && method.isAnnotationPresent(JavascriptEnabled.class)) {
      return false;
    }

    return method.getName().startsWith("test")
        || method.getAnnotation(org.junit.Test.class) != null;
  }

  private static boolean isUsingLocalTestEnvironment() {
    return !SauceDriver.shouldUseSauce();
  }

  private void invokeIgnoreCallbacks(Class clazz, String methodName, Ignore ignore) {
    for (IgnoredTestCallback ignoredTestCallback : ignoredTestCallbacks) {
      ignoredTestCallback.callback(clazz, methodName, ignore);
    }
  }

  private Class<?> getClassFrom(File file) {
    String path = file.getPath().replace('\\', '/');

    if (!path.endsWith(".java")) {
      return null;
    }

    // Assume that all classes are under a "org" or "com" package
    int index = path.indexOf("/org/");
    if (index == -1) {
      index = path.indexOf("/com/");
      if (index == -1) {
        return null;
      }
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
    onlyRun.add(testCaseName);

    return this;
  }

  public TestSuiteBuilder onlyRun(Class testCaseClass) {
    onlyRun.add(testCaseClass.getSimpleName());

    return this;
  }

  public TestSuiteBuilder method(String testMethodName) {
    this.testMethodNames.add(testMethodName);

    return this;
  }

  public TestSuiteBuilder restrictToPackage(Package pkg) {
    this.packages.add(pkg);
    return this;
  }

  public TestSuiteBuilder restrictToPackage(String pkgName) {
    return restrictToPackage(Package.getPackage(pkgName));
  }

  public TestSuiteBuilder addSuiteDecorator(String decoratorClassName) {
    decorators.add(decoratorClassName);
    return this;
  }

  public TestSuiteBuilder leaveRunning() {
    System.setProperty("webdriver.singletestsuite.leaverunning", "true");
    return this;
  }

  public TestSuiteBuilder pattern(String pattern) {
    patterns.add(pattern);
    return this;
  }

  public TestSuiteBuilder excludePattern(String pattern) {
    excludePatterns.add(pattern);
    return this;
  }

  public static Platform getEffectivePlatform() {
    return (isUsingLocalTestEnvironment()) ?
        Platform.getCurrent() : SauceDriver.getEffectivePlatform();
  }

  public TestSuiteBuilder withIgnoredTestCallback(IgnoredTestCallback ignoredTestCallback) {
    ignoredTestCallbacks.add(ignoredTestCallback);
    return this;
  }

  public class LoggingIgnoreCallback implements IgnoredTestCallback {
    public void callback(Class clazz, String testName, Ignore ignore) {
      String message;

      if(testName.isEmpty()) {
        message = "Ignoring test class: " + clazz.getName();
      } else {
        message = "Ignoring: " + clazz.getName() + "." + testName;
      }

      String reason = ignore == null ? "No reason given" : ignore.reason();
      System.err.println(message + ": " + reason);
    }
  }
}
