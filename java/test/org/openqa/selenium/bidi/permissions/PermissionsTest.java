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

package org.openqa.selenium.bidi.permissions;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.WindowType;
import org.openqa.selenium.bidi.browsingcontext.BrowsingContext;
import org.openqa.selenium.bidi.browsingcontext.CreateContextParameters;
import org.openqa.selenium.bidi.browsingcontext.ReadinessState;
import org.openqa.selenium.bidi.module.Browser;
import org.openqa.selenium.bidi.module.Permission;
import org.openqa.selenium.bidi.module.Script;
import org.openqa.selenium.bidi.script.EvaluateResult;
import org.openqa.selenium.bidi.script.EvaluateResultSuccess;
import org.openqa.selenium.testing.JupiterTestBase;
import org.openqa.selenium.testing.NeedsFreshDriver;
import org.openqa.selenium.testing.Pages;

public class PermissionsTest extends JupiterTestBase {
  private Permission permission;
  private Script script;

  private static final String GET_GEOLOCATION_PERMISSION =
      "() => {return navigator.permissions.query({ name: 'geolocation' })"
          + ".then(val => val.state, err => err.message)}";
  private static final String GET_ORIGIN = "() => {return window.location.origin;}";

  @BeforeEach
  public void setUp() {
    permission = new Permission(driver);
    script = new Script(driver);
  }

  @Test
  @NeedsFreshDriver
  public void canSetPermission() {
    BrowsingContext context = new BrowsingContext(driver, driver.getWindowHandle());

    context.navigate(new Pages(appServer).blankPage, ReadinessState.COMPLETE);

    String contextId = context.getId();

    EvaluateResult origin =
        script.callFunctionInBrowsingContext(
            contextId, GET_ORIGIN, true, Optional.empty(), Optional.empty(), Optional.empty());

    String originValue = (String) ((EvaluateResultSuccess) origin).getResult().getValue().get();

    permission.setPermission(Map.of("name", "geolocation"), PermissionState.GRANTED, originValue);

    EvaluateResult result =
        script.callFunctionInBrowsingContext(
            contextId,
            GET_GEOLOCATION_PERMISSION,
            true,
            Optional.empty(),
            Optional.empty(),
            Optional.empty());

    String resultValue = (String) ((EvaluateResultSuccess) result).getResult().getValue().get();
    assertThat(resultValue).isEqualTo("granted");

    permission.setPermission(Map.of("name", "geolocation"), PermissionState.DENIED, originValue);

    result =
        script.callFunctionInBrowsingContext(
            contextId,
            GET_GEOLOCATION_PERMISSION,
            true,
            Optional.empty(),
            Optional.empty(),
            Optional.empty());

    resultValue = (String) ((EvaluateResultSuccess) result).getResult().getValue().get();
    assertThat(resultValue).isEqualTo("denied");

    permission.setPermission(Map.of("name", "geolocation"), PermissionState.PROMPT, originValue);

    result =
        script.callFunctionInBrowsingContext(
            contextId,
            GET_GEOLOCATION_PERMISSION,
            true,
            Optional.empty(),
            Optional.empty(),
            Optional.empty());

    resultValue = (String) ((EvaluateResultSuccess) result).getResult().getValue().get();
    assertThat(resultValue).isEqualTo("prompt");
  }

  @Test
  @NeedsFreshDriver
  public void canSetPermissionForAUserContext() {
    Browser browser = new Browser(driver);

    String url = new Pages(appServer).blankPage;

    String userContext = browser.createUserContext();

    String originalTab = driver.getWindowHandle();

    BrowsingContext context1 = new BrowsingContext(this.driver, driver.getWindowHandle());
    BrowsingContext context2 =
        new BrowsingContext(
            this.driver, new CreateContextParameters(WindowType.TAB).userContext(userContext));

    String newTab = context2.getId();

    context1.navigate(url, ReadinessState.COMPLETE);
    context2.navigate(url, ReadinessState.COMPLETE);

    EvaluateResult origin =
        script.callFunctionInBrowsingContext(
            originalTab, GET_ORIGIN, true, Optional.empty(), Optional.empty(), Optional.empty());

    String originValue = (String) ((EvaluateResultSuccess) origin).getResult().getValue().get();

    permission.setPermission(
        Map.of("name", "geolocation"), PermissionState.GRANTED, originValue, userContext);

    EvaluateResult newTabUpdatedPermission =
        script.callFunctionInBrowsingContext(
            newTab,
            GET_GEOLOCATION_PERMISSION,
            true,
            Optional.empty(),
            Optional.empty(),
            Optional.empty());

    String newTabUpdatedPermissionValue =
        (String) ((EvaluateResultSuccess) newTabUpdatedPermission).getResult().getValue().get();
    assertThat(newTabUpdatedPermissionValue).isEqualTo("granted");

    BrowsingContext context3 =
        new BrowsingContext(
            this.driver, new CreateContextParameters(WindowType.TAB).userContext(userContext));

    context3.navigate(url, ReadinessState.COMPLETE);

    newTabUpdatedPermission =
        script.callFunctionInBrowsingContext(
            context3.getId(),
            GET_GEOLOCATION_PERMISSION,
            true,
            Optional.empty(),
            Optional.empty(),
            Optional.empty());

    newTabUpdatedPermissionValue =
        (String) ((EvaluateResultSuccess) newTabUpdatedPermission).getResult().getValue().get();
    assertThat(newTabUpdatedPermissionValue).isEqualTo("granted");
  }
}
