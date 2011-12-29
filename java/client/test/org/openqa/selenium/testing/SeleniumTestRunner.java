/*
Copyright 2011 Software Freedom Conservancy
Copyright 2011 WebDriver committers

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

package org.openqa.selenium.testing;

import com.google.common.base.Throwables;

import org.junit.internal.runners.model.ReflectiveCallable;
import org.junit.internal.runners.statements.Fail;
import org.junit.runner.Description;
import org.junit.runner.notification.RunNotifier;
import org.junit.runners.BlockJUnit4ClassRunner;
import org.junit.runners.model.FrameworkMethod;
import org.junit.runners.model.InitializationError;
import org.junit.runners.model.Statement;
import org.openqa.selenium.testing.drivers.TestIgnorance;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;

public class SeleniumTestRunner extends BlockJUnit4ClassRunner {

  private TestIgnorance ignorance;

  /**
   * Creates a BlockJUnit4ClassRunner to run {@code klass}
   *
   * @throws org.junit.runners.model.InitializationError
   *          if the test class is malformed.
   */
  public SeleniumTestRunner(Class<?> klass) throws InitializationError {
    super(klass);

    ignorance = new TestIgnorance();
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
      runLeaf(new Fail(e), description, notifier);
    }

    if (ignorance.isIgnored(method, test)) {
      notifier.fireTestIgnored(description);
    } else {
      runLeaf(methodBlock(method, test), description, notifier);
    }
  }

  private Statement methodBlock(FrameworkMethod method, Object test) {
    Statement statement = methodInvoker(method, test);
    statement = possiblyExpectingExceptions(method, test, statement);
    statement = withPotentialTimeout(method, test, statement);
    statement = withBefores(method, test, statement);
    statement = withAfters(method, test, statement);
    statement = withRules(method, test, statement);
    return statement;
  }

  private Statement withRules(FrameworkMethod method, Object target, Statement statement) {
    try {
      Method withRules = BlockJUnit4ClassRunner.class.getDeclaredMethod(
          "withRules", FrameworkMethod.class, Object.class, Statement.class);
      withRules.setAccessible(true);

      return (Statement) withRules.invoke(this, method, target, statement);
    } catch (NoSuchMethodException e) {
      throw Throwables.propagate(e);
    } catch (InvocationTargetException e) {
      throw Throwables.propagate(e);
    } catch (IllegalAccessException e) {
      throw Throwables.propagate(e);
    }
  }
}
