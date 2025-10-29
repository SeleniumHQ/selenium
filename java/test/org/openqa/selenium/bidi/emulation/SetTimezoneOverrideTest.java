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

package org.openqa.selenium.bidi.emulation;

import static org.openqa.selenium.testing.drivers.Browser.FIREFOX;

import java.util.List;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WindowType;
import org.openqa.selenium.bidi.browsingcontext.BrowsingContext;
import org.openqa.selenium.bidi.browsingcontext.CreateContextParameters;
import org.openqa.selenium.bidi.browsingcontext.ReadinessState;
import org.openqa.selenium.bidi.module.Browser;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JupiterTestBase;
import org.openqa.selenium.testing.NeedsFreshDriver;
import org.openqa.selenium.testing.NeedsSecureServer;

@NeedsSecureServer
public class SetTimezoneOverrideTest extends JupiterTestBase {
  String getTimezoneString(WebDriver driver, String context) {
    JavascriptExecutor executor = (JavascriptExecutor) driver;

    driver.switchTo().window(context);
    return (String)
        executor.executeScript("return Intl.DateTimeFormat().resolvedOptions().timeZone;");
  }

  Number getTimezoneOffset(WebDriver driver, String context) {
    JavascriptExecutor executor = (JavascriptExecutor) driver;

    driver.switchTo().window(context);
    return (Number) executor.executeScript("return new Date().getTimezoneOffset()");
  }

  @Test
  @NeedsFreshDriver
  void canSetTimezoneOverrideInContext() {
    BrowsingContext context = new BrowsingContext(driver, driver.getWindowHandle());
    String contextId = context.getId();

    String url = appServer.whereIsSecure("blank.html");
    context.navigate(url, ReadinessState.COMPLETE);

    Emulation emul = new Emulation(driver);
    String timezone = "America/Los_Angeles";
    String tzOrg = getTimezoneString(driver, contextId);
    emul.setTimezoneOverride(
        new SetTimezoneOverrideParameters(timezone).contexts(List.of(contextId)));

    String tzString = getTimezoneString(driver, contextId);
    Number tzOffset = getTimezoneOffset(driver, contextId);

    assert tzString.equals(timezone)
        : "Timezone string mismatch: expected " + timezone + ", got " + tzString;
    assert tzOffset.intValue() == 420 : "Timezone offset mismatch: expected 420, got " + tzOffset;

    emul.setTimezoneOverride(new SetTimezoneOverrideParameters(null).contexts(List.of(contextId)));
    String TzNew = getTimezoneString(driver, contextId);
    assert TzNew.equals(tzOrg) : "Timezone reset failed: expected " + tzOrg + ", got " + TzNew;
  }

  @Test
  @NeedsFreshDriver
  void canSetTimeZoneOverrideInUserContext() {
    Browser browser = new Browser(driver);
    String userContext = browser.createUserContext();

    BrowsingContext context =
        new BrowsingContext(
            driver, new CreateContextParameters(WindowType.TAB).userContext(userContext));
    String contextId = context.getId();

    String url = appServer.whereIsSecure("blank.html");
    context.navigate(url, ReadinessState.COMPLETE);

    Emulation emul = new Emulation(driver);
    String timezone = "Europe/London";
    String tzOrg = getTimezoneString(driver, contextId);
    emul.setTimezoneOverride(
        new SetTimezoneOverrideParameters(timezone).userContexts(List.of(userContext)));

    String tzString = getTimezoneString(driver, contextId);
    Number tzOffset = getTimezoneOffset(driver, contextId);

    assert tzString.equals(timezone)
        : "Timezone string mismatch: expected " + timezone + ", got " + tzString;
    assert tzOffset.intValue() == 0 : "Timezone offset mismatch: expected 0, got " + tzOffset;

    emul.setTimezoneOverride(
        new SetTimezoneOverrideParameters(null).userContexts(List.of(userContext)));
    String TzNew = getTimezoneString(driver, contextId);
    assert TzNew.equals(tzOrg) : "Timezone reset failed: expected " + tzOrg + ", got " + TzNew;

    context.close();
    browser.removeUserContext(userContext);
  }

  @Test
  @NeedsFreshDriver
  @Ignore(FIREFOX)
  void canSetTimezoneOverrideUsingOffset() {
    BrowsingContext context = new BrowsingContext(driver, driver.getWindowHandle());
    String contextId = context.getId();

    String url = appServer.whereIsSecure("blank.html");
    context.navigate(url, ReadinessState.COMPLETE);

    Emulation emul = new Emulation(driver);
    String timezone = "+05:30";
    String tzOrg = getTimezoneString(driver, contextId);

    emul.setTimezoneOverride(
        new SetTimezoneOverrideParameters(timezone).contexts(List.of(contextId)));

    String tzString = getTimezoneString(driver, contextId);
    Number tzOffset = getTimezoneOffset(driver, contextId);

    assert tzOffset.intValue() == -330 : "Expected timezone offset -330, got " + tzOffset;
    assert tzString.equals("+05:30") : "Expected timezone '+05:30', got " + tzString;

    emul.setTimezoneOverride(new SetTimezoneOverrideParameters(null).contexts(List.of(contextId)));
    String tzNew = getTimezoneString(driver, contextId);
    assert tzNew.equals(tzOrg) : "Timezone reset failed: expected " + tzOrg + ", got " + tzNew;
  }
}
