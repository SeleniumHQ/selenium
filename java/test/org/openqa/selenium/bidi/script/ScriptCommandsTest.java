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

import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.openqa.selenium.testing.Safely.safelyCall;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.WindowType;
import org.openqa.selenium.bidi.log.ConsoleLogEntry;
import org.openqa.selenium.bidi.log.LogLevel;
import org.openqa.selenium.bidi.module.LogInspector;
import org.openqa.selenium.bidi.module.Script;
import org.openqa.selenium.environment.webserver.AppServer;
import org.openqa.selenium.environment.webserver.NettyAppServer;
import org.openqa.selenium.testing.JupiterTestBase;
import org.openqa.selenium.testing.Pages;

public class ScriptCommandsTest extends JupiterTestBase {
  private AppServer server;

  @BeforeEach
  public void setUp() {
    server = new NettyAppServer();
    server.start();
  }

  @Test
  void canCallFunctionWithDeclaration() {
    String id = driver.getWindowHandle();
    Script script = new Script(id, driver);

    EvaluateResult result =
        script.callFunctionInBrowsingContext(
            id, "()=>{return 1+2;}", false, Optional.empty(), Optional.empty(), Optional.empty());

    assertThat(result.getResultType()).isEqualTo(EvaluateResult.Type.SUCCESS);
    assertThat(result.getRealmId()).isNotNull();

    EvaluateResultSuccess successResult = (EvaluateResultSuccess) result;
    assertThat(successResult.getResult().getType()).isEqualTo("number");
    assertThat(successResult.getResult().getValue().isPresent()).isTrue();
    assertThat((Long) successResult.getResult().getValue().get()).isEqualTo(3L);
  }

  @Test
  void canCallFunctionWithArguments() {
    String id = driver.getWindowHandle();
    Script script = new Script(id, driver);

    List<LocalValue> arguments = new ArrayList<>();
    LocalValue value1 = PrimitiveProtocolValue.stringValue("ARGUMENT_STRING_VALUE");
    LocalValue value2 = PrimitiveProtocolValue.numberValue(42);
    arguments.add(value1);
    arguments.add(value2);

    EvaluateResult result =
        script.callFunctionInBrowsingContext(
            id,
            "(...args)=>{return args}",
            false,
            Optional.of(arguments),
            Optional.empty(),
            Optional.empty());

    assertThat(result.getResultType()).isEqualTo(EvaluateResult.Type.SUCCESS);
    assertThat(result.getRealmId()).isNotNull();

    EvaluateResultSuccess successResult = (EvaluateResultSuccess) result;
    assertThat(successResult.getResult().getType()).isEqualTo("array");
    assertThat(successResult.getResult().getValue().isPresent()).isTrue();
    assertThat(((List<Object>) successResult.getResult().getValue().get()).size()).isEqualTo(2);
  }

