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

  private final static String FIREFOX = "org.openqa.selenium.firefox.FirefoxDriver";
  private final static String HTML_UNIT = "org.openqa.selenium.htmlunit.HtmlUnitDriver";
  private final static String HTML_UNIT_JS = "org.openqa.selenium.htmlunit.JavascriptEnabledHtmlUnitDriverTestSuite$HtmlUnitDriverForTest";
  private final static String IE = "org.openqa.selenium.ie.InternetExplorerDriver";
  private final static String REMOTE = "org.openqa.selenium.remote.RemoteWebDriverTestSuite$RemoteWebDriverForTest";
  private final static String SAFARI = "org.openqa.selenium.safari.SafariDriver";

  public static Test suite() throws Exception {
    String driver = HTML_UNIT_JS;

    System.setProperty("webdriver.firefox.development", "true");
//    System.setProperty("webdriver.firefox.useExisting", "true");

    TestSuiteBuilder builder = new TestSuiteBuilder()
        .addSourceDir("../common")
        .addSourceDir("common")
        .addSourceDir("firefox")
        .usingDriver(driver)
        .keepDriverInstance()
        .includeJavascriptTests()
        .onlyRun("SelectElementHandlingTest")
//        .method("testShouldNotCrashWhenCallingGetSizeOnAnObsoleteElement")
        .exclude(ALL)
        .exclude(Ignore.Driver.FIREFOX)
        .leaveRunning()
        ;  // Yeah, this look strange :)

    if (REMOTE.equals(driver)) {
      builder.addSuiteDecorator(
          "org.openqa.selenium.remote.RemoteWebDriverTestSuite$RemoteDriverServerStarter");
    }

    return builder.create();
  }
}
