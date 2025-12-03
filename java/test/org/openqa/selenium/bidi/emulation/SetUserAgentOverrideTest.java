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

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.WindowType;
import org.openqa.selenium.bidi.browsingcontext.BrowsingContext;
import org.openqa.selenium.bidi.browsingcontext.CreateContextParameters;
import org.openqa.selenium.bidi.browsingcontext.ReadinessState;
import org.openqa.selenium.bidi.module.Browser;
import org.openqa.selenium.bidi.module.Script;
import org.openqa.selenium.bidi.script.EvaluateResult;
import org.openqa.selenium.bidi.script.EvaluateResultSuccess;
import org.openqa.selenium.testing.JupiterTestBase;
import org.openqa.selenium.testing.NeedsFreshDriver;

public class SetUserAgentOverrideTest extends JupiterTestBase {

  private String getBrowserUserAgent(String contextId, Script script) {
    EvaluateResult result =
        script.evaluateFunctionInBrowsingContext(
            contextId, "navigator.userAgent", false, Optional.empty());
    return ((EvaluateResultSuccess) result).getResult().getValue().get().toString();
  }

  @Test
  @NeedsFreshDriver
  void canSetUserAgentOverrideWithContexts() {
    BrowsingContext context = new BrowsingContext(driver, driver.getWindowHandle());
    String contextId = context.getId();

    String url = appServer.whereIs("formPage.html");
    context.navigate(url, ReadinessState.COMPLETE);

    Script script = new Script(driver);
    String initialUserAgent = getBrowserUserAgent(contextId, script);

    Emulation emulation = new Emulation(driver);
    String customUserAgent = "Mozilla/5.0 (Custom Test Agent)";
    emulation.setUserAgentOverride(
        new SetUserAgentOverrideParameters(customUserAgent).contexts(List.of(contextId)));

    String overriddenUserAgent = getBrowserUserAgent(contextId, script);
    assertThat(overriddenUserAgent).isEqualTo(customUserAgent);

    // Clear the override
    emulation.setUserAgentOverride(
        new SetUserAgentOverrideParameters(null).contexts(List.of(contextId)));

    String restoredUserAgent = getBrowserUserAgent(contextId, script);
    assertThat(restoredUserAgent).isEqualTo(initialUserAgent);
  }

  @Test
  @NeedsFreshDriver
  void canSetUserAgentOverrideWithUserContexts() {
    Browser browser = new Browser(driver);
    String userContext = browser.createUserContext();

    try {
      BrowsingContext context =
          new BrowsingContext(
              driver, new CreateContextParameters(WindowType.TAB).userContext(userContext));
      String contextId = context.getId();

      try {
        driver.switchTo().window(contextId);
        String url = appServer.whereIs("formPage.html");
        context.navigate(url, ReadinessState.COMPLETE);

        Script script = new Script(driver);
        String initialUserAgent = getBrowserUserAgent(contextId, script);

        Emulation emulation = new Emulation(driver);
        String customUserAgent = "Mozilla/5.0 (Custom User Context Agent)";
        emulation.setUserAgentOverride(
            new SetUserAgentOverrideParameters(customUserAgent).userContexts(List.of(userContext)));

        String overriddenUserAgent = getBrowserUserAgent(contextId, script);
        assertThat(overriddenUserAgent).isEqualTo(customUserAgent);

        // Clear the override
        emulation.setUserAgentOverride(
            new SetUserAgentOverrideParameters(null).userContexts(List.of(userContext)));

        String restoredUserAgent = getBrowserUserAgent(contextId, script);
        assertThat(restoredUserAgent).isEqualTo(initialUserAgent);
      } finally {
        context.close();
      }
    } finally {
      browser.removeUserContext(userContext);
    }
  }
}
