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
import static org.openqa.selenium.internal.PortProber.findFreePort;

import org.openqa.selenium.internal.PortProber;

@SuppressWarnings("unused")
public class SingleTestSuite extends TestCase {
  private static final String CHROME = "org.openqa.selenium.chrome.ChromeDriver";
  private static final String CHROME_TEST = "org.openqa.selenium.chrome.ChromeDriverTestSuite$TestChromeDriver";

  private static final String FIREFOX = "org.openqa.selenium.firefox.FirefoxDriver";
  private static final String FIREFOX_TEST = "org.openqa.selenium.firefox.FirefoxDriverTestSuite$TestFirefoxDriver";
 
  private static final String HTML_UNIT = "org.openqa.selenium.htmlunit.HtmlUnitDriver";
  private static final String HTML_UNIT_JS = "org.openqa.selenium.htmlunit.JavascriptEnabledHtmlUnitDriverTestSuite$HtmlUnitDriverForTest";
  private static final String IE = "org.openqa.selenium.ie.InternetExplorerDriver";
  private static final String REMOTE = "org.openqa.selenium.remote.server.RemoteWebDriverTestSuite$RemoteWebDriverForTest";
  private static final String REMOTE_IE = "org.openqa.selenium.remote.server.RemoteWebDriverIeTestSuite$RemoteIeWebDriverForTest";
  private static final String SELENIUM = "org.openqa.selenium.SeleneseBackedWebDriver";

  public static Test suite() throws Exception {
    String driver = FIREFOX_TEST;

    System.setProperty("webdriver.development", "true");
    System.setProperty("jna.library.path", "..\\build;build");
    System.setProperty("webdriver.selenium.server.port", String.valueOf(findFreePort()));
//    System.setProperty("webdriver.firefox.useExisting", "true");
//    System.setProperty("webdriver.firefox.reap_profile", "false");
                                                      
    TestSuiteBuilder builder = new TestSuiteBuilder()
        .addSourceDir("common")
        .addSourceDir("support")
        .usingDriver(driver)
        .keepDriverInstance()
        .includeJavascriptTests()
        .onlyRun("ChildrenFindingTest")
        .method("testShouldBeAbleToFindAnElementByCssSelector")
        .exclude(ALL)
        .exclude(Ignore.Driver.FIREFOX)
        .outputTestNames()
        //.leaveRunning()
        ;  // Yeah, this look strange :)

    if (REMOTE.equals(driver) || REMOTE_IE.equals(driver)) {
      builder.addSuiteDecorator(
          "org.openqa.selenium.remote.server.RemoteWebDriverTestSuite$RemoteDriverServerStarter");
    } else if (SELENIUM.equals(driver)) {
      builder.addSuiteDecorator(
          "org.openqa.selenium.SeleniumServerStarter");
    }

    builder.addSuiteDecorator("org.openqa.selenium.TestNameDecorator");

    return builder.create();
  }
}
