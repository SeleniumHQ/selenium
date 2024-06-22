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

package org.openqa.selenium.bidi.script;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.openqa.selenium.testing.Safely.safelyCall;

import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.WindowType;
import org.openqa.selenium.bidi.module.Script;
import org.openqa.selenium.environment.webserver.AppServer;
import org.openqa.selenium.environment.webserver.NettyAppServer;
import org.openqa.selenium.testing.JupiterTestBase;

public class EvaluateParametersTest extends JupiterTestBase {
  private AppServer server;

  @BeforeEach
  public void setUp() {
    server = new NettyAppServer();
    server.start();
  }

  @Test
  void canEvaluateScript() {
    String id = driver.getWindowHandle();
    try (Script script = new Script(id, driver)) {
      EvaluateParameters parameters = new EvaluateParameters(new ContextTarget(id), "1 + 2", true);
      EvaluateResult result = script.evaluateFunction(parameters);

      assertThat(result.getResultType()).isEqualTo(EvaluateResult.Type.SUCCESS);
      assertThat(result.getRealmId()).isNotNull();

      EvaluateResultSuccess successResult = (EvaluateResultSuccess) result;
      assertThat(successResult.getResult().getType()).isEqualTo("number");
      assertThat(successResult.getResult().getValue().isPresent()).isTrue();
      assertThat((Long) successResult.getResult().getValue().get()).isEqualTo(3L);
    }
  }

  @Test
  void canEvaluateScriptWithUserActivationTrue() {
    String id = driver.getWindowHandle();
    try (Script script = new Script(id, driver)) {

      script.evaluateFunction(
          new EvaluateParameters(new ContextTarget(id), "window.open();", true)
              .userActivation(true));

      EvaluateResult result =
          script.evaluateFunction(
              new EvaluateParameters(
                      new ContextTarget(id),
                      "navigator.userActivation.isActive && navigator.userActivation.hasBeenActive",
                      true)
                  .userActivation(true));

      assertThat(result.getResultType()).isEqualTo(EvaluateResult.Type.SUCCESS);
      assertThat(result.getRealmId()).isNotNull();

      EvaluateResultSuccess successResult = (EvaluateResultSuccess) result;
      assertThat(successResult.getResult().getType()).isEqualTo("boolean");
      assertThat(successResult.getResult().getValue().isPresent()).isTrue();
      assertThat((Boolean) successResult.getResult().getValue().get()).isEqualTo(true);
    }
  }

  @Test
  void canEvaluateScriptWithUserActivationFalse() {
    String id = driver.getWindowHandle();
    try (Script script = new Script(id, driver)) {

      script.evaluateFunction(
          new EvaluateParameters(new ContextTarget(id), "window.open();", true)
              .userActivation(false));

      EvaluateResult result =
          script.evaluateFunction(
              new EvaluateParameters(
                      new ContextTarget(id),
                      "navigator.userActivation.isActive && navigator.userActivation.hasBeenActive",
                      true)
                  .userActivation(false));

      assertThat(result.getResultType()).isEqualTo(EvaluateResult.Type.SUCCESS);
      assertThat(result.getRealmId()).isNotNull();

      EvaluateResultSuccess successResult = (EvaluateResultSuccess) result;
      assertThat(successResult.getResult().getType()).isEqualTo("boolean");
      assertThat(successResult.getResult().getValue().isPresent()).isTrue();
      assertThat((Boolean) successResult.getResult().getValue().get()).isEqualTo(false);
    }
  }

  @Test
  void canEvaluateScriptThatThrowsException() {
    String id = driver.getWindowHandle();
    try (Script script = new Script(id, driver)) {
      EvaluateParameters parameters =
          new EvaluateParameters(
              new ContextTarget(id), "))) !!@@## some invalid JS script (((", false);
      EvaluateResult result = script.evaluateFunction(parameters);

      assertThat(result.getResultType()).isEqualTo(EvaluateResult.Type.EXCEPTION);
      assertThat(result.getRealmId()).isNotNull();

      EvaluateResultExceptionValue exception = (EvaluateResultExceptionValue) result;
      assertThat(exception.getExceptionDetails().getException().getType()).isEqualTo("error");
      assertThat(exception.getExceptionDetails().getText()).contains("SyntaxError:");
      assertThat(exception.getExceptionDetails().getLineNumber()).isGreaterThanOrEqualTo(0);
      assertThat(exception.getExceptionDetails().getStacktrace().getCallFrames().size())
          .isEqualTo(0);
    }
  }

