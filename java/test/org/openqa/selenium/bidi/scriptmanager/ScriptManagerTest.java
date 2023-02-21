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

package org.openqa.selenium.bidi.scriptmanager;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.assertj.core.api.AssertionsForClassTypes.assertThatExceptionOfType;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.bidi.protocolvalue.LocalValue;
import org.openqa.selenium.bidi.protocolvalue.LocalValueType;
import org.openqa.selenium.bidi.protocolvalue.NonPrimitiveType;
import org.openqa.selenium.bidi.protocolvalue.PrimitiveType;
import org.openqa.selenium.bidi.protocolvalue.ReferenceValue;
import org.openqa.selenium.bidi.protocolvalue.RemoteValue;
import org.openqa.selenium.bidi.script.ArgumentValue;
import org.openqa.selenium.bidi.script.EvaluateResult;
import org.openqa.selenium.bidi.script.EvaluateResultException;
import org.openqa.selenium.bidi.script.EvaluateResultSuccess;
import org.openqa.selenium.bidi.script.ResultOwnership;
import org.openqa.selenium.bidi.script.ScriptManager;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.firefox.FirefoxOptions;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

class ScriptManagerTest {

  private FirefoxDriver driver;

  @BeforeEach
  public void setUp() {
    FirefoxOptions options = new FirefoxOptions();
    options.setCapability("webSocketUrl", true);

    driver = new FirefoxDriver(options);
  }

  @Test
  void canCallFunctionWithDeclaration() {
    String id = driver.getWindowHandle();
    ScriptManager manager = new ScriptManager(id, driver);

    EvaluateResult result = manager.callFunctionInBrowsingContext(id,
                                                                  "()=>{return 1+2;}",
                                                                  false,
                                                                  Optional.empty(),
                                                                  Optional.empty(),
                                                                  Optional.empty());

    assertThat(result.getResultType()).isEqualTo(EvaluateResult.EvaluateResultType.SUCCESS);
    assertThat(result.getRealmId()).isNotNull();

    EvaluateResultSuccess successResult = (EvaluateResultSuccess) result;
    assertThat(successResult.getResult().getType()).isEqualTo("number");
    assertThat(successResult.getResult().getValue().isPresent()).isTrue();
    assertThat((Long) successResult.getResult().getValue().get()).isEqualTo(3L);
  }

  @Test
  void canCallFunctionWithArguments() {
    String id = driver.getWindowHandle();
    ScriptManager manager = new ScriptManager(id, driver);

    List<ArgumentValue> arguments = new ArrayList<>();
    ArgumentValue value1 =
      new ArgumentValue(LocalValue.createStringValue("ARGUMENT_STRING_VALUE"));
    ArgumentValue value2 = new ArgumentValue(LocalValue.createNumberValue(42));
    arguments.add(value1);
    arguments.add(value2);

    EvaluateResult result = manager.callFunctionInBrowsingContext(id,
                                                                  "(...args)=>{return args}",
                                                                  false,
                                                                  Optional.of(arguments),
                                                                  Optional.empty(),
                                                                  Optional.empty());

    assertThat(result.getResultType()).isEqualTo(EvaluateResult.EvaluateResultType.SUCCESS);
    assertThat(result.getRealmId()).isNotNull();

    EvaluateResultSuccess successResult = (EvaluateResultSuccess) result;
    assertThat(successResult.getResult().getType()).isEqualTo("array");
    assertThat(successResult.getResult().getValue().isPresent()).isTrue();
    assertThat(((List<Object>) successResult.getResult().getValue().get()).size()).isEqualTo(2);
  }

  @Test
  void canCallFunctionWithAwaitPromise() {
    String id = driver.getWindowHandle();
    ScriptManager manager = new ScriptManager(id, driver);

    EvaluateResult result = manager.callFunctionInBrowsingContext(id,
                                                                  "async function() {{\n"
                                                                  + "            await new Promise(r => setTimeout(() => r(), 0));\n"
                                                                  + "            return \"SOME_DELAYED_RESULT\";\n"
                                                                  + "          }}",
                                                                  true,
                                                                  Optional.empty(),
                                                                  Optional.empty(),
                                                                  Optional.empty());

    assertThat(result.getResultType()).isEqualTo(EvaluateResult.EvaluateResultType.SUCCESS);
    assertThat(result.getRealmId()).isNotNull();

    EvaluateResultSuccess successResult = (EvaluateResultSuccess) result;
    assertThat(successResult.getResult().getType()).isEqualTo("string");
    assertThat(successResult.getResult().getValue().isPresent()).isTrue();
    assertThat(((String) successResult.getResult().getValue().get())).isEqualTo(
      "SOME_DELAYED_RESULT");
  }

