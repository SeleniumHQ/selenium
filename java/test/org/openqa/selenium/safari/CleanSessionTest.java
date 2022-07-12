// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

package org.openqa.selenium.safari;

import static org.assertj.core.api.Assertions.assertThat;
import static org.openqa.selenium.testing.drivers.Browser.SAFARI;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.Cookie;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JupiterTestBase;
import org.openqa.selenium.testing.NoDriverAfterTest;
import org.openqa.selenium.testing.NoDriverBeforeTest;

public class CleanSessionTest extends JupiterTestBase {

  private static final Cookie COOKIE = new Cookie("foo", "bar");

  @Test
  @NoDriverBeforeTest
  public void shouldClearCookiesWhenStartingWithACleanSession() {
    SafariDriver firstDriver = new SafariDriver();
    firstDriver.get(pages.alertsPage);

    assertThat(firstDriver.manage().getCookies()).isEmpty();

    firstDriver.manage().addCookie(COOKIE);
    assertThat(firstDriver.manage().getCookies()).contains(COOKIE);
    firstDriver.quit();

    localDriver = new SafariDriver();
    localDriver.get(pages.alertsPage);
    assertThat(localDriver.manage().getCookies()).isEmpty();
  }

  @Test
  @NoDriverAfterTest
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
  @NoDriverAfterTest
  @Ignore(SAFARI)
  public void executeAsyncScriptIsResilientToPagesRedefiningSetTimeout() {
    driver.get(appServer.whereIs("messages.html"));

    JavascriptExecutor executor = (JavascriptExecutor) driver;
    executor.executeScript("setTimeout = function() {}");

    long result = (Long) executor.executeAsyncScript(
        "var callback = arguments[arguments.length - 1];" +
        "window.constructor.prototype.setTimeout.call(window, function() {" +
            "callback(123);\n}, 0);");

    assertThat(result).isEqualTo(123L);
  }

  @Test
  public void doesNotLeakInternalMessagesToThePageUnderTest() {
    driver.get(appServer.whereIs("messages.html"));

    JavascriptExecutor executor = (JavascriptExecutor) driver;
    executor.executeScript("window.postMessage('hi', '*');");

    long numMessages = (Long) executor.executeScript(
        "return window.messages.length;");

    assertThat(numMessages).isEqualTo(1L);
  }

  @Test
  public void doesNotCreateExtraIframeOnPageUnderTest() {
    driver.get(appServer.whereIs("messages.html"));
    assertThat(driver.findElements(By.tagName("iframe"))).hasSize(0);

    ((JavascriptExecutor) driver).executeScript("return location.href;");
    assertThat(driver.findElements(By.tagName("iframe"))).hasSize(0);
  }
}
