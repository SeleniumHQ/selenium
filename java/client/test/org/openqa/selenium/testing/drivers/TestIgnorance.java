/*
Copyright 2011 WebDriver committers
Copyright 2011 Software Freedom Conservancy

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

package org.openqa.selenium.testing.drivers;

import com.google.common.collect.Sets;

import org.junit.runners.model.FrameworkMethod;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.IgnoreComparator;
import org.openqa.selenium.testing.JavascriptEnabled;

import java.lang.reflect.AnnotatedElement;
import java.util.Arrays;
import java.util.Set;

import static com.google.common.base.Preconditions.checkNotNull;
import static org.openqa.selenium.testing.Ignore.Driver.ALL;
import static org.openqa.selenium.testing.Ignore.Driver.ANDROID;
import static org.openqa.selenium.testing.Ignore.Driver.CHROME;
import static org.openqa.selenium.testing.Ignore.Driver.FIREFOX;
import static org.openqa.selenium.testing.Ignore.Driver.HTMLUNIT;
import static org.openqa.selenium.testing.Ignore.Driver.IE;
import static org.openqa.selenium.testing.Ignore.Driver.IPHONE;
import static org.openqa.selenium.testing.Ignore.Driver.OPERA;
import static org.openqa.selenium.testing.Ignore.Driver.REMOTE;
import static org.openqa.selenium.testing.Ignore.Driver.SELENESE;

/**
 * Class that decides whether a test class or method should be ignored.
 */
public class TestIgnorance {
  private IgnoreComparator ignoreComparator = new IgnoreComparator();
  private Set<String> methods = Sets.newHashSet();
  private Set<String> only = Sets.newHashSet();
  private Browser browser;

  public TestIgnorance(Browser browser) {
    setBrowser(browser);

    String onlyRun = System.getProperty("onlyrun");
    if (onlyRun != null) {
      only.addAll(Arrays.asList(onlyRun.split(",")));
    }
    
    String method = System.getProperty("method");
    if (method != null) {
      methods.addAll(Arrays.asList(method.split(",")));
    }
  }

  public boolean isIgnored(AnnotatedElement element) {
    boolean ignored = ignoreComparator.shouldIgnore(element.getAnnotation(Ignore.class));

    ignored |= isIgnoredDueToJavascript(element.getAnnotation(JavascriptEnabled.class));

    return ignored;
  }

  // JUnit 4
  public boolean isIgnored(FrameworkMethod method, Object test) {
    boolean ignored = ignoreComparator.shouldIgnore(test.getClass().getAnnotation(Ignore.class)) ||
        ignoreComparator.shouldIgnore(method.getMethod().getAnnotation(Ignore.class));
    
    ignored |= isIgnoredDueToJavascript(test.getClass().getAnnotation(JavascriptEnabled.class));
    ignored |= isIgnoredDueToJavascript(method.getMethod().getAnnotation(JavascriptEnabled.class));

    ignored |= isIgnoredDueToEnvironmentVariables(method, test);
    
    return ignored;
  }

  private boolean isIgnoredDueToJavascript(JavascriptEnabled enabled) {
    if (enabled == null) {
      return false;
    }

    return !browser.isJavascriptEnabled();
  }

  private boolean isIgnoredDueToEnvironmentVariables(FrameworkMethod method, Object test) {
    return only.contains(test.getClass().getSimpleName()) ||
        methods.contains(method.getName());
  }

  public void setBrowser(Browser browser) {
    this.browser = checkNotNull(browser, "Browser to use must be set");
    addIgnoresForBrowser(browser, ignoreComparator);
  }

  private void addIgnoresForBrowser(Browser browser, IgnoreComparator comparator) {
    if (Boolean.getBoolean("selenium.browser.selenium")) {
      comparator.addDriver(SELENESE);
    }

    switch (browser) {
      case android:
        comparator.addDriver(ANDROID);
        comparator.addDriver(REMOTE);
        break;

      case chrome:
        comparator.addDriver(CHROME);
        comparator.addDriver(REMOTE);
        break;

      case ff:
        comparator.addDriver(FIREFOX);
        comparator.addDriver(REMOTE);
        break;

      case htmlunit:
      case htmlunit_js:
        comparator.addDriver(HTMLUNIT);
        break;

      case ie:
        comparator.addDriver(IE);
        comparator.addDriver(REMOTE);
        break;

      case ipad:
      case iphone:
        comparator.addDriver(IPHONE);
        comparator.addDriver(REMOTE);
        break;

      case none:
        comparator.addDriver(ALL);
        break;

      case opera:
        comparator.addDriver(OPERA);
        comparator.addDriver(REMOTE);
        break;

      case safari:
        comparator.addDriver(SELENESE);
        comparator.addDriver(REMOTE);
        break;

      default:
        throw new RuntimeException("Cannot determine which ignore to use");
    }
  }
}