  @Test
  void canCallFunctionToGetIFrameBrowsingContext() {
    String url = appServer.whereIs("click_too_big_in_frame.html");
    driver.get(url);

    driver.findElement(By.id("iframe1"));

    String id = driver.getWindowHandle();
    Script script = new Script(id, driver);

    List<LocalValue> arguments = new ArrayList<>();

    EvaluateResult result =
        script.callFunctionInBrowsingContext(
            id,
            "() => document.querySelector('iframe[id=\"iframe1\"]').contentWindow",
            false,
            Optional.of(arguments),
            Optional.empty(),
            Optional.empty());

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

  @Test
  void canCallFunctionToGetElement() {
    String url = appServer.whereIs("/bidi/logEntryAdded.html");
    driver.get(url);

    String id = driver.getWindowHandle();
    Script script = new Script(id, driver);

    List<LocalValue> arguments = new ArrayList<>();

    EvaluateResult result =
        script.callFunctionInBrowsingContext(
            id,
            "() => document.getElementById(\"consoleLog\")",
            false,
            Optional.of(arguments),
            Optional.empty(),
            Optional.empty());

    assertThat(result.getResultType()).isEqualTo(EvaluateResult.Type.SUCCESS);
    assertThat(result.getRealmId()).isNotNull();

    EvaluateResultSuccess successResult = (EvaluateResultSuccess) result;
    assertThat(successResult.getResult().getType()).isEqualTo("node");
    assertThat(successResult.getResult().getValue().isPresent()).isTrue();
    assertThat(((NodeProperties) successResult.getResult().getValue().get()).getNodeType())
        .isNotNull();
  }

  @Test
  void canCallFunctionWithAwaitPromise() {
    String id = driver.getWindowHandle();
    Script script = new Script(id, driver);

    EvaluateResult result =
        script.callFunctionInBrowsingContext(
            id,
            "async function() {{\n"
                + "            await new Promise(r => setTimeout(() => r(), 0));\n"
                + "            return \"SOME_DELAYED_RESULT\";\n"
                + "          }}",
            true,
            Optional.empty(),
            Optional.empty(),
            Optional.empty());

    assertThat(result.getResultType()).isEqualTo(EvaluateResult.Type.SUCCESS);
    assertThat(result.getRealmId()).isNotNull();

    EvaluateResultSuccess successResult = (EvaluateResultSuccess) result;
    assertThat(successResult.getResult().getType()).isEqualTo("string");
    assertThat(successResult.getResult().getValue().isPresent()).isTrue();
    assertThat(((String) successResult.getResult().getValue().get()))
        .isEqualTo("SOME_DELAYED_RESULT");
  }

  @Test
  void canCallFunctionWithAwaitPromiseFalse() {
    String id = driver.getWindowHandle();
    Script script = new Script(id, driver);

    EvaluateResult result =
        script.callFunctionInBrowsingContext(
            id,
            "async function() {{\n"
                + "            await new Promise(r => setTimeout(() => r(), 0));\n"
                + "            return \"SOME_DELAYED_RESULT\";\n"
                + "          }}",
            false,
            Optional.empty(),
            Optional.empty(),
            Optional.empty());

    assertThat(result.getResultType()).isEqualTo(EvaluateResult.Type.SUCCESS);
    assertThat(result.getRealmId()).isNotNull();

    EvaluateResultSuccess successResult = (EvaluateResultSuccess) result;
    assertThat(successResult.getResult().getType()).isEqualTo("promise");
    assertThat(successResult.getResult().getValue().isPresent()).isFalse();
  }

  @Test
  void canCallFunctionWithThisParameter() {
    String id = driver.getWindowHandle();
    Script script = new Script(id, driver);

    Map<Object, LocalValue> value = new HashMap<>();
    value.put("some_property", PrimitiveProtocolValue.numberValue(42));
    LocalValue thisParameter = new ObjectLocalValue(value);

    EvaluateResult result =
        script.callFunctionInBrowsingContext(
            id,
            "function(){return this.some_property}",
            false,
            Optional.empty(),
            Optional.of(thisParameter),
            Optional.empty());

    assertThat(result.getResultType()).isEqualTo(EvaluateResult.Type.SUCCESS);
    assertThat(result.getRealmId()).isNotNull();

    EvaluateResultSuccess successResult = (EvaluateResultSuccess) result;
    assertThat(successResult.getResult().getType()).isEqualTo("number");
    assertThat(successResult.getResult().getValue().isPresent()).isTrue();
    assertThat((Long) successResult.getResult().getValue().get()).isEqualTo(42L);
  }

  @Test
  void canCallFunctionWithOwnershipRoot() {
    String id = driver.getWindowHandle();
    Script script = new Script(id, driver);

    EvaluateResult result =
        script.callFunctionInBrowsingContext(
            id,
            "async function(){return {a:1}}",
            true,
            Optional.empty(),
            Optional.empty(),
            Optional.of(ResultOwnership.ROOT));

    assertThat(result.getResultType()).isEqualTo(EvaluateResult.Type.SUCCESS);
    assertThat(result.getRealmId()).isNotNull();

    EvaluateResultSuccess successResult = (EvaluateResultSuccess) result;
    assertThat(successResult.getResult().getHandle().isPresent()).isTrue();
    assertThat(successResult.getResult().getValue().isPresent()).isTrue();
  }

  @Test
  void canCallFunctionWithOwnershipNone() {
    String id = driver.getWindowHandle();
    Script script = new Script(id, driver);

    EvaluateResult result =
        script.callFunctionInBrowsingContext(
            id,
            "async function(){return {a:1}}",
            true,
            Optional.empty(),
            Optional.empty(),
            Optional.of(ResultOwnership.NONE));

    assertThat(result.getResultType()).isEqualTo(EvaluateResult.Type.SUCCESS);
    assertThat(result.getRealmId()).isNotNull();

    EvaluateResultSuccess successResult = (EvaluateResultSuccess) result;
    assertThat(successResult.getResult().getHandle().isPresent()).isFalse();
    assertThat(successResult.getResult().getValue().isPresent()).isTrue();
  }

  @Test
  void canCallFunctionThatThrowsException() {
    String id = driver.getWindowHandle();
    Script script = new Script(id, driver);

    EvaluateResult result =
        script.callFunctionInBrowsingContext(
            id,
            "))) !!@@## some invalid JS script (((",
            false,
            Optional.empty(),
            Optional.empty(),
            Optional.empty());

    assertThat(result.getResultType()).isEqualTo(EvaluateResult.Type.EXCEPTION);
    assertThat(result.getRealmId()).isNotNull();

    EvaluateResultExceptionValue exception = (EvaluateResultExceptionValue) result;
    assertThat(exception.getExceptionDetails().getException().getType()).isEqualTo("error");
    assertThat(exception.getExceptionDetails().getText()).contains("SyntaxError:");
    assertThat(exception.getExceptionDetails().getLineNumber()).isPositive();
    assertThat(exception.getExceptionDetails().getColumnNumber()).isPositive();
    assertThat(exception.getExceptionDetails().getStacktrace().getCallFrames().size()).isEqualTo(0);
  }

  @Test
  void canCallFunctionInASandBox() {
    String id = driver.getWindowHandle();
    Script script = new Script(id, driver);

    // Make changes without sandbox
    script.callFunctionInBrowsingContext(
        id,
        "() => { window.foo = 1; }",
        true,
        Optional.empty(),
        Optional.empty(),
        Optional.empty());

    // Check changes are not present in the sandbox
    EvaluateResult resultNotInSandbox =
        script.callFunctionInBrowsingContext(
            id,
            "sandbox",
            "() => window.foo",
            true,
            Optional.empty(),
            Optional.empty(),
            Optional.empty());

    assertThat(resultNotInSandbox.getResultType()).isEqualTo(EvaluateResult.Type.SUCCESS);

    EvaluateResultSuccess result = (EvaluateResultSuccess) resultNotInSandbox;
    assertThat(result.getResult().getType()).isEqualTo("undefined");

    // Make changes in the sandbox
    script.callFunctionInBrowsingContext(
        id,
        "sandbox",
        "() => { window.foo = 2; }",
        true,
        Optional.empty(),
        Optional.empty(),
        Optional.empty());

    // Check if the changes are present in the sandbox
    EvaluateResult resultInSandbox =
        script.callFunctionInBrowsingContext(
            id,
            "sandbox",
            "() => window.foo",
            true,
            Optional.empty(),
            Optional.empty(),
            Optional.empty());

    assertThat(resultInSandbox.getResultType()).isEqualTo(EvaluateResult.Type.SUCCESS);
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
    Script script = new Script(firstTab, driver);

    List<RealmInfo> realms = script.getAllRealms();

    String firstTabRealmId = realms.get(0).getRealmId();
    String secondTabRealmId = realms.get(1).getRealmId();

    script.callFunctionInRealm(
        firstTabRealmId,
        "() => { window.foo = 3; }",
        true,
        Optional.empty(),
        Optional.empty(),
        Optional.empty());

    script.callFunctionInRealm(
        secondTabRealmId,
        "() => { window.foo = 5; }",
        true,
        Optional.empty(),
        Optional.empty(),
        Optional.empty());

    EvaluateResult firstContextResult =
        script.callFunctionInRealm(
            firstTabRealmId,
            "() => window.foo",
            true,
            Optional.empty(),
            Optional.empty(),
            Optional.empty());

    assertThat(firstContextResult.getResultType()).isEqualTo(EvaluateResult.Type.SUCCESS);

    EvaluateResultSuccess successFirstContextresult = (EvaluateResultSuccess) firstContextResult;
    assertThat(successFirstContextresult.getResult().getType()).isEqualTo("number");
    assertThat(successFirstContextresult.getResult().getValue().isPresent()).isTrue();
    assertThat((Long) successFirstContextresult.getResult().getValue().get()).isEqualTo(3L);

    EvaluateResult secondContextResult =
        script.callFunctionInRealm(
            secondTabRealmId,
            "() => window.foo",
            true,
            Optional.empty(),
            Optional.empty(),
            Optional.empty());

    assertThat(secondContextResult.getResultType()).isEqualTo(EvaluateResult.Type.SUCCESS);

    EvaluateResultSuccess successSecondContextresult = (EvaluateResultSuccess) secondContextResult;
    assertThat(successSecondContextresult.getResult().getType()).isEqualTo("number");
    assertThat(successSecondContextresult.getResult().getValue().isPresent()).isTrue();
    assertThat((Long) successSecondContextresult.getResult().getValue().get()).isEqualTo(5L);
  }

  @Test
  void canEvaluateScript() {
    String id = driver.getWindowHandle();
    Script script = new Script(id, driver);

    EvaluateResult result =
        script.evaluateFunctionInBrowsingContext(id, "1 + 2", true, Optional.empty());

    assertThat(result.getResultType()).isEqualTo(EvaluateResult.Type.SUCCESS);
    assertThat(result.getRealmId()).isNotNull();

    EvaluateResultSuccess successResult = (EvaluateResultSuccess) result;
    assertThat(successResult.getResult().getType()).isEqualTo("number");
    assertThat(successResult.getResult().getValue().isPresent()).isTrue();
    assertThat((Long) successResult.getResult().getValue().get()).isEqualTo(3L);
  }

  @Test
  void canEvaluateScriptThatThrowsException() {
    String id = driver.getWindowHandle();
    Script script = new Script(id, driver);

    EvaluateResult result =
        script.evaluateFunctionInBrowsingContext(
            id, "))) !!@@## some invalid JS script (((", false, Optional.empty());

    assertThat(result.getResultType()).isEqualTo(EvaluateResult.Type.EXCEPTION);
    assertThat(result.getRealmId()).isNotNull();

    EvaluateResultExceptionValue exception = (EvaluateResultExceptionValue) result;
    assertThat(exception.getExceptionDetails().getException().getType()).isEqualTo("error");
    assertThat(exception.getExceptionDetails().getText()).contains("SyntaxError:");
    assertThat(exception.getExceptionDetails().getLineNumber()).isGreaterThanOrEqualTo(0);
    assertThat(exception.getExceptionDetails().getStacktrace().getCallFrames().size()).isEqualTo(0);
  }

  @Test
  void canEvaluateScriptWithResulWithOwnership() {
    String id = driver.getWindowHandle();
    Script script = new Script(id, driver);

    EvaluateResult result =
        script.evaluateFunctionInBrowsingContext(
            id, "Promise.resolve({a:1})", true, Optional.of(ResultOwnership.ROOT));

    assertThat(result.getResultType()).isEqualTo(EvaluateResult.Type.SUCCESS);
    assertThat(result.getRealmId()).isNotNull();

    EvaluateResultSuccess successResult = (EvaluateResultSuccess) result;
    assertThat(successResult.getResult().getType()).isEqualTo("object");
    assertThat(successResult.getResult().getValue().isPresent()).isTrue();
    assertThat(successResult.getResult().getHandle().isPresent()).isTrue();
  }

  @Test
  void canEvaluateInASandBox() {
    String id = driver.getWindowHandle();
    Script script = new Script(id, driver);

    // Make changes without sandbox
    script.evaluateFunctionInBrowsingContext(id, "window.foo = 1", true, Optional.empty());

    // Check changes are not present in the sandbox
    EvaluateResult resultNotInSandbox =
        script.evaluateFunctionInBrowsingContext(
            id, "sandbox", "window.foo", true, Optional.empty());

    assertThat(resultNotInSandbox.getResultType()).isEqualTo(EvaluateResult.Type.SUCCESS);

    EvaluateResultSuccess result = (EvaluateResultSuccess) resultNotInSandbox;
    assertThat(result.getResult().getType()).isEqualTo("undefined");

    // Make changes in the sandbox
    script.evaluateFunctionInBrowsingContext(
        id, "sandbox", "window.foo = 2", true, Optional.empty());

    // Check if the changes are present in the sandbox
    EvaluateResult resultInSandbox =
        script.evaluateFunctionInBrowsingContext(
            id, "sandbox", "window.foo", true, Optional.empty());

    assertThat(resultInSandbox.getResultType()).isEqualTo(EvaluateResult.Type.SUCCESS);
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
    Script script = new Script(firstTab, driver);

    List<RealmInfo> realms = script.getAllRealms();

    String firstTabRealmId = realms.get(0).getRealmId();
    String secondTabRealmId = realms.get(1).getRealmId();

    script.evaluateFunctionInRealm(firstTabRealmId, "window.foo = 3", true, Optional.empty());

    script.evaluateFunctionInRealm(secondTabRealmId, "window.foo = 5", true, Optional.empty());

    EvaluateResult firstContextResult =
        script.evaluateFunctionInRealm(firstTabRealmId, "window.foo", true, Optional.empty());

    assertThat(firstContextResult.getResultType()).isEqualTo(EvaluateResult.Type.SUCCESS);

    EvaluateResultSuccess successFirstContextresult = (EvaluateResultSuccess) firstContextResult;
    assertThat(successFirstContextresult.getResult().getType()).isEqualTo("number");
    assertThat(successFirstContextresult.getResult().getValue().isPresent()).isTrue();
    assertThat((Long) successFirstContextresult.getResult().getValue().get()).isEqualTo(3L);

    EvaluateResult secondContextResult =
        script.evaluateFunctionInRealm(secondTabRealmId, "window.foo", true, Optional.empty());

    assertThat(secondContextResult.getResultType()).isEqualTo(EvaluateResult.Type.SUCCESS);

    EvaluateResultSuccess successSecondContextresult = (EvaluateResultSuccess) secondContextResult;
    assertThat(successSecondContextresult.getResult().getType()).isEqualTo("number");
    assertThat(successSecondContextresult.getResult().getValue().isPresent()).isTrue();
    assertThat((Long) successSecondContextresult.getResult().getValue().get()).isEqualTo(5L);
  }

  @Test
  void canDisownHandles() {
    String id = driver.getWindowHandle();
    Script script = new Script(id, driver);

    EvaluateResult evaluateResult =
        script.evaluateFunctionInBrowsingContext(
            id, "({a:1})", false, Optional.of(ResultOwnership.ROOT));

    assertThat(evaluateResult.getResultType()).isEqualTo(EvaluateResult.Type.SUCCESS);
    assertThat(evaluateResult.getRealmId()).isNotNull();

    EvaluateResultSuccess successEvaluateResult = (EvaluateResultSuccess) evaluateResult;
    assertThat(successEvaluateResult.getResult().getHandle().isPresent()).isTrue();

    List<LocalValue> arguments = new ArrayList<>();

    Map<Object, RemoteValue> valueMap =
        (Map<Object, RemoteValue>) successEvaluateResult.getResult().getValue().get();

    RemoteValue value = valueMap.get("a");

    AtomicReference<LocalValue> localValue = new AtomicReference<>();
    value.getValue().ifPresent(v -> localValue.set(LocalValue.numberValue((long) v)));

    Map<Object, LocalValue> localValueMap = new HashMap<>();
    localValueMap.put("a", localValue.get());

    LocalValue value1 = LocalValue.objectValue(localValueMap);
    LocalValue value2 =
        LocalValue.remoteReference(
            RemoteReference.Type.HANDLE, successEvaluateResult.getResult().getHandle().get());
    arguments.add(value1);
    arguments.add(value2);

    script.callFunctionInBrowsingContext(
        id, "arg => arg.a", false, Optional.of(arguments), Optional.empty(), Optional.empty());

    assertThat(successEvaluateResult.getResult().getValue().isPresent()).isTrue();

    List<String> handles = new ArrayList<>();
    handles.add(successEvaluateResult.getResult().getHandle().get());
    script.disownBrowsingContextScript(id, handles);

    assertThatExceptionOfType(WebDriverException.class)
        .isThrownBy(
            () ->
                script.callFunctionInBrowsingContext(
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
    Script script = new Script(id, driver);

    EvaluateResult evaluateResult =
        script.evaluateFunctionInBrowsingContext(
            id, "({a:1})", false, Optional.of(ResultOwnership.ROOT));

    assertThat(evaluateResult.getResultType()).isEqualTo(EvaluateResult.Type.SUCCESS);
    assertThat(evaluateResult.getRealmId()).isNotNull();

    EvaluateResultSuccess successEvaluateResult = (EvaluateResultSuccess) evaluateResult;
    assertThat(successEvaluateResult.getResult().getHandle().isPresent()).isTrue();

    List<LocalValue> arguments = new ArrayList<>();

    Map<Object, RemoteValue> valueMap =
        (Map<Object, RemoteValue>) successEvaluateResult.getResult().getValue().get();

    RemoteValue value = valueMap.get("a");

    AtomicReference<LocalValue> localValue = new AtomicReference<>();
    value.getValue().ifPresent(v -> localValue.set(LocalValue.numberValue((long) v)));

    Map<Object, LocalValue> localValueMap = new HashMap<>();
    localValueMap.put("a", localValue.get());

    LocalValue value1 = LocalValue.objectValue(localValueMap);
    LocalValue value2 =
        LocalValue.remoteReference(
            RemoteReference.Type.HANDLE, successEvaluateResult.getResult().getHandle().get());
    arguments.add(value1);
    arguments.add(value2);

    script.callFunctionInBrowsingContext(
        id, "arg => arg.a", false, Optional.of(arguments), Optional.empty(), Optional.empty());

    assertThat(successEvaluateResult.getResult().getValue().isPresent()).isTrue();

    List<String> handles = new ArrayList<>();
    handles.add(successEvaluateResult.getResult().getHandle().get());
    script.disownRealmScript(evaluateResult.getRealmId(), handles);

    assertThatExceptionOfType(WebDriverException.class)
        .isThrownBy(
            () ->
                script.callFunctionInBrowsingContext(
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
    Script script = new Script(firstWindow, driver);
    List<RealmInfo> realms = script.getAllRealms();

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
    Script script = new Script(firstWindow, driver);
    List<RealmInfo> realms = script.getRealmsByType(RealmType.WINDOW);

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

    Script script = new Script(windowId, driver);
    List<RealmInfo> realms = script.getRealmsInBrowsingContext(tabId);

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

    Script script = new Script(windowId, driver);
    List<RealmInfo> windowRealms =
        script.getRealmsInBrowsingContextByType(windowId, RealmType.WINDOW);

    RealmInfo windowRealm = windowRealms.get(0);
    assertThat(windowRealm.getRealmType()).isEqualTo(RealmType.WINDOW);
    assertThat(windowRealm.getRealmId()).isNotNull();

    WindowRealmInfo firstWindowRealmInfo = (WindowRealmInfo) windowRealm;
    assertThat(firstWindowRealmInfo.getBrowsingContext()).isEqualTo(windowId);
  }

  @Test
  void canAddPreloadScript() throws ExecutionException, InterruptedException, TimeoutException {
    Script script = new Script(driver);
    String id = script.addPreloadScript("() => {{ console.log('{preload_script_console_text}') }}");

    assertThat(id).isNotNull();
    assertThat(id).isNotEmpty();

    try (LogInspector logInspector = new LogInspector(driver)) {
      CompletableFuture<ConsoleLogEntry> future = new CompletableFuture<>();
      logInspector.onConsoleEntry(future::complete);

      driver.get(new Pages(server).blankPage);

      ConsoleLogEntry logEntry = future.get(5, TimeUnit.SECONDS);

      assertThat(logEntry.getText()).isEqualTo("{preload_script_console_text}");
      assertThat(logEntry.getLevel()).isEqualTo(LogLevel.INFO);
      assertThat(logEntry.getMethod()).isEqualTo("log");
    }
  }

  @Test
  void canAddPreloadScriptWithArguments() {
    Script script = new Script(driver);
    String id =
        script.addPreloadScript(
            "(channel) => channel('will_be_send', 'will_be_ignored')",
            List.of(new ChannelValue("channel_name")));
    assertThat(id).isNotNull();
    assertThat(id).isNotEmpty();
  }

  @Test
  void canAddPreloadScriptWithChannelOptions() {
    Script script = new Script(driver);
    SerializationOptions serializationOptions = new SerializationOptions();
    serializationOptions.setMaxDomDepth(0);
    String id =
        script.addPreloadScript(
            "(channel) => channel('will_be_send', 'will_be_ignored')",
            List.of(new ChannelValue("channel_name", serializationOptions, ResultOwnership.ROOT)));
    assertThat(id).isNotNull();
    assertThat(id).isNotEmpty();
  }

  @Test
  void canAddPreloadScriptInASandbox() {
    Script script = new Script(driver);
    String id = script.addPreloadScript("() => { window.bar=2; }", "sandbox");
    assertThat(id).isNotNull();
    assertThat(id).isNotEmpty();

    driver.get(new Pages(server).blankPage);

    EvaluateResult result =
        script.evaluateFunctionInBrowsingContext(
            driver.getWindowHandle(), "sandbox", "window.bar", true, Optional.empty());
    assertThat(result.getResultType()).isEqualTo(EvaluateResult.Type.SUCCESS);
    assertThat(((EvaluateResultSuccess) result).getResult().getValue().get()).isEqualTo(2L);
  }

  @Test
  void canRemovePreloadedScript() {
    Script script = new Script(driver.getWindowHandle(), driver);
    String id = script.addPreloadScript("() => { window.bar=2; }");
    assertThat(id).isNotNull();
    assertThat(id).isNotEmpty();

    driver.get(new Pages(server).blankPage);

    EvaluateResult result =
        script.evaluateFunctionInBrowsingContext(
            driver.getWindowHandle(), "window.bar", true, Optional.empty());
    assertThat(result.getResultType()).isEqualTo(EvaluateResult.Type.SUCCESS);
    assertThat(((EvaluateResultSuccess) result).getResult().getValue().get()).isEqualTo(2L);

    script.removePreloadScript(id);

    EvaluateResult resultAfterRemoval =
        script.evaluateFunctionInBrowsingContext(
            driver.getWindowHandle(), "sandbox", "window.bar", true, Optional.empty());
    assertThat(resultAfterRemoval.getResultType()).isEqualTo(EvaluateResult.Type.SUCCESS);
    assertThat(((EvaluateResultSuccess) resultAfterRemoval).getResult().getValue().isPresent())
        .isFalse();
  }

  @AfterEach
  public void quitDriver() {
    if (driver != null) {
      driver.quit();
    }
    safelyCall(server::stop);
  }
}
