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

import static org.openqa.selenium.Ignore.Driver.ALL;
import static org.openqa.selenium.net.PortProber.findFreePort;

import junit.framework.Test;
import junit.framework.TestCase;

import java.util.HashMap;
import java.util.Map;

@SuppressWarnings("unused")
public class SingleTestSuite extends TestCase {
  private static final String CHROME = "org.openqa.selenium.chrome.ChromeDriver";

  private static final String FIREFOX = "org.openqa.selenium.firefox.FirefoxDriver";
  private static final String FIREFOX_TEST = "org.openqa.selenium.firefox.FirefoxDriverTestSuite$TestFirefoxDriver";
 
  private static final String HTML_UNIT = "org.openqa.selenium.htmlunit.HtmlUnitDriver";
  private static final String HTML_UNIT_JS = "org.openqa.selenium.htmlunit.JavascriptEnabledHtmlUnitDriverTestSuite$HtmlUnitDriverForTest";
  private static final String IE = "org.openqa.selenium.ie.InternetExplorerDriver";
  private static final String IPHONE = "org.openqa.selenium.iphone.IPhoneDriver";
  private static final String REMOTE = "org.openqa.selenium.remote.server.RemoteWebDriverTestSuite$RemoteWebDriverForTest";
  private static final String REMOTE_IE = "org.openqa.selenium.remote.server.RemoteWebDriverIeTestSuite$RemoteIeWebDriverForTest";
  private static final String SELENIUM = "org.openqa.selenium.v1.SeleneseBackedWebDriver";

  private static final Map<String, Ignore.Driver> EXCLUSIONS_BY_DRIVER =
      new HashMap<String, Ignore.Driver>() {{
        put(CHROME, Ignore.Driver.CHROME);
        put(FIREFOX, Ignore.Driver.FIREFOX);
        put(FIREFOX_TEST, Ignore.Driver.FIREFOX);
        put(HTML_UNIT, Ignore.Driver.HTMLUNIT);
        put(HTML_UNIT_JS, Ignore.Driver.HTMLUNIT);
        put(IE, Ignore.Driver.IE);
        put(IPHONE, Ignore.Driver.IPHONE);
        put(REMOTE, Ignore.Driver.REMOTE);
        put(REMOTE_IE, Ignore.Driver.IE);
        put(SELENIUM, Ignore.Driver.SELENESE);
      }};

  public static Test suite() throws Exception {
    String driver = CHROME;

    System.setProperty("jna.library.path", "..\\build;build");
    System.setProperty("webdriver.selenium.server.port", String.valueOf(findFreePort()));
    System.setProperty("webdriver.development", "true");
//    System.setProperty("webdriver.debug", "true");
//    System.setProperty("webdriver.firefox.reap_profile", "false");

    TestSuiteBuilder builder = new TestSuiteBuilder()
        .addSourceDir("java/client/test")
        .usingDriver(driver)
        .keepDriverInstance()
        .includeJavascriptTests()
        .onlyRun("JavascriptEnabledDriverTest")
//        .method("testShouldBeAbleToFindAnElementByCssSelector")
        .exclude(ALL)
        .exclude(EXCLUSIONS_BY_DRIVER.get(driver))
        .outputTestNames()
        .leaveRunning()
        ;  // Yeah, this look strange :)

    if (REMOTE.equals(driver) || REMOTE_IE.equals(driver)) {
      builder.addSuiteDecorator(
          "org.openqa.selenium.remote.server.RemoteWebDriverTestSuite$RemoteDriverServerStarter");
    } else if (SELENIUM.equals(driver)) {
      builder.addSuiteDecorator(
          "org.openqa.selenium.v1.SeleniumServerStarter");
    }

    builder.addSuiteDecorator("org.openqa.selenium.TestNameDecorator");

    return builder.create();
  }
}
