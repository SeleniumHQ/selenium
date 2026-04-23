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
import static org.openqa.selenium.bidi.emulation.SetNetworkConditionsParameters.offline;
import static org.openqa.selenium.bidi.emulation.SetNetworkConditionsParameters.online;
import static org.openqa.selenium.testing.drivers.Browser.FIREFOX;

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
import org.openqa.selenium.testing.NotYetImplemented;

public class SetNetworkConditionsTest extends JupiterTestBase {

  private Boolean isOnline(String contextId, Script script) {
    EvaluateResult result =
        script.evaluateFunctionInBrowsingContext(
            contextId, "navigator.onLine", false, Optional.empty());
    return (Boolean) ((EvaluateResultSuccess) result).getResult().getValue().get();
  }

  @Test
  @NeedsFreshDriver
  @NotYetImplemented(FIREFOX)
  void canSetNetworkConditionsOfflineWithContext() {
    BrowsingContext context = new BrowsingContext(driver, driver.getWindowHandle());
    String contextId = context.getId();

    Emulation emulation = new Emulation(driver);
    Script script = new Script(driver);

    context.navigate(appServer.whereIs("formPage.html"), ReadinessState.COMPLETE);

    assertThat(isOnline(contextId, script)).isTrue();

    try {
      // Set offline
      emulation.setNetworkConditions(offline().contexts(List.of(contextId)));
      assertThat(isOnline(contextId, script)).isFalse();
    } finally {
      // Reset
      emulation.setNetworkConditions(online().contexts(List.of(contextId)));
      assertThat(isOnline(contextId, script)).isTrue();
    }
  }

  @Test
  @NeedsFreshDriver
  @NotYetImplemented(FIREFOX)
  void canSetNetworkConditionsOfflineWithUserContext() {
    Browser browser = new Browser(driver);
    String userContext = browser.createUserContext();

    try {
      BrowsingContext context =
          new BrowsingContext(
              driver, new CreateContextParameters(WindowType.TAB).userContext(userContext));
      String contextId = context.getId();

      try {
        driver.switchTo().window(contextId);

        Emulation emulation = new Emulation(driver);
        Script script = new Script(driver);

        context.navigate(appServer.whereIs("formPage.html"), ReadinessState.COMPLETE);

        assertThat(isOnline(contextId, script)).isTrue();

        // Set offline
        emulation.setNetworkConditions(offline().userContexts(List.of(userContext)));
        assertThat(isOnline(contextId, script)).isFalse();

        // Reset
        emulation.setNetworkConditions(online().userContexts(List.of(userContext)));

        context.close();
      } catch (Exception e) {
        try {
          context.close();
        } catch (Exception closeException) {
          // Ignore
        }
        throw e;
      }
    } finally {
      browser.removeUserContext(userContext);
    }
  }
}
