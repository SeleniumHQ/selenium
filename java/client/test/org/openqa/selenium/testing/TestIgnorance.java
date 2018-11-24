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

package org.openqa.selenium.testing;

import static com.google.common.base.Preconditions.checkNotNull;

import org.junit.runner.Description;
import org.openqa.selenium.testing.drivers.Browser;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

/**
 * Class that decides whether a test class or method should be ignored.
 */
public class TestIgnorance {

  private IgnoreComparator ignoreComparator = new IgnoreComparator();
  private Set<String> methods = new HashSet<>();
  private Set<String> only = new HashSet<>();
  private Set<String> ignoreMethods = new HashSet<>();
  private Set<String> ignoreClasses = new HashSet<>();

  public TestIgnorance(Browser driver) {
    ignoreComparator.addDriver(checkNotNull(driver,
        "Browser to use must be set. Do this by setting the 'selenium.browser' system property"));

    String onlyRun = System.getProperty("only_run");
    if (onlyRun != null) {
      only.addAll(Arrays.asList(onlyRun.split(",")));
    }

    String method = System.getProperty("method");
    if (method != null) {
      methods.addAll(Arrays.asList(method.split(",")));
    }

    String ignoreClass = System.getProperty("ignore_class");
    if (ignoreClass != null) {
      ignoreClasses.addAll(Arrays.asList(ignoreClass.split(",")));
    }

    String skip = System.getProperty("ignore_method");
    if (skip != null) {
      ignoreMethods.addAll(Arrays.asList(skip.split(",")));
    }
  }

  public boolean isIgnored(Description method) {
    boolean ignored = ignoreComparator.shouldIgnore(method.getTestClass().getAnnotation(IgnoreList.class)) ||
                      ignoreComparator.shouldIgnore(method.getTestClass().getAnnotation(Ignore.class)) ||
                      ignoreComparator.shouldIgnore(method.getAnnotation(IgnoreList.class)) ||
                      ignoreComparator.shouldIgnore(method.getAnnotation(Ignore.class));

    ignored |= isIgnoredBecauseOfJUnit4Ignore(method.getTestClass().getAnnotation(org.junit.Ignore.class));
    ignored |= isIgnoredBecauseOfJUnit4Ignore(method.getAnnotation(org.junit.Ignore.class));
    if (Boolean.getBoolean("ignored_only")) {
      ignored = !ignored;
    }

    ignored |= isIgnoredDueToEnvironmentVariables(method);

    return ignored;
  }

  private boolean isIgnoredBecauseOfJUnit4Ignore(org.junit.Ignore annotation) {
    return annotation != null;
  }

  private boolean isIgnoredDueToEnvironmentVariables(Description method) {
    return (!only.isEmpty() && !only.contains(method.getTestClass().getSimpleName())) ||
           (!methods.isEmpty() && !methods.contains(method.getMethodName())) ||
           ignoreClasses.contains(method.getTestClass().getSimpleName()) ||
           ignoreMethods.contains(method.getMethodName());
  }

}
