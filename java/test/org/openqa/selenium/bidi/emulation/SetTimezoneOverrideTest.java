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

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.openqa.selenium.testing.drivers.Browser.FIREFOX;

import java.time.ZoneId;
import java.time.ZonedDateTime;
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

public class SetTimezoneOverrideTest extends JupiterTestBase {

  int getExpectedTimezoneOffset(String timezoneId) {
    ZoneId zone = ZoneId.of(timezoneId);
    ZonedDateTime now = ZonedDateTime.now(zone);
    return now.getOffset().getTotalSeconds()
        / 60
        * -1; // Negate to match JavaScript getTimezoneOffset behavior
  }

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

    String url = appServer.whereIs("blank.html");
    context.navigate(url, ReadinessState.COMPLETE);

    Emulation emul = new Emulation(driver);
    String timezone = "America/Los_Angeles";
    String tzOrg = getTimezoneString(driver, contextId);
    emul.setTimezoneOverride(
        new SetTimezoneOverrideParameters(timezone).contexts(List.of(contextId)));

    String tzString = getTimezoneString(driver, contextId);
    Number tzOffset = getTimezoneOffset(driver, contextId);

    int expectedOffset = getExpectedTimezoneOffset(timezone);

    assertThat(tzString).isEqualTo(timezone);
    assertThat(tzOffset.intValue()).isEqualTo(expectedOffset);

    emul.setTimezoneOverride(new SetTimezoneOverrideParameters(null).contexts(List.of(contextId)));
    String TzNew = getTimezoneString(driver, contextId);
    assertThat(TzNew).isEqualTo(tzOrg);
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

    String url = appServer.whereIs("blank.html");
    context.navigate(url, ReadinessState.COMPLETE);

    Emulation emul = new Emulation(driver);
    String timezone = "Europe/London";
    String tzOrg = getTimezoneString(driver, contextId);
    emul.setTimezoneOverride(
        new SetTimezoneOverrideParameters(timezone).userContexts(List.of(userContext)));

    String tzString = getTimezoneString(driver, contextId);
    Number tzOffset = getTimezoneOffset(driver, contextId);

    int expectedOffset = getExpectedTimezoneOffset(timezone);

    assertThat(tzString).isEqualTo(timezone);
    assertThat(tzOffset.intValue()).isEqualTo(expectedOffset);

    emul.setTimezoneOverride(
        new SetTimezoneOverrideParameters(null).userContexts(List.of(userContext)));
    String TzNew = getTimezoneString(driver, contextId);
    assertThat(TzNew).isEqualTo(tzOrg);

    context.close();
    browser.removeUserContext(userContext);
  }

  @Test
  @NeedsFreshDriver
  @Ignore(FIREFOX)
  void canSetTimezoneOverrideUsingOffset() {
    BrowsingContext context = new BrowsingContext(driver, driver.getWindowHandle());
    String contextId = context.getId();

    String url = appServer.whereIs("blank.html");
    context.navigate(url, ReadinessState.COMPLETE);

    Emulation emul = new Emulation(driver);
    String timezone = "+05:30";
    String tzOrg = getTimezoneString(driver, contextId);

    emul.setTimezoneOverride(
        new SetTimezoneOverrideParameters(timezone).contexts(List.of(contextId)));

    String tzString = getTimezoneString(driver, contextId);
    Number tzOffset = getTimezoneOffset(driver, contextId);

    assertThat(tzOffset.intValue()).isEqualTo(-330);
    assertThat(tzString).isEqualTo("+05:30");

    emul.setTimezoneOverride(new SetTimezoneOverrideParameters(null).contexts(List.of(contextId)));
    String tzNew = getTimezoneString(driver, contextId);
    assertThat(tzNew).isEqualTo(tzOrg);
  }
}
