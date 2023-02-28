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
import org.openqa.selenium.WindowType;
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
import org.openqa.selenium.bidi.script.RealmInfo;
import org.openqa.selenium.bidi.script.RealmType;
import org.openqa.selenium.bidi.script.ResultOwnership;
import org.openqa.selenium.bidi.script.ScriptManager;
import org.openqa.selenium.bidi.script.WindowRealmInfo;
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
  void canCallFunctionInARealm() {
    String firstTab = driver.getWindowHandle();
    String secondTab = driver.switchTo().newWindow(WindowType.TAB).getWindowHandle();
    ScriptManager manager = new ScriptManager(firstTab, driver);

    List<RealmInfo> realms = manager.getAllRealms();

    String firstTabRealmId = realms.get(0).getRealmId();
    String secondTabRealmId = realms.get(1).getRealmId();

    manager.callFunctionInRealm(firstTabRealmId,
                                          "() => { window.foo = 3; }",
                                          true,
                                          Optional.empty(),
                                          Optional.empty(),
                                          Optional.empty());

    manager.callFunctionInRealm(secondTabRealmId,
                                "() => { window.foo = 5; }",
                                true,
                                Optional.empty(),
                                Optional.empty(),
                                Optional.empty());

    EvaluateResult firstContextResult = manager.callFunctionInRealm(
      firstTabRealmId,
      "() => window.foo",
      true,
      Optional.empty(),
      Optional.empty(),
      Optional.empty());

    assertThat(firstContextResult.getResultType()).isEqualTo(
      EvaluateResult.EvaluateResultType.SUCCESS);

    EvaluateResultSuccess successFirstContextresult = (EvaluateResultSuccess) firstContextResult;
    assertThat(successFirstContextresult.getResult().getType()).isEqualTo("number");
    assertThat(successFirstContextresult.getResult().getValue().isPresent()).isTrue();
    assertThat((Long) successFirstContextresult.getResult().getValue().get()).isEqualTo(3L);

    EvaluateResult secondContextResult = manager.callFunctionInRealm(
      secondTabRealmId,
      "() => window.foo",
      true,
      Optional.empty(),
      Optional.empty(),
      Optional.empty());

    assertThat(secondContextResult.getResultType()).isEqualTo(
      EvaluateResult.EvaluateResultType.SUCCESS);

    EvaluateResultSuccess successSecondContextresult = (EvaluateResultSuccess) secondContextResult;
    assertThat(successSecondContextresult.getResult().getType()).isEqualTo("number");
    assertThat(successSecondContextresult.getResult().getValue().isPresent()).isTrue();
    assertThat((Long) successSecondContextresult.getResult().getValue().get()).isEqualTo(5L);
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
  void canEvaluateInARealm() {
    String firstTab = driver.getWindowHandle();
    String secondTab = driver.switchTo().newWindow(WindowType.TAB).getWindowHandle();
    ScriptManager manager = new ScriptManager(firstTab, driver);

    List<RealmInfo> realms = manager.getAllRealms();

    String firstTabRealmId = realms.get(0).getRealmId();
    String secondTabRealmId = realms.get(1).getRealmId();

    manager.evaluateFunctionInRealm(firstTabRealmId,
                                "window.foo = 3",
                                true,
                                Optional.empty());

    manager.evaluateFunctionInRealm(secondTabRealmId,
                                "window.foo = 5",
                                true,
                                Optional.empty());

    EvaluateResult firstContextResult = manager.evaluateFunctionInRealm(
      firstTabRealmId,
      "window.foo",
      true,
      Optional.empty());

    assertThat(firstContextResult.getResultType()).isEqualTo(
      EvaluateResult.EvaluateResultType.SUCCESS);

    EvaluateResultSuccess successFirstContextresult = (EvaluateResultSuccess) firstContextResult;
    assertThat(successFirstContextresult.getResult().getType()).isEqualTo("number");
    assertThat(successFirstContextresult.getResult().getValue().isPresent()).isTrue();
    assertThat((Long) successFirstContextresult.getResult().getValue().get()).isEqualTo(3L);

    EvaluateResult secondContextResult = manager.evaluateFunctionInRealm(
      secondTabRealmId,
      "window.foo",
      true,
      Optional.empty());

    assertThat(secondContextResult.getResultType()).isEqualTo(
      EvaluateResult.EvaluateResultType.SUCCESS);

    EvaluateResultSuccess successSecondContextresult = (EvaluateResultSuccess) secondContextResult;
    assertThat(successSecondContextresult.getResult().getType()).isEqualTo("number");
    assertThat(successSecondContextresult.getResult().getValue().isPresent()).isTrue();
    assertThat((Long) successSecondContextresult.getResult().getValue().get()).isEqualTo(5L);
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

  @Test
  void canDisownHandlesInRealm() {
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
    manager.disownRealmScript(evaluateResult.getRealmId(), handles);

    assertThatExceptionOfType(WebDriverException.class).isThrownBy(
      () -> manager.callFunctionInBrowsingContext(
        id,
        "arg => arg.a",
        false,
        Optional.of(arguments),
        Optional.empty(),
        Optional.empty()));
  }

  @Test
  void canGetAllRealms() {
    String firstWindow = driver.getWindowHandle();
    String secondWindow = driver.switchTo().newWindow(WindowType.WINDOW).getWindowHandle();
    ScriptManager manager = new ScriptManager(firstWindow, driver);
    List<RealmInfo> realms = manager.getAllRealms();

    assertThat(realms.size()).isEqualTo(2);

    RealmInfo firstWindowRealm = realms.get(0);
    assertThat(firstWindowRealm.getRealmType()).isEqualTo(RealmType.WINDOW);
    assertThat(firstWindowRealm.getRealmId()).isNotNull();

    WindowRealmInfo firstWindowRealmInfo = (WindowRealmInfo) firstWindowRealm;
    assertThat(firstWindowRealmInfo.getBrowsingContext()).isEqualTo(firstWindow);

    RealmInfo secondWindowRealm = realms.get(1);
    assertThat(secondWindowRealm.getRealmType()).isEqualTo(RealmType.WINDOW);
    assertThat(secondWindowRealm.getRealmId()).isNotNull();

    WindowRealmInfo secondWindowRealmInfo = (WindowRealmInfo) secondWindowRealm;
    assertThat(secondWindowRealmInfo.getBrowsingContext()).isEqualTo(secondWindow);
  }

  @Test
  void canGetRealmByType() {
    String firstWindow = driver.getWindowHandle();
    String secondWindow = driver.switchTo().newWindow(WindowType.WINDOW).getWindowHandle();
    ScriptManager manager = new ScriptManager(firstWindow, driver);
    List<RealmInfo> realms = manager.getRealmsByType(RealmType.WINDOW);

    assertThat(realms.size()).isEqualTo(2);

    RealmInfo firstWindowRealm = realms.get(0);
    assertThat(firstWindowRealm.getRealmType()).isEqualTo(RealmType.WINDOW);
    assertThat(firstWindowRealm.getRealmId()).isNotNull();

    WindowRealmInfo firstWindowRealmInfo = (WindowRealmInfo) firstWindowRealm;
    assertThat(firstWindowRealmInfo.getBrowsingContext()).isEqualTo(firstWindow);

    RealmInfo secondWindowRealm = realms.get(1);
    assertThat(secondWindowRealm.getRealmType()).isEqualTo(RealmType.WINDOW);
    assertThat(secondWindowRealm.getRealmId()).isNotNull();

    WindowRealmInfo secondWindowRealmInfo = (WindowRealmInfo) secondWindowRealm;
    assertThat(secondWindowRealmInfo.getBrowsingContext()).isEqualTo(secondWindow);
  }

  @Test
  void canGetRealmInBrowsingContext() {
    String windowId = driver.getWindowHandle();
    String tabId = driver.switchTo().newWindow(WindowType.TAB).getWindowHandle();

    ScriptManager manager = new ScriptManager(windowId, driver);
    List<RealmInfo> realms = manager.getRealmsInBrowsingContext(tabId);

    RealmInfo tabRealm = realms.get(0);
    assertThat(tabRealm.getRealmType()).isEqualTo(RealmType.WINDOW);
    assertThat(tabRealm.getRealmId()).isNotNull();

    WindowRealmInfo firstWindowRealmInfo = (WindowRealmInfo) tabRealm;
    assertThat(firstWindowRealmInfo.getBrowsingContext()).isEqualTo(tabId);
  }

  @Test
  void canGetRealmInBrowsingContextByType() {
    String windowId = driver.getWindowHandle();
    driver.switchTo().newWindow(WindowType.TAB).getWindowHandle();

    ScriptManager manager = new ScriptManager(windowId, driver);
    List<RealmInfo> windowRealms = manager.getRealmsInBrowsingContextByType(windowId, RealmType.WINDOW);

    RealmInfo windowRealm = windowRealms.get(0);
    assertThat(windowRealm.getRealmType()).isEqualTo(RealmType.WINDOW);
    assertThat(windowRealm.getRealmId()).isNotNull();

    WindowRealmInfo firstWindowRealmInfo = (WindowRealmInfo) windowRealm;
    assertThat(firstWindowRealmInfo.getBrowsingContext()).isEqualTo(windowId);
  }

  @AfterEach
  public void quitDriver() {
    if (driver != null) {
      driver.quit();
    }
  }
}
