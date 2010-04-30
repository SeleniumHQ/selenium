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

import junit.framework.Test;
import junit.framework.TestCase;

import static org.openqa.selenium.Ignore.Driver.SELENESE;
import static org.openqa.selenium.internal.PortProber.findFreePort;

public class SeleneseWebDriverTestSuite extends TestCase {

  public static Test suite() throws Exception {
    System.setProperty("webdriver.selenium.server.port", String.valueOf(findFreePort()));

    return new TestSuiteBuilder()
        .addSourceDir("common")
        .usingDriver(SeleneseBackedWebDriver.class)
        .exclude(SELENESE)
        .includeJavascriptTests()
        .keepDriverInstance()
        .addSuiteDecorator("org.openqa.selenium.SeleniumServerStarter")
        .create();
  }
}
