/*
Copyright 2012 Selenium committers
Copyright 2012 Software Freedom Conservancy

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

package org.openqa.selenium.safari;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import org.openqa.selenium.Cookie;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.remote.DesiredCapabilities;

import org.junit.AfterClass;
import org.junit.Test;

public class CleanSessionTest extends SafariTestBase {

  private static final Cookie COOKIE = new Cookie("foo", "bar");

  @AfterClass
  public static void quitDriver() {
    SafariTestBase.quitDriver();
  }

  private void createCleanSession() {
    quitDriver();

    SafariOptions safariOptions = new SafariOptions();
    safariOptions.setUseCleanSession(true);
    DesiredCapabilities capabilities = DesiredCapabilities.safari();
    capabilities.setCapability(SafariOptions.CAPABILITY, safariOptions);
    driver = actuallyCreateDriver(capabilities);
    driver.get(pages.alertsPage);
  }

  @Test
  public void shouldClearCookiesWhenStartingWithACleanSession() {
    createCleanSession();
    assertNoCookies();
    driver.manage().addCookie(COOKIE);
    assertHasCookie(COOKIE);

    createCleanSession();
    assertNoCookies();
  }
  
  @Test
  public void isResilientToPagesRedefiningDependentDomFunctions() {
    runFunctionRedefinitionTest("window.dispatchEvent = function() {};");
    runFunctionRedefinitionTest("window.postMessage = function() {};");
    runFunctionRedefinitionTest("document.createEvent = function() {};");
    runFunctionRedefinitionTest("document.documentElement.setAttribute = function() {};");
    runFunctionRedefinitionTest("document.documentElement.getAttribute = function() {};");
    runFunctionRedefinitionTest("document.documentElement.removeAttribute = function() {};");
  }
  
  private void runFunctionRedefinitionTest(String script) {
    driver.get(appServer.whereIs("messages.html"));

    JavascriptExecutor executor = (JavascriptExecutor) driver;
    executor.executeScript(script);

    // If the above actually returns, then we are good to go.
  }

  @Test
  public void executeAsyncScriptIsResilientToPagesRedefiningSetTimeout() {
    driver.get(appServer.whereIs("messages.html"));

    JavascriptExecutor executor = (JavascriptExecutor) driver;
    executor.executeScript("setTimeout = function() {}");

    long result = (Long) executor.executeAsyncScript(
        "var callback = arguments[arguments.length - 1];" +
        "window.constructor.prototype.setTimeout.call(window, function() {" +
            "callback(123);\n}, 0);");

    assertEquals(123L, result);
  }

  @Test
  public void doesNotLeakInternalMessagesToThePageUnderTest() {
    driver.get(appServer.whereIs("messages.html"));

    JavascriptExecutor executor = (JavascriptExecutor) driver;
    executor.executeScript("window.postMessage('hi', '*');");

    long numMessages = (Long) executor.executeScript(
        "return window.messages.length;");

    assertEquals(1L, numMessages);
  }

  private void assertHasCookie(Cookie cookie) {
    assertTrue(driver.manage().getCookies().contains(cookie));
  }

  private void assertNoCookies() {
    assertTrue(driver.manage().getCookies().isEmpty());
  }
}
