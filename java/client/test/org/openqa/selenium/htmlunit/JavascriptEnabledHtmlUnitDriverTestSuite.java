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

// Copyright 2008 Google Inc.  All Rights Reserved.

package org.openqa.selenium.htmlunit;

import junit.framework.Test;
import junit.framework.TestSuite;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.TestSuiteBuilder;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.testing.drivers.Browser;

public class JavascriptEnabledHtmlUnitDriverTestSuite extends TestSuite {

  public static Test suite() throws Exception {
    return new TestSuiteBuilder()
        .addSourceDir("java/client/test")
        .using(Browser.htmlunit_js)
        .includeJavascriptTests()
        .create();
  }

  // Used by the reflection-based supplier
  public static class HtmlUnitDriverForTest extends HtmlUnitDriver {
    public HtmlUnitDriverForTest(Capabilities capabilities) {
      super(tweak(capabilities));
    }

    private static Capabilities tweak(Capabilities capabilities) {
      DesiredCapabilities caps = new DesiredCapabilities(capabilities);
      caps.setJavascriptEnabled(true);
      caps.setVersion("3.6");
      return caps;
    }
  }
}
