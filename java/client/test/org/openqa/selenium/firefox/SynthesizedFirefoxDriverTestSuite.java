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

package org.openqa.selenium.firefox;

import junit.framework.Test;
import junit.framework.TestSuite;

import org.openqa.selenium.Platform;
import org.openqa.selenium.TestSuiteBuilder;
import org.openqa.selenium.testing.drivers.Browser;

public class SynthesizedFirefoxDriverTestSuite extends TestSuite {
  public static Test suite() throws Exception {
    if (Platform.getCurrent().is(Platform.WINDOWS)) {
      return new TestSuite();
    }

    System.setProperty("selenium.browser.native", "false");

    return new TestSuiteBuilder()
        .addSourceDir("java/client/test")
        .using(Browser.ff)
        .keepDriverInstance()
        .includeJavascriptTests()
        .create();
  }
}
