/*
Copyright 2012 WebDriver committers
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

package org.openqa.selenium.testing;

import com.google.common.base.Throwables;

import junit.framework.Test;

import org.junit.internal.runners.JUnit38ClassRunner;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;

public class JUnit3SuiteRunner extends JUnit38ClassRunner {

  public JUnit3SuiteRunner(Class<?> klass) {
    this(createSuite(klass));
  }

  public JUnit3SuiteRunner(Test test) {
    super(test);
  }

  private static Test createSuite(Class<?> klass) {
    try {
      Method suiteMethod = klass.getMethod("suite");
      return (Test) suiteMethod.invoke(null);
    } catch (IllegalAccessException e) {
      throw Throwables.propagate(e);
    } catch (InvocationTargetException e) {
      throw Throwables.propagate(e);
    } catch (NoSuchMethodException e) {
      throw Throwables.propagate(e);
    }
  }
}
