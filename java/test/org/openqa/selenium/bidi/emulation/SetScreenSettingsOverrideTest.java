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
import static org.openqa.selenium.testing.drivers.Browser.CHROME;
import static org.openqa.selenium.testing.drivers.Browser.EDGE;

import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.WindowType;
import org.openqa.selenium.bidi.browsingcontext.BrowsingContext;
import org.openqa.selenium.bidi.browsingcontext.CreateContextParameters;
import org.openqa.selenium.bidi.browsingcontext.ReadinessState;
import org.openqa.selenium.bidi.module.Browser;
import org.openqa.selenium.testing.JupiterTestBase;
import org.openqa.selenium.testing.NeedsFreshDriver;
import org.openqa.selenium.testing.NotYetImplemented;

class SetScreenSettingsOverrideTest extends JupiterTestBase {
  private Dimension getScreenDimensions(String context) {
    driver.switchTo().window(context);

    Map<String, Number> dimensions =
        executeJavaScript("return { width: screen.width, height: screen.height }");

    return new Dimension(dimensions.get("width").intValue(), dimensions.get("height").intValue());
  }

  @Test
  @NeedsFreshDriver
  @NotYetImplemented(CHROME)
  @NotYetImplemented(EDGE)
  void canSetScreenSettingsOverrideInContext() {
    BrowsingContext context = new BrowsingContext(driver, driver.getWindowHandle());
    String contextId = context.getId();

    String url = appServer.whereIs("blank.html");
    context.navigate(url, ReadinessState.COMPLETE);

    Dimension initialDimensions = getScreenDimensions(contextId);

    Emulation emulation = new Emulation(driver);
    SetScreenSettingsOverrideParameters screenSettings =
        new SetScreenSettingsOverrideParameters(new ScreenArea(800, 600));

    emulation.setScreenSettingsOverride(screenSettings.contexts(List.of(contextId)));

    Dimension currentDimensions = getScreenDimensions(contextId);
    assertThat(currentDimensions.getWidth()).isEqualTo(800);
    assertThat(currentDimensions.getHeight()).isEqualTo(600);

    emulation.setScreenSettingsOverride(
        new SetScreenSettingsOverrideParameters(null).contexts(List.of(contextId)));

    Dimension lastDimensions = getScreenDimensions(contextId);
    assertThat(lastDimensions.getWidth()).isEqualTo(initialDimensions.getWidth());
    assertThat(lastDimensions.getHeight()).isEqualTo(initialDimensions.getHeight());
  }

  @Test
  @NeedsFreshDriver
  @NotYetImplemented(CHROME)
  @NotYetImplemented(EDGE)
  void canSetScreenSettingsOverrideInUserContext() {
    Browser browser = new Browser(driver);
    String initialWindow = driver.getWindowHandle();
    String userContext = browser.createUserContext();

    try {
      BrowsingContext context =
          new BrowsingContext(
              driver, new CreateContextParameters(WindowType.TAB).userContext(userContext));
      String contextId = context.getId();

      try {
        driver.switchTo().window(contextId);

        Emulation emulation = new Emulation(driver);

        String url = appServer.whereIs("blank.html");
        context.navigate(url, ReadinessState.COMPLETE);

        Dimension initialDimensions = getScreenDimensions(contextId);
        SetScreenSettingsOverrideParameters screenSettings =
            new SetScreenSettingsOverrideParameters(new ScreenArea(800, 600));

        emulation.setScreenSettingsOverride(screenSettings.userContexts(List.of(userContext)));

        Dimension currentDimensions = getScreenDimensions(contextId);
        assertThat(currentDimensions.getWidth()).isEqualTo(800);
        assertThat(currentDimensions.getHeight()).isEqualTo(600);

        emulation.setScreenSettingsOverride(
            new SetScreenSettingsOverrideParameters(null).userContexts(List.of(userContext)));

        Dimension lastDimensions = getScreenDimensions(contextId);
        assertThat(lastDimensions.getWidth()).isEqualTo(initialDimensions.getWidth());
        assertThat(lastDimensions.getHeight()).isEqualTo(initialDimensions.getHeight());

      } finally {
        context.close();
      }
    } finally {
      driver.switchTo().window(initialWindow);
      browser.removeUserContext(userContext);
    }
  }
}
