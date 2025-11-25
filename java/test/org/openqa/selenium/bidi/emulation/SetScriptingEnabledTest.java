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

import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.WindowType;
import org.openqa.selenium.bidi.browsingcontext.BrowsingContext;
import org.openqa.selenium.bidi.browsingcontext.CreateContextParameters;
import org.openqa.selenium.bidi.browsingcontext.ReadinessState;
import org.openqa.selenium.bidi.module.Browser;
import org.openqa.selenium.bidi.module.Script;
import org.openqa.selenium.bidi.script.EvaluateResult;
import org.openqa.selenium.bidi.script.EvaluateResultSuccess;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JupiterTestBase;
import org.openqa.selenium.testing.NeedsFreshDriver;

public class SetScriptingEnabledTest extends JupiterTestBase {

  private boolean isFooInWindow(String contextId, Script script) {
    EvaluateResult result =
        script.evaluateFunctionInBrowsingContext(
            contextId, "'foo' in window", false, Optional.empty());
    return (Boolean) ((EvaluateResultSuccess) result).getResult().getValue().get();
  }

  @Test
  @NeedsFreshDriver
  @Ignore(FIREFOX)
  void canSetScriptingEnabledWithContexts() {
    BrowsingContext context = new BrowsingContext(driver, driver.getWindowHandle());
    String contextId = context.getId();

    Emulation emulation = new Emulation(driver);
    Script script = new Script(driver);

    emulation.setScriptingEnabled(
        new SetScriptingEnabledParameters(false).contexts(List.of(contextId)));

    context.navigate("data:text/html,<script>window.foo=123;</script>", ReadinessState.COMPLETE);

    assertThat(isFooInWindow(contextId, script)).isFalse();

    emulation.setScriptingEnabled(
        new SetScriptingEnabledParameters(null).contexts(List.of(contextId)));

    context.navigate("data:text/html,<script>window.foo=123;</script>", ReadinessState.COMPLETE);

    assertThat(isFooInWindow(contextId, script)).isTrue();
  }

  @Test
  @NeedsFreshDriver
  @Ignore(FIREFOX)
  void canSetScriptingEnabledWithUserContexts() {
    Browser browser = new Browser(driver);
    String userContext = browser.createUserContext();
    BrowsingContext context =
        new BrowsingContext(
            driver, new CreateContextParameters(WindowType.TAB).userContext(userContext));
    String contextId = context.getId();

    driver.switchTo().window(contextId);

    Emulation emulation = new Emulation(driver);
    emulation.setScriptingEnabled(
        new SetScriptingEnabledParameters(false).userContexts(List.of(userContext)));

    String url = appServer.whereIs("javascriptPage.html");
    context.navigate(url, ReadinessState.COMPLETE);

    // Check that inline event handlers don't work; this page has an onclick handler
    WebElement clickField = driver.findElement(By.id("clickField"));
    String initialValue = clickField.getAttribute("value"); // initial value is 'Hello'
    clickField.click();

    // Get the value after click, it should remain unchanged if scripting is disabled
    Script script = new Script(driver);
    EvaluateResult result =
        script.evaluateFunctionInBrowsingContext(
            contextId, "document.getElementById('clickField').value", false, Optional.empty());

    String resultValue = ((EvaluateResultSuccess) result).getResult().getValue().get().toString();
    assertThat(resultValue).isEqualTo(initialValue);

    // Clear the scripting override
    emulation.setScriptingEnabled(
        new SetScriptingEnabledParameters(null).userContexts(List.of(userContext)));

    context.navigate(url, ReadinessState.COMPLETE);

    // Click the element again, it should change to 'Clicked' now
    driver.findElement(By.id("clickField")).click();
    EvaluateResult result2 =
        script.evaluateFunctionInBrowsingContext(
            contextId, "document.getElementById('clickField').value", false, Optional.empty());

    String resultValue2 = ((EvaluateResultSuccess) result2).getResult().getValue().get().toString();
    assertThat(resultValue2).isEqualTo("Clicked");

    browser.removeUserContext(userContext);
  }
}