  @Test
  void canCallFunctionWithAwaitPromiseFalse() {
    String id = driver.getWindowHandle();
    ScriptManager manager = new ScriptManager(id, driver);

    EvaluateResult result = manager.callFunctionInBrowsingContext(id,
                                                                  "async function() {{\n"
                                                                  + "            await new Promise(r => setTimeout(() => r(), 0));\n"
                                                                  + "            return \"SOME_DELAYED_RESULT\";\n"
                                                                  + "          }}",
                                                                  false,
                                                                  Optional.empty(),
                                                                  Optional.empty(),
                                                                  Optional.empty());

    assertThat(result.getResultType()).isEqualTo(EvaluateResult.EvaluateResultType.SUCCESS);
    assertThat(result.getRealmId()).isNotNull();

    EvaluateResultSuccess successResult = (EvaluateResultSuccess) result;
    assertThat(successResult.getResult().getType()).isEqualTo("promise");
    assertThat(successResult.getResult().getValue().isPresent()).isFalse();
  }

  @Test
  void canCallFunctionWithThisParameter() {
    String id = driver.getWindowHandle();
    ScriptManager manager = new ScriptManager(id, driver);

    Map<Object, LocalValue> value = new HashMap<>();
    value.put("some_property", LocalValue.createNumberValue(42));
    ArgumentValue thisParameter = new ArgumentValue(LocalValue.createObjectValue(value));

    EvaluateResult result = manager.callFunctionInBrowsingContext(id,
                                                                  "function(){return this.some_property}",
                                                                  false,
                                                                  Optional.empty(),
                                                                  Optional.of(thisParameter),
                                                                  Optional.empty());

    assertThat(result.getResultType()).isEqualTo(EvaluateResult.EvaluateResultType.SUCCESS);
    assertThat(result.getRealmId()).isNotNull();

    EvaluateResultSuccess successResult = (EvaluateResultSuccess) result;
    assertThat(successResult.getResult().getType()).isEqualTo("number");
    assertThat(successResult.getResult().getValue().isPresent()).isTrue();
    assertThat((Long) successResult.getResult().getValue().get()).isEqualTo(42L);
  }

  @Test
  void canCallFunctionWithOwnershipRoot() {
    String id = driver.getWindowHandle();
    ScriptManager manager = new ScriptManager(id, driver);

    EvaluateResult result = manager.callFunctionInBrowsingContext(id,
                                                                  "async function(){return {a:1}}",
                                                                  true,
                                                                  Optional.empty(),
                                                                  Optional.empty(),
                                                                  Optional.of(
                                                                    ResultOwnership.ROOT));

    assertThat(result.getResultType()).isEqualTo(EvaluateResult.EvaluateResultType.SUCCESS);
    assertThat(result.getRealmId()).isNotNull();

    EvaluateResultSuccess successResult = (EvaluateResultSuccess) result;
    assertThat(successResult.getResult().getHandle().isPresent()).isTrue();
    assertThat(successResult.getResult().getValue().isPresent()).isTrue();
  }

  @Test
  void canCallFunctionWithOwnershipNone() {
    String id = driver.getWindowHandle();
    ScriptManager manager = new ScriptManager(id, driver);

    EvaluateResult result = manager.callFunctionInBrowsingContext(id,
                                                                  "async function(){return {a:1}}",
                                                                  true,
                                                                  Optional.empty(),
                                                                  Optional.empty(),
                                                                  Optional.of(
                                                                    ResultOwnership.NONE));

    assertThat(result.getResultType()).isEqualTo(EvaluateResult.EvaluateResultType.SUCCESS);
    assertThat(result.getRealmId()).isNotNull();

    EvaluateResultSuccess successResult = (EvaluateResultSuccess) result;
    assertThat(successResult.getResult().getHandle().isPresent()).isFalse();
    assertThat(successResult.getResult().getValue().isPresent()).isTrue();
  }

  @Test
  void canCallFunctionThatThrowsException() {
    String id = driver.getWindowHandle();
    ScriptManager manager = new ScriptManager(id, driver);

    EvaluateResult result = manager.callFunctionInBrowsingContext(id,
                                                                  "))) !!@@## some invalid JS script (((",
                                                                  false,
                                                                  Optional.empty(),
                                                                  Optional.empty(),
                                                                  Optional.empty());

    assertThat(result.getResultType()).isEqualTo(EvaluateResult.EvaluateResultType.EXCEPTION);
    assertThat(result.getRealmId()).isNotNull();

    EvaluateResultException exception = (EvaluateResultException) result;
    assertThat(exception.getExceptionDetails().getException().getType()).isEqualTo("error");
    assertThat(exception.getExceptionDetails().getText()).isEqualTo(
      "SyntaxError: expected expression, got ')'");
    assertThat(exception.getExceptionDetails().getLineNumber()).isEqualTo(274L);
    assertThat(exception.getExceptionDetails().getColumnNumber()).isEqualTo(39L);
    assertThat(exception.getExceptionDetails().getStacktrace().getCallFrames().size()).isEqualTo(0);
  }

