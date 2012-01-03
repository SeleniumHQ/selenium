/*
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Software Freedom Conservancy

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

package org.openqa.selenium.chrome;

import junit.extensions.TestSetup;
import junit.framework.Test;
import junit.framework.TestCase;
import junit.framework.TestSuite;

import org.openqa.selenium.TestSuiteBuilder;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.testing.drivers.Browser;
import org.openqa.selenium.testing.drivers.SauceDriver;

import java.util.Arrays;

public class ChromeDriverTestSuite extends TestSuite {
  public static Test suite() throws Exception {
    return new TestSuiteBuilder()
        .addSourceDir("java/client/test")
        .using(Browser.chrome)
        .includeJavascriptTests()
        .keepDriverInstance()
        .restrictToPackage("org.openqa.selenium")
        .restrictToPackage("org.openqa.selenium.chrome")
        .create();
  }
}
