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


package org.openqa.selenium.internal;

import org.openqa.selenium.StandardSeleniumTests;
import org.openqa.selenium.testing.drivers.Browser;
import org.openqa.selenium.testing.drivers.TestIgnorance;

import com.google.common.collect.ImmutableSet;
import com.google.common.io.Files;
import org.junit.internal.runners.model.ReflectiveCallable;
import org.junit.runner.Description;
import org.junit.runner.notification.Failure;
import org.junit.runner.notification.RunNotifier;
import org.junit.runners.BlockJUnit4ClassRunner;
import org.junit.runners.Suite;
import org.junit.runners.model.FrameworkMethod;
import org.junit.runners.model.InitializationError;

import java.io.File;
import java.util.HashSet;
import java.util.Set;

public class IgnoredTestPrinter {
  public IgnoreCollector ignoreCollector = new IgnoreCollector();
  private final Class<StandardSeleniumTests> testClass;

  public static void main(String[] args) throws Throwable {
    new IgnoredTestPrinter(StandardSeleniumTests.class).print();
  }
  
  public IgnoredTestPrinter(Class<StandardSeleniumTests> testClass) {
    this.testClass = testClass;
  }
  
  public void print() throws Throwable {
    Set<Class<?>> testClasses = getTestClasses(testClass);
    for (Class<?> testClass : testClasses) {
      for (Browser browser : Browser.values()) {
        if (browser == Browser.none) {
          continue;
        }
        System.setProperty("selenium.browser", browser.toString());
        new SeleniumIgnoreCollectingTestRunner(testClass).run(new RunNotifier());
      }
    }
    
    final File out = new File("ignores.json");
    Files.write(ignoreCollector.toJson().getBytes(), out);
    System.out.println("Wrote ignores to " + out.getAbsolutePath());
  }

  private Set<Class<?>> getTestClasses(Class<?> suite) {
    Suite.SuiteClasses suiteClasses = suite.getAnnotation(Suite.SuiteClasses.class);
    if (suiteClasses == null) {
      return ImmutableSet.<Class<?>>of(suite);
    }
    
    Set<Class<?>> testClasses = new HashSet<Class<?>>();
    for (Class<?> suiteClass : suiteClasses.value()) {
      testClasses.addAll(getTestClasses(suiteClass));
    }
    return testClasses;
  }

  public class SeleniumIgnoreCollectingTestRunner extends BlockJUnit4ClassRunner {

    private TestIgnorance ignorance;

    public SeleniumIgnoreCollectingTestRunner(Class<?> klass) throws InitializationError {
      super(klass);
      Browser browser = Browser.detect();
      ignorance = new TestIgnorance(browser);
    }

    @Override
    protected void runChild(final FrameworkMethod method, RunNotifier notifier) {
      Object test = null;
      Description description = describeChild(method);
      try {
        test = new ReflectiveCallable() {
          @Override
          protected Object runReflectiveCall() throws Throwable {
            return createTest();
          }
        }.run();
      } catch (Throwable e) {
        Failure failure = new Failure(description, e);
        notifier.fireTestFailure(failure);
        return;
      }

      if (ignorance.isIgnored(method, test)) {
        ignoreCollector.callback(test.getClass(), method.getMethod());
      }
    }
  }
}