  @Test
  void canCallFunctionInASandBox() {
    String id = driver.getWindowHandle();
    ScriptManager manager = new ScriptManager(id, driver);

    // Make changes without sandbox
    manager.callFunctionInBrowsingContext(id,
                                          "() => { window.foo = 1; }",
                                          true,
                                          Optional.empty(),
                                          Optional.empty(),
                                          Optional.empty());

    // Check changes are not present in the sandbox
    EvaluateResult resultNotInSandbox = manager.callFunctionInBrowsingContext(
      id,
      "sandbox",
      "() => window.foo",
      true,
      Optional.empty(),
      Optional.empty(),
      Optional.empty());

    assertThat(resultNotInSandbox.getResultType()).isEqualTo(
      EvaluateResult.EvaluateResultType.SUCCESS);

    EvaluateResultSuccess result = (EvaluateResultSuccess) resultNotInSandbox;
    assertThat(result.getResult().getType()).isEqualTo("undefined");

    // Make changes in the sandbox
    manager.callFunctionInBrowsingContext(id,
                                          "sandbox",
                                          "() => { window.foo = 2; }",
                                          true,
                                          Optional.empty(),
                                          Optional.empty(),
                                          Optional.empty());

    // Check if the changes are present in the sandbox
    EvaluateResult resultInSandbox = manager.callFunctionInBrowsingContext(
      id,
      "sandbox",
      "() => window.foo",
      true,
      Optional.empty(),
      Optional.empty(),
      Optional.empty());

    assertThat(resultInSandbox.getResultType()).isEqualTo(
      EvaluateResult.EvaluateResultType.SUCCESS);
    assertThat(resultInSandbox.getRealmId()).isNotNull();

    EvaluateResultSuccess resultInSandboxSuccess = (EvaluateResultSuccess) resultInSandbox;
    assertThat(resultInSandboxSuccess.getResult().getType()).isEqualTo("number");
    assertThat(resultInSandboxSuccess.getResult().getValue().isPresent()).isTrue();
    assertThat((Long) resultInSandboxSuccess.getResult().getValue().get()).isEqualTo(2L);
  }

  @Test
  void canEvaluateScript() {
    String id = driver.getWindowHandle();
    ScriptManager manager = new ScriptManager(id, driver);

    EvaluateResult result = manager.evaluateFunctionInBrowsingContext(
      id, "1 + 2", true, Optional.empty());

    assertThat(result.getResultType()).isEqualTo(EvaluateResult.EvaluateResultType.SUCCESS);
    assertThat(result.getRealmId()).isNotNull();

    EvaluateResultSuccess successResult = (EvaluateResultSuccess) result;
    assertThat(successResult.getResult().getType()).isEqualTo("number");
    assertThat(successResult.getResult().getValue().isPresent()).isTrue();
    assertThat((Long) successResult.getResult().getValue().get()).isEqualTo(3L);
  }

  @Test
  void canEvaluateScriptThatThrowsException() {
    String id = driver.getWindowHandle();
    ScriptManager manager = new ScriptManager(id, driver);

    EvaluateResult result = manager.evaluateFunctionInBrowsingContext(id,
                                                                      "))) !!@@## some invalid JS script (((",
                                                                      false,
                                                                      Optional.empty());

    assertThat(result.getResultType()).isEqualTo(EvaluateResult.EvaluateResultType.EXCEPTION);
    assertThat(result.getRealmId()).isNotNull();

    EvaluateResultException exception = (EvaluateResultException) result;
    assertThat(exception.getExceptionDetails().getException().getType()).isEqualTo("error");
    assertThat(exception.getExceptionDetails().getText()).isEqualTo(
      "SyntaxError: expected expression, got ')'");
    assertThat(exception.getExceptionDetails().getLineNumber()).isEqualTo(240L);
    assertThat(exception.getExceptionDetails().getColumnNumber()).isEqualTo(39L);
    assertThat(exception.getExceptionDetails().getStacktrace().getCallFrames().size()).isEqualTo(0);
  }

  @Test
  void canEvaluateScriptWithResulWithOwnership() {
    String id = driver.getWindowHandle();
    ScriptManager manager = new ScriptManager(id, driver);

    EvaluateResult result = manager.evaluateFunctionInBrowsingContext(
      id, "Promise.resolve({a:1})", true, Optional.of(ResultOwnership.ROOT));

    assertThat(result.getResultType()).isEqualTo(EvaluateResult.EvaluateResultType.SUCCESS);
    assertThat(result.getRealmId()).isNotNull();

    EvaluateResultSuccess successResult = (EvaluateResultSuccess) result;
    assertThat(successResult.getResult().getType()).isEqualTo("object");
    assertThat(successResult.getResult().getValue().isPresent()).isTrue();
    assertThat(successResult.getResult().getHandle().isPresent()).isTrue();
  }

