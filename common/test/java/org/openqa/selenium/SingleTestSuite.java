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

import static org.openqa.selenium.Ignore.Driver.*;

@SuppressWarnings("unused")
public class SingleTestSuite extends TestCase {

  private final static String FIREFOX = "org.openqa.selenium.firefox.FirefoxDriverTestSuite$TestFirefoxDriver";
  private final static String HTML_UNIT = "org.openqa.selenium.htmlunit.HtmlUnitDriver";
  private final static String HTML_UNIT_JS = "org.openqa.selenium.htmlunit.JavascriptEnabledHtmlUnitDriverTestSuite$HtmlUnitDriverForTest";
  private final static String IE = "org.openqa.selenium.ie.InternetExplorerDriver";
  private final static String REMOTE = "org.openqa.selenium.remote.RemoteWebDriverTestSuite$RemoteWebDriverForTest";

  public static Test suite() throws Exception {
    String driver = IE;

    System.setProperty("webdriver.development", "true");
    System.setProperty("jna.library.path", "..\\build;build");
//    System.setProperty("webdriver.firefox.useExisting", "true");
//    System.setProperty("webdriver.firefox.reap_profile", "false");

    TestSuiteBuilder builder = new TestSuiteBuilder()
        .addSourceDir("../common")
        .addSourceDir("common")
        .addSourceDir("firefox")
        .usingDriver(driver)
        .keepDriverInstance()
        .includeJavascriptTests()
        .onlyRun("ElementFindingTest")
        .method("testShouldReturnTitleOfPageIfSet")
        .exclude(ALL)
        .exclude(Ignore.Driver.IE)
//        .leaveRunning()
        ;  // Yeah, this look strange :)

    if (REMOTE.equals(driver)) {
      builder.addSuiteDecorator(
          "org.openqa.selenium.remote.RemoteWebDriverTestSuite$RemoteDriverServerStarter");
    }

    return builder.create();
  }
}
