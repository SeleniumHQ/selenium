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
import static org.openqa.selenium.testing.drivers.Browser.IE;
import static org.openqa.selenium.testing.drivers.Browser.SAFARI;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WindowType;
import org.openqa.selenium.bidi.module.Script;
import org.openqa.selenium.environment.webserver.AppServer;
import org.openqa.selenium.environment.webserver.NettyAppServer;
import org.openqa.selenium.testing.JupiterTestBase;
import org.openqa.selenium.testing.NotYetImplemented;

public class CallFunctionParameterTest extends JupiterTestBase {
  private AppServer server;

  @BeforeEach
  public void setUp() {
    server = new NettyAppServer();
    server.start();
  }

  @Test
  void canCallFunctionWithDeclaration() {
    String id = driver.getWindowHandle();
    try (Script script = new Script(id, driver)) {
      CallFunctionParameters parameters =
          new CallFunctionParameters(new ContextTarget(id), "()=>{return 1+2;}", false);
      EvaluateResult result = script.callFunction(parameters);

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
          script.callFunction(
              new CallFunctionParameters(
                      new ContextTarget(id),
                      "() => navigator.userActivation.isActive &&"
                          + " navigator.userActivation.hasBeenActive",
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
          script.callFunction(
              new CallFunctionParameters(
                      new ContextTarget(id),
                      "() => navigator.userActivation.isActive &&"
                          + " navigator.userActivation.hasBeenActive",
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
  void canCallFunctionWithArguments() {
    String id = driver.getWindowHandle();
    try (Script script = new Script(id, driver)) {

      List<LocalValue> arguments = new ArrayList<>();
      LocalValue value1 = PrimitiveProtocolValue.stringValue("ARGUMENT_STRING_VALUE");
      LocalValue value2 = PrimitiveProtocolValue.numberValue(42);
      arguments.add(value1);
      arguments.add(value2);

      CallFunctionParameters parameters =
          new CallFunctionParameters(new ContextTarget(id), "(...args)=>{return args}", false)
              .arguments(arguments);
      EvaluateResult result = script.callFunction(parameters);

      assertThat(result.getResultType()).isEqualTo(EvaluateResult.Type.SUCCESS);
      assertThat(result.getRealmId()).isNotNull();

      EvaluateResultSuccess successResult = (EvaluateResultSuccess) result;
      assertThat(successResult.getResult().getType()).isEqualTo("array");
      assertThat(successResult.getResult().getValue().isPresent()).isTrue();
      assertThat(((List<Object>) successResult.getResult().getValue().get()).size()).isEqualTo(2);
    }
  }

  @Test
  void canCallFunctionToGetIFrameBrowsingContext() {
    String url = appServer.whereIs("click_too_big_in_frame.html");
    driver.get(url);

    driver.findElement(By.id("iframe1"));

    String id = driver.getWindowHandle();
    try (Script script = new Script(id, driver)) {

      List<LocalValue> arguments = new ArrayList<>();

      CallFunctionParameters parameters =
          new CallFunctionParameters(
                  new ContextTarget(id),
                  "() => document.querySelector('iframe[id=\"iframe1\"]').contentWindow",
                  false)
              .arguments(arguments);
      EvaluateResult result = script.callFunction(parameters);

      assertThat(result.getResultType()).isEqualTo(EvaluateResult.Type.SUCCESS);
      assertThat(result.getRealmId()).isNotNull();

      EvaluateResultSuccess successResult = (EvaluateResultSuccess) result;
      assertThat(successResult.getResult().getType()).isEqualTo("window");
      assertThat(successResult.getResult().getValue().isPresent()).isTrue();
      assertThat(
              ((WindowProxyProperties) successResult.getResult().getValue().get())
                  .getBrowsingContext())
          .isNotNull();
    }
  }

  @Test
  void canCallFunctionToGetElement() {
    String url = appServer.whereIs("/bidi/logEntryAdded.html");
    driver.get(url);

    String id = driver.getWindowHandle();
    try (Script script = new Script(id, driver)) {

      List<LocalValue> arguments = new ArrayList<>();

      CallFunctionParameters parameters =
          new CallFunctionParameters(
                  new ContextTarget(id), "() => document.getElementById(\"consoleLog\")", false)
              .arguments(arguments);
      EvaluateResult result = script.callFunction(parameters);

      assertThat(result.getResultType()).isEqualTo(EvaluateResult.Type.SUCCESS);
      assertThat(result.getRealmId()).isNotNull();

      EvaluateResultSuccess successResult = (EvaluateResultSuccess) result;
      assertThat(successResult.getResult().getType()).isEqualTo("node");
      assertThat(successResult.getResult().getValue().isPresent()).isTrue();
      assertThat(((NodeProperties) successResult.getResult().getValue().get()).getNodeType())
          .isNotNull();
    }
  }

  @Test
  void canCallFunctionWithAwaitPromise() {
    String id = driver.getWindowHandle();
    try (Script script = new Script(id, driver)) {

      CallFunctionParameters parameters =
          new CallFunctionParameters(
              new ContextTarget(id),
              "async function() {{\n"
                  + "            await new Promise(r => setTimeout(() => r(), 0));\n"
                  + "            return \"SOME_DELAYED_RESULT\";\n"
                  + "          }}",
              true);
      EvaluateResult result = script.callFunction(parameters);

      assertThat(result.getResultType()).isEqualTo(EvaluateResult.Type.SUCCESS);
      assertThat(result.getRealmId()).isNotNull();

      EvaluateResultSuccess successResult = (EvaluateResultSuccess) result;
      assertThat(successResult.getResult().getType()).isEqualTo("string");
      assertThat(successResult.getResult().getValue().isPresent()).isTrue();
      assertThat(((String) successResult.getResult().getValue().get()))
          .isEqualTo("SOME_DELAYED_RESULT");
    }
  }

  @Test
  void canCallFunctionWithAwaitPromiseFalse() {
    String id = driver.getWindowHandle();
    try (Script script = new Script(id, driver)) {

      CallFunctionParameters parameters =
          new CallFunctionParameters(
              new ContextTarget(id),
              "async function() {{\n"
                  + "            await new Promise(r => setTimeout(() => r(), 0));\n"
                  + "            return \"SOME_DELAYED_RESULT\";\n"
                  + "          }}",
              false);
      EvaluateResult result = script.callFunction(parameters);

      assertThat(result.getResultType()).isEqualTo(EvaluateResult.Type.SUCCESS);
      assertThat(result.getRealmId()).isNotNull();

      EvaluateResultSuccess successResult = (EvaluateResultSuccess) result;
      assertThat(successResult.getResult().getType()).isEqualTo("promise");
      assertThat(successResult.getResult().getValue().isPresent()).isFalse();
    }
  }

  @Test
  void canCallFunctionWithThisParameter() {
    String id = driver.getWindowHandle();
    try (Script script = new Script(id, driver)) {

      Map<Object, LocalValue> value = new HashMap<>();
      value.put("some_property", LocalValue.numberValue(42));
      LocalValue thisParameter = new ObjectLocalValue(value);

      CallFunctionParameters parameters =
          new CallFunctionParameters(
                  new ContextTarget(id), "function(){return this.some_property}", false)
              .thisParameter(thisParameter);
      EvaluateResult result = script.callFunction(parameters);

      assertThat(result.getResultType()).isEqualTo(EvaluateResult.Type.SUCCESS);
      assertThat(result.getRealmId()).isNotNull();

      EvaluateResultSuccess successResult = (EvaluateResultSuccess) result;
      assertThat(successResult.getResult().getType()).isEqualTo("number");
      assertThat(successResult.getResult().getValue().isPresent()).isTrue();
      assertThat((Long) successResult.getResult().getValue().get()).isEqualTo(42L);
    }
  }

  @Test
  void canCallFunctionWithOwnershipRoot() {
    String id = driver.getWindowHandle();
    try (Script script = new Script(id, driver)) {

      CallFunctionParameters parameters =
          new CallFunctionParameters(new ContextTarget(id), "async function(){return {a:1}}", true)
              .resultOwnership(ResultOwnership.ROOT);
      EvaluateResult result = script.callFunction(parameters);

      assertThat(result.getResultType()).isEqualTo(EvaluateResult.Type.SUCCESS);
      assertThat(result.getRealmId()).isNotNull();

      EvaluateResultSuccess successResult = (EvaluateResultSuccess) result;
      assertThat(successResult.getResult().getHandle().isPresent()).isTrue();
      assertThat(successResult.getResult().getValue().isPresent()).isTrue();
    }
  }

  @Test
  void canCallFunctionWithOwnershipNone() {
    String id = driver.getWindowHandle();
    try (Script script = new Script(id, driver)) {
      CallFunctionParameters parameters =
          new CallFunctionParameters(new ContextTarget(id), "async function(){return {a:1}}", true)
              .resultOwnership(ResultOwnership.NONE);

      EvaluateResult result = script.callFunction(parameters);

      assertThat(result.getResultType()).isEqualTo(EvaluateResult.Type.SUCCESS);
      assertThat(result.getRealmId()).isNotNull();

      EvaluateResultSuccess successResult = (EvaluateResultSuccess) result;
      assertThat(successResult.getResult().getHandle().isPresent()).isFalse();
      assertThat(successResult.getResult().getValue().isPresent()).isTrue();
    }
  }

  @Test
  @NotYetImplemented(SAFARI)
  @NotYetImplemented(IE)
  void canCallFunctionThatThrowsException() {
    String id = driver.getWindowHandle();
    try (Script script = new Script(id, driver)) {

      CallFunctionParameters parameters =
          new CallFunctionParameters(
              new ContextTarget(id), "))) !!@@## some invalid JS script (((", false);

      EvaluateResult result = script.callFunction(parameters);

      assertThat(result.getResultType()).isEqualTo(EvaluateResult.Type.EXCEPTION);
      assertThat(result.getRealmId()).isNotNull();

      EvaluateResultExceptionValue exception = (EvaluateResultExceptionValue) result;
      assertThat(exception.getExceptionDetails().getException().getType()).isEqualTo("error");
      assertThat(exception.getExceptionDetails().getText()).contains("SyntaxError:");
      assertThat(exception.getExceptionDetails().getLineNumber()).isPositive();
      assertThat(exception.getExceptionDetails().getColumnNumber()).isPositive();
      assertThat(exception.getExceptionDetails().getStacktrace().getCallFrames().size())
          .isEqualTo(0);
    }
  }

  @Test
  void canCallFunctionInASandBox() {
    String id = driver.getWindowHandle();
    try (Script script = new Script(id, driver)) {
      // Make changes without sandbox
      script.callFunction(
          new CallFunctionParameters(new ContextTarget(id), "() => { window.foo = 1; }", true));

      // Check changes are not present in the sandbox
      EvaluateResult resultNotInSandbox =
          script.callFunction(
              new CallFunctionParameters(
                  new ContextTarget(id, "sandbox"), "() => window.foo", true));

      assertThat(resultNotInSandbox.getResultType()).isEqualTo(EvaluateResult.Type.SUCCESS);

      EvaluateResultSuccess result = (EvaluateResultSuccess) resultNotInSandbox;
      assertThat(result.getResult().getType()).isEqualTo("undefined");

      // Make changes in the sandbox
      script.callFunction(
          new CallFunctionParameters(
              new ContextTarget(id, "sandbox"), "() => { window.foo = 2; }", true));

      // Check if the changes are present in the sandbox
      EvaluateResult resultInSandbox =
          script.callFunction(
              new CallFunctionParameters(
                  new ContextTarget(id, "sandbox"), "() => window.foo", true));

      assertThat(resultInSandbox.getResultType()).isEqualTo(EvaluateResult.Type.SUCCESS);
      assertThat(resultInSandbox.getRealmId()).isNotNull();

      EvaluateResultSuccess resultInSandboxSuccess = (EvaluateResultSuccess) resultInSandbox;
      assertThat(resultInSandboxSuccess.getResult().getType()).isEqualTo("number");
      assertThat(resultInSandboxSuccess.getResult().getValue().isPresent()).isTrue();
      assertThat((Long) resultInSandboxSuccess.getResult().getValue().get()).isEqualTo(2L);
    }
  }

  @Test
  void canCallFunctionInARealm() {
    String firstTab = driver.getWindowHandle();
    String secondTab = driver.switchTo().newWindow(WindowType.TAB).getWindowHandle();
    try (Script script = new Script(firstTab, driver)) {

      List<RealmInfo> realms = script.getAllRealms();

      String firstTabRealmId = realms.get(0).getRealmId();
      String secondTabRealmId = realms.get(1).getRealmId();

      script.callFunction(
          new CallFunctionParameters(
              new RealmTarget(firstTabRealmId), "() => { window.foo = 3; }", true));

      script.callFunction(
          new CallFunctionParameters(
              new RealmTarget(secondTabRealmId), "() => { window.foo = 5; }", true));

      EvaluateResult firstContextResult =
          script.callFunction(
              new CallFunctionParameters(
                  new RealmTarget(firstTabRealmId), "() => window.foo", true));

      assertThat(firstContextResult.getResultType()).isEqualTo(EvaluateResult.Type.SUCCESS);

      EvaluateResultSuccess successFirstContextresult = (EvaluateResultSuccess) firstContextResult;
      assertThat(successFirstContextresult.getResult().getType()).isEqualTo("number");
      assertThat(successFirstContextresult.getResult().getValue().isPresent()).isTrue();
      assertThat((Long) successFirstContextresult.getResult().getValue().get()).isEqualTo(3L);

      EvaluateResult secondContextResult =
          script.callFunction(
              new CallFunctionParameters(
                  new RealmTarget(secondTabRealmId), "() => window.foo", true));

      assertThat(secondContextResult.getResultType()).isEqualTo(EvaluateResult.Type.SUCCESS);

      EvaluateResultSuccess successSecondContextresult =
          (EvaluateResultSuccess) secondContextResult;
      assertThat(successSecondContextresult.getResult().getType()).isEqualTo("number");
      assertThat(successSecondContextresult.getResult().getValue().isPresent()).isTrue();
      assertThat((Long) successSecondContextresult.getResult().getValue().get()).isEqualTo(5L);
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
