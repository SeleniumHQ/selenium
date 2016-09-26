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

package org.openqa.selenium.testing.drivers;

import static com.google.common.base.Preconditions.checkNotNull;
import static org.openqa.selenium.Platform.LINUX;
import static org.openqa.selenium.Platform.WINDOWS;
import static org.openqa.selenium.testing.Driver.ALL;
import static org.openqa.selenium.testing.Driver.CHROME;
import static org.openqa.selenium.testing.Driver.EDGE;
import static org.openqa.selenium.testing.Driver.FIREFOX;
import static org.openqa.selenium.testing.Driver.HTMLUNIT;
import static org.openqa.selenium.testing.Driver.IE;
import static org.openqa.selenium.testing.Driver.MARIONETTE;
import static org.openqa.selenium.testing.Driver.PHANTOMJS;
import static org.openqa.selenium.testing.Driver.REMOTE;
import static org.openqa.selenium.testing.Driver.SAFARI;
import static org.openqa.selenium.testing.drivers.Browser.chrome;
import static org.openqa.selenium.testing.drivers.Browser.htmlunit;
import static org.openqa.selenium.testing.drivers.Browser.htmlunit_js;
import static org.openqa.selenium.testing.drivers.Browser.ie;
import static org.openqa.selenium.testing.drivers.Browser.opera;
import static org.openqa.selenium.testing.drivers.Browser.phantomjs;

import com.google.common.collect.ImmutableSet;
import com.google.common.collect.Sets;

import org.junit.runner.Description;
import org.openqa.selenium.Platform;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JavascriptEnabled;
import org.openqa.selenium.testing.NativeEventsRequired;
import org.openqa.selenium.testing.NeedsLocalEnvironment;

import java.util.Arrays;
import java.util.Set;

/**
 * Class that decides whether a test class or method should be ignored.
 */
public class TestIgnorance {

  private Set<Browser> alwaysNativeEvents = ImmutableSet.of(chrome, ie, opera);
  private Set<Browser> neverNativeEvents = ImmutableSet.of(
      htmlunit, htmlunit_js, phantomjs);
  private IgnoreComparator ignoreComparator = new IgnoreComparator();
  private Set<String> methods = Sets.newHashSet();
  private Set<String> only = Sets.newHashSet();
  private Set<String> ignoreMethods = Sets.newHashSet();
  private Set<String> ignoreClasses = Sets.newHashSet();
  private Browser browser;

  public TestIgnorance(Browser browser) {
    setBrowser(browser);

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
    boolean ignored = ignoreComparator.shouldIgnore(method.getTestClass().getAnnotation(Ignore.class)) ||
                      ignoreComparator.shouldIgnore(method.getAnnotation(Ignore.class));

    ignored |= isIgnoredBecauseOfJUnit4Ignore(method.getTestClass().getAnnotation(org.junit.Ignore.class));
    ignored |= isIgnoredBecauseOfJUnit4Ignore(method.getAnnotation(org.junit.Ignore.class));
    if (Boolean.getBoolean("ignored_only")) {
      ignored = !ignored;
    }

    ignored |= isIgnoredDueToJavascript(method.getTestClass().getAnnotation(JavascriptEnabled.class));
    ignored |= isIgnoredDueToJavascript(method.getAnnotation(JavascriptEnabled.class));

    ignored |= isIgnoredBecauseOfNativeEvents(method.getTestClass().getAnnotation(NativeEventsRequired.class));
    ignored |= isIgnoredBecauseOfNativeEvents(method.getAnnotation(NativeEventsRequired.class));

    ignored |= isIgnoredDueToEnvironmentVariables(method);

    ignored |= isIgnoredDueToBeingOnSauce(method);

    return ignored;
  }

  private boolean isIgnoredBecauseOfJUnit4Ignore(org.junit.Ignore annotation) {
    return annotation != null;
  }

  private boolean isIgnoredBecauseOfNativeEvents(NativeEventsRequired annotation) {
    if (annotation == null) {
      return false;
    }

    if (neverNativeEvents.contains(browser)) {
      return true;
    }

    if (alwaysNativeEvents.contains(browser)) {
      return false;
    }

    if (!Boolean.getBoolean("selenium.browser.native_events")) {
      return true;
    }

    // We only have native events on Linux and Windows.
    Platform platform = getEffectivePlatform();
    return !(platform.is(LINUX) || platform.is(WINDOWS));
  }

  private static Platform getEffectivePlatform() {
    if (SauceDriver.shouldUseSauce()) {
      return SauceDriver.getEffectivePlatform();
    }

    return Platform.getCurrent();
  }

  private boolean isIgnoredDueToBeingOnSauce(Description method) {
    boolean isLocal = method.getAnnotation(NeedsLocalEnvironment.class) != null
                      || method.getTestClass().getAnnotation(NeedsLocalEnvironment.class) != null;
    if (SauceDriver.shouldUseSauce()) {
      return isLocal;
    }
    return Boolean.getBoolean("local_only") && !isLocal;
  }

  private boolean isIgnoredDueToJavascript(JavascriptEnabled enabled) {
    return enabled != null && !browser.isJavascriptEnabled();
  }

  private boolean isIgnoredDueToEnvironmentVariables(Description method) {
    return (!only.isEmpty() && !only.contains(method.getTestClass().getSimpleName())) ||
           (!methods.isEmpty() && !methods.contains(method.getMethodName())) ||
           ignoreClasses.contains(method.getTestClass().getSimpleName()) ||
           ignoreMethods.contains(method.getMethodName());
  }

  public void setBrowser(Browser browser) {
    this.browser = checkNotNull(browser, "Browser to use must be set");
    addIgnoresForBrowser(browser, ignoreComparator);
  }

  private void addIgnoresForBrowser(Browser browser, IgnoreComparator comparator) {
    if (Boolean.getBoolean("selenium.browser.remote") || SauceDriver.shouldUseSauce()) {
      comparator.addDriver(REMOTE);
    }

    switch (browser) {
      case chrome:
        comparator.addDriver(CHROME);
        break;

      case edge:
        comparator.addDriver(EDGE);
        break;

      case ff:
        if (Boolean.getBoolean("webdriver.firefox.marionette")) {
          comparator.addDriver(MARIONETTE);
        } else {
          comparator.addDriver(FIREFOX);
        }
        break;

      case htmlunit:
      case htmlunit_js:
        comparator.addDriver(HTMLUNIT);
        break;

      case ie:
        comparator.addDriver(IE);
        break;

      case none:
        comparator.addDriver(ALL);
        break;

      case opera:
        break;

      case operablink:
        comparator.addDriver(CHROME);
        break;

      case phantomjs:
        comparator.addDriver(PHANTOMJS);
        break;

      case safari:
        comparator.addDriver(SAFARI);
        break;

      default:
        throw new RuntimeException("Cannot determine which ignore to add ignores rules for");
    }
  }

}