  @Test
  void canEvaluateScriptWithResulWithOwnership() {
    String id = driver.getWindowHandle();
    try (Script script = new Script(id, driver)) {
      EvaluateParameters parameters =
          new EvaluateParameters(new ContextTarget(id), "Promise.resolve({a:1})", true)
              .resultOwnership(ResultOwnership.ROOT);
      EvaluateResult result = script.evaluateFunction(parameters);

      assertThat(result.getResultType()).isEqualTo(EvaluateResult.Type.SUCCESS);
      assertThat(result.getRealmId()).isNotNull();

      EvaluateResultSuccess successResult = (EvaluateResultSuccess) result;
      assertThat(successResult.getResult().getType()).isEqualTo("object");
      assertThat(successResult.getResult().getValue().isPresent()).isTrue();
      assertThat(successResult.getResult().getHandle().isPresent()).isTrue();
    }
  }

  @Test
  void canEvaluateInASandBox() {
    String id = driver.getWindowHandle();
    try (Script script = new Script(id, driver)) {

      // Make changes without sandbox
      EvaluateParameters parameters =
          new EvaluateParameters(new ContextTarget(id), "window.foo = 1", true);
      script.evaluateFunction(parameters);

      // Check changes are not present in the sandbox
      EvaluateResult resultNotInSandbox =
          script.evaluateFunction(
              new EvaluateParameters(new ContextTarget(id, "sandbox"), "window.foo", true));

      assertThat(resultNotInSandbox.getResultType()).isEqualTo(EvaluateResult.Type.SUCCESS);

      EvaluateResultSuccess result = (EvaluateResultSuccess) resultNotInSandbox;
      assertThat(result.getResult().getType()).isEqualTo("undefined");

      // Make changes in the sandbox
      script.evaluateFunction(
          new EvaluateParameters(new ContextTarget(id, "sandbox"), "window.foo = 2", true));

      // Check if the changes are present in the sandbox
      EvaluateResult resultInSandbox =
          script.evaluateFunction(
              new EvaluateParameters(new ContextTarget(id, "sandbox"), "window.foo", true));

      assertThat(resultInSandbox.getResultType()).isEqualTo(EvaluateResult.Type.SUCCESS);
      assertThat(resultInSandbox.getRealmId()).isNotNull();

      EvaluateResultSuccess resultInSandboxSuccess = (EvaluateResultSuccess) resultInSandbox;
      assertThat(resultInSandboxSuccess.getResult().getType()).isEqualTo("number");
      assertThat(resultInSandboxSuccess.getResult().getValue().isPresent()).isTrue();
      assertThat((Long) resultInSandboxSuccess.getResult().getValue().get()).isEqualTo(2L);
    }
  }

  @Test
  void canEvaluateInARealm() {
    String firstTab = driver.getWindowHandle();
    String secondTab = driver.switchTo().newWindow(WindowType.TAB).getWindowHandle();
    try (Script script = new Script(firstTab, driver)) {

      List<RealmInfo> realms = script.getAllRealms();

      String firstTabRealmId = realms.get(0).getRealmId();
      String secondTabRealmId = realms.get(1).getRealmId();

      script.evaluateFunction(
          new EvaluateParameters(new RealmTarget(firstTabRealmId), "window.foo = 3", true));

      script.evaluateFunction(
          new EvaluateParameters(new RealmTarget(secondTabRealmId), "window.foo = 5", true));

      EvaluateResult firstContextResult =
          script.evaluateFunctionInRealm(firstTabRealmId, "window.foo", true, Optional.empty());

      assertThat(firstContextResult.getResultType()).isEqualTo(EvaluateResult.Type.SUCCESS);

      EvaluateResultSuccess successFirstContextResult = (EvaluateResultSuccess) firstContextResult;
      assertThat(successFirstContextResult.getResult().getType()).isEqualTo("number");
      assertThat(successFirstContextResult.getResult().getValue().isPresent()).isTrue();
      assertThat((Long) successFirstContextResult.getResult().getValue().get()).isEqualTo(3L);

      EvaluateResult secondContextResult =
          script.evaluateFunctionInRealm(secondTabRealmId, "window.foo", true, Optional.empty());

      assertThat(secondContextResult.getResultType()).isEqualTo(EvaluateResult.Type.SUCCESS);

      EvaluateResultSuccess successSecondContextResult =
          (EvaluateResultSuccess) secondContextResult;
      assertThat(successSecondContextResult.getResult().getType()).isEqualTo("number");
      assertThat(successSecondContextResult.getResult().getValue().isPresent()).isTrue();
      assertThat((Long) successSecondContextResult.getResult().getValue().get()).isEqualTo(5L);
    }
  }

  @AfterEach
  public void quitDriver() {
    if (driver != null) {
      driver.quit();
    }
    safelyCall(server::stop);
  }
}
