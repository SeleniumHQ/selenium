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

import com.google.common.collect.Lists;
import com.google.common.collect.Sets;
import junit.framework.Test;
import junit.framework.TestCase;
import junit.framework.TestSuite;
import org.openqa.selenium.internal.InProject;

import java.io.File;
import java.lang.reflect.AnnotatedElement;
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
  private Set<Ignore.Driver> ignored = Sets.newHashSet();
  private Class<? extends WebDriver> driverClass;
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
  private boolean outputTestNames = false;
  private File baseDir;

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
        || !TestCase.class.isAssignableFrom(rawClass)) {
      return;
    }

    @SuppressWarnings("unchecked")
    Class<? extends TestCase> clazz = (Class<? extends TestCase>) rawClass;

    int modifiers = clazz.getModifiers();

    if (Modifier.isAbstract(modifiers) || !Modifier.isPublic(modifiers)) {
      return;
    }

    if (onlyRun.size() > 0 && !onlyRun.contains(rawClass.getSimpleName())) {
      return;
    }

    if (!packages.isEmpty() && !packages.contains(rawClass.getPackage())) {
      return;
    }

    if (isIgnored(clazz)) {
      System.err.println("Ignoring test class: " + clazz + ": "
                         + clazz.getAnnotation(Ignore.class).reason());
      return;
    }

    if (!withDriver && NeedsDriver.class.isAssignableFrom(clazz)) {
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
                         + method.getDeclaringClass() + ""
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
    if (ignore == null) {
      return false;
    }
    
    if (ignore.value().length == 0) {
      return true;
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

}