  @Test
  void canEvaluateInASandBox() {
    String id = driver.getWindowHandle();
    ScriptManager manager = new ScriptManager(id, driver);

    // Make changes without sandbox
    manager.evaluateFunctionInBrowsingContext(id,
                                          "window.foo = 1",
                                          true,
                                          Optional.empty());

    // Check changes are not present in the sandbox
    EvaluateResult resultNotInSandbox = manager.evaluateFunctionInBrowsingContext(
      id,
      "sandbox",
      "window.foo",
      true,
      Optional.empty());

    assertThat(resultNotInSandbox.getResultType()).isEqualTo(
      EvaluateResult.EvaluateResultType.SUCCESS);

    EvaluateResultSuccess result = (EvaluateResultSuccess) resultNotInSandbox;
    assertThat(result.getResult().getType()).isEqualTo("undefined");

    // Make changes in the sandbox
    manager.evaluateFunctionInBrowsingContext(id,
                                          "sandbox",
                                          "window.foo = 2",
                                          true,
                                          Optional.empty());

    // Check if the changes are present in the sandbox
    EvaluateResult resultInSandbox = manager.evaluateFunctionInBrowsingContext(
      id,
      "sandbox",
      "window.foo",
      true,
      Optional.empty());

    assertThat(resultInSandbox.getResultType()).isEqualTo(
      EvaluateResult.EvaluateResultType.SUCCESS);
    assertThat(resultInSandbox.getRealmId()).isNotNull();

    EvaluateResultSuccess resultInSandboxSuccess = (EvaluateResultSuccess) resultInSandbox;
    assertThat(resultInSandboxSuccess.getResult().getType()).isEqualTo("number");
    assertThat(resultInSandboxSuccess.getResult().getValue().isPresent()).isTrue();
    assertThat((Long) resultInSandboxSuccess.getResult().getValue().get()).isEqualTo(2L);
  }

  @Test
  void canDisownHandles() {
    String id = driver.getWindowHandle();
    ScriptManager manager = new ScriptManager(id, driver);

    EvaluateResult evaluateResult = manager.evaluateFunctionInBrowsingContext(
      id, "({a:1})", false, Optional.of(ResultOwnership.ROOT));

    assertThat(evaluateResult.getResultType()).isEqualTo(EvaluateResult.EvaluateResultType.SUCCESS);
    assertThat(evaluateResult.getRealmId()).isNotNull();

    EvaluateResultSuccess successEvaluateResult = (EvaluateResultSuccess) evaluateResult;
    assertThat(successEvaluateResult.getResult().getHandle().isPresent()).isTrue();

    List<ArgumentValue> arguments = new ArrayList<>();

    Map<Object, RemoteValue> valueMap =
      (Map<Object, RemoteValue>) successEvaluateResult.getResult().getValue().get();

    Map<Object, LocalValue> localValueMap = new HashMap<>();
    valueMap.forEach((k, v) -> {
      LocalValueType type;
      if (PrimitiveType.findByName(v.getType())!=null) {
        type = PrimitiveType.findByName(v.getType());
      } else {
        type = NonPrimitiveType.findByName(v.getType());
      }

      localValueMap.put(k, new LocalValue(type, v.getValue().get()));
  });

    ArgumentValue value1 =
      new ArgumentValue(LocalValue.createObjectValue(localValueMap));
    ArgumentValue value2 = new ArgumentValue(new ReferenceValue(
      ReferenceValue.RemoteReferenceType.HANDLE,
      successEvaluateResult.getResult().getHandle().get()));
    arguments.add(value1);
    arguments.add(value2);

    manager.callFunctionInBrowsingContext(id,
                                          "arg => arg.a",
                                          false,
                                          Optional.of(
                                            arguments),
                                          Optional.empty(),
                                          Optional.empty());

    assertThat(successEvaluateResult.getResult().getValue().isPresent()).isTrue();

    List<String> handles = new ArrayList<>();
    handles.add(successEvaluateResult.getResult().getHandle().get());
    manager.disownBrowsingContextScript(id, handles);

    assertThatExceptionOfType(WebDriverException.class).isThrownBy(
      () -> manager.callFunctionInBrowsingContext(
        id,
        "arg => arg.a",
        false,
        Optional.of(arguments),
        Optional.empty(),
        Optional.empty()));
  }


  @AfterEach
  public void quitDriver() {
    if (driver != null) {
      driver.quit();
    }
  }
}
