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
import junit.framework.TestSuite;

import org.openqa.selenium.testing.drivers.Browser;

import static org.openqa.selenium.net.PortProber.findFreePort;

@SuppressWarnings("unused")
public class SingleTestSuite extends TestSuite {
  public static Test suite() throws Exception {
    Browser browser = Browser.ff;

    System.setProperty("selenium.browser.remote", "false");
    System.setProperty("selenium.browser.selenium", "false");

    System.setProperty("jna.library.path", "..\\build;build");
    System.setProperty("webdriver.selenium.server.port", String.valueOf(findFreePort()));
    System.setProperty("webdriver.development", "true");
    // System.setProperty("webdriver.debug", "true");
    // System.setProperty("webdriver.firefox.reap_profile", "false");

    TestSuiteBuilder builder = new TestSuiteBuilder()
        .addSourceDir("java/client/test")
        .using(browser)
        .keepDriverInstance()
        .includeJavascriptTests()
        .onlyRun("ImplicitWaitTest")
//        .method("testFindingElementsOnElementByXPathShouldFindTopLevelElements")
        .outputTestNames()
        .leaveRunning()
        ; // Yeah, this look strange :)


    if (Boolean.getBoolean("selenium.browser.remote")) {
      builder.addSuiteDecorator(
          "org.openqa.selenium.remote.server.RemoteWebDriverTestSuite$RemoteDriverServerStarter");
    }

    builder.addSuiteDecorator("org.openqa.selenium.TestNameDecorator");

    return builder.create();
  }
}
