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
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.WindowType;
import org.openqa.selenium.bidi.browsingcontext.BrowsingContext;
import org.openqa.selenium.bidi.browsingcontext.CreateContextParameters;
import org.openqa.selenium.bidi.browsingcontext.ReadinessState;
import org.openqa.selenium.bidi.module.Browser;
import org.openqa.selenium.testing.JupiterTestBase;
import org.openqa.selenium.testing.NeedsFreshDriver;

public class SetScreenOrientationOverrideTest extends JupiterTestBase {

  private Map<String, Object> getScreenOrientation(String context) {
    driver.switchTo().window(context);

    Map<String, Object> orientation =
        executeJavaScript(
            "return { type: screen.orientation.type, angle: screen.orientation.angle };");

    return Map.of(
        "type", orientation.get("type"), "angle", ((Number) orientation.get("angle")).intValue());
  }

  @Test
  @NeedsFreshDriver
  void canSetScreenOrientationOverrideInContext() {
    BrowsingContext context = new BrowsingContext(driver, driver.getWindowHandle());
    String contextId = context.getId();

    // Navigate to a page first to ensure screen.orientation is available
    String url = appServer.whereIs("formPage.html");
    context.navigate(url, ReadinessState.COMPLETE);

    Map<String, Object> initialOrientation = getScreenOrientation(contextId);

    Emulation emulation = new Emulation(driver);

    // Set landscape-primary orientation
    ScreenOrientation landscapeOrientation =
        new ScreenOrientation(
            ScreenOrientationNatural.LANDSCAPE, ScreenOrientationType.LANDSCAPE_PRIMARY);
    emulation.setScreenOrientationOverride(
        new SetScreenOrientationOverrideParameters(landscapeOrientation)
            .contexts(List.of(contextId)));

    Map<String, Object> currentOrientation = getScreenOrientation(contextId);
    assertThat(currentOrientation.get("type")).isEqualTo("landscape-primary");
    assertThat(currentOrientation.get("angle")).isEqualTo(0);

    // Set portrait-secondary orientation
    ScreenOrientation portraitOrientation =
        new ScreenOrientation(
            ScreenOrientationNatural.PORTRAIT, ScreenOrientationType.PORTRAIT_SECONDARY);
    emulation.setScreenOrientationOverride(
        new SetScreenOrientationOverrideParameters(portraitOrientation)
            .contexts(List.of(contextId)));

    currentOrientation = getScreenOrientation(contextId);
    assertThat(currentOrientation.get("type")).isEqualTo("portrait-secondary");
    assertThat(currentOrientation.get("angle")).isEqualTo(180);

    // Clear the override
    emulation.setScreenOrientationOverride(
        new SetScreenOrientationOverrideParameters(null).contexts(List.of(contextId)));

    currentOrientation = getScreenOrientation(contextId);
    assertThat(currentOrientation.get("type")).isEqualTo(initialOrientation.get("type"));
    assertThat(currentOrientation.get("angle")).isEqualTo(initialOrientation.get("angle"));
  }

  @Test
  @NeedsFreshDriver
  void canSetScreenOrientationOverrideInUserContext() {
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

        // Navigate to a page first to ensure screen.orientation is available
        String url = appServer.whereIs("formPage.html");
        context.navigate(url, ReadinessState.COMPLETE);

        Map<String, Object> initialOrientation = getScreenOrientation(contextId);

        // Set landscape-primary orientation
        ScreenOrientation landscapeOrientation =
            new ScreenOrientation(
                ScreenOrientationNatural.LANDSCAPE, ScreenOrientationType.LANDSCAPE_PRIMARY);
        emulation.setScreenOrientationOverride(
            new SetScreenOrientationOverrideParameters(landscapeOrientation)
                .userContexts(List.of(userContext)));

        Map<String, Object> currentOrientation = getScreenOrientation(contextId);
        assertThat(currentOrientation.get("type")).isEqualTo("landscape-primary");
        assertThat(currentOrientation.get("angle")).isEqualTo(0);

        // Set portrait-secondary orientation
        ScreenOrientation portraitOrientation =
            new ScreenOrientation(
                ScreenOrientationNatural.PORTRAIT, ScreenOrientationType.PORTRAIT_SECONDARY);
        emulation.setScreenOrientationOverride(
            new SetScreenOrientationOverrideParameters(portraitOrientation)
                .userContexts(List.of(userContext)));

        currentOrientation = getScreenOrientation(contextId);
        assertThat(currentOrientation.get("type")).isEqualTo("portrait-secondary");
        assertThat(currentOrientation.get("angle")).isEqualTo(180);

        // Clear the override
        emulation.setScreenOrientationOverride(
            new SetScreenOrientationOverrideParameters(null).userContexts(List.of(userContext)));

        currentOrientation = getScreenOrientation(contextId);
        assertThat(currentOrientation.get("type")).isEqualTo(initialOrientation.get("type"));
        assertThat(currentOrientation.get("angle")).isEqualTo(initialOrientation.get("angle"));

      } finally {
        context.close();
      }
    } finally {
      browser.removeUserContext(userContext);
    }
  }
}
