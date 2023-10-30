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
import static org.openqa.selenium.testing.drivers.Browser.CHROME;
import static org.openqa.selenium.testing.drivers.Browser.EDGE;
import static org.openqa.selenium.testing.drivers.Browser.IE;
import static org.openqa.selenium.testing.drivers.Browser.SAFARI;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.bidi.Script;
import org.openqa.selenium.testing.JupiterTestBase;
import org.openqa.selenium.testing.NotYetImplemented;

public class ScriptCommandsTest extends JupiterTestBase {

  @Test
  @NotYetImplemented(SAFARI)
  @NotYetImplemented(IE)
  @NotYetImplemented(EDGE)
  @NotYetImplemented(CHROME)
  void canCallFunctionWithDeclaration() {
    String id = driver.getWindowHandle();
    Script script = new Script(id, driver);

    EvaluateResult result =
        script.callFunctionInBrowsingContext(
            id, "()=>{return 1+2;}", false, Optional.empty(), Optional.empty(), Optional.empty());

    assertThat(result.getResultType()).isEqualTo(EvaluateResult.EvaluateResultType.SUCCESS);
    assertThat(result.getRealmId()).isNotNull();

    EvaluateResultSuccess successResult = (EvaluateResultSuccess) result;
    assertThat(successResult.getResult().getType()).isEqualTo("number");
    assertThat(successResult.getResult().getValue().isPresent()).isTrue();
    assertThat((Long) successResult.getResult().getValue().get()).isEqualTo(3L);
  }

  @Test
  @NotYetImplemented(SAFARI)
  @NotYetImplemented(IE)
  @NotYetImplemented(EDGE)
  @NotYetImplemented(CHROME)
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

    assertThat(result.getResultType()).isEqualTo(EvaluateResult.EvaluateResultType.SUCCESS);
    assertThat(result.getRealmId()).isNotNull();

    EvaluateResultSuccess successResult = (EvaluateResultSuccess) result;
    assertThat(successResult.getResult().getType()).isEqualTo("array");
    assertThat(successResult.getResult().getValue().isPresent()).isTrue();
    assertThat(((List<Object>) successResult.getResult().getValue().get()).size()).isEqualTo(2);
  }

  @Test
  @NotYetImplemented(SAFARI)
  @NotYetImplemented(IE)
  @NotYetImplemented(EDGE)
  @NotYetImplemented(CHROME)
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

    assertThat(result.getResultType()).isEqualTo(EvaluateResult.EvaluateResultType.SUCCESS);
    assertThat(result.getRealmId()).isNotNull();

    EvaluateResultSuccess successResult = (EvaluateResultSuccess) result;
    assertThat(successResult.getResult().getType()).isEqualTo("string");
    assertThat(successResult.getResult().getValue().isPresent()).isTrue();
    assertThat(((String) successResult.getResult().getValue().get()))
        .isEqualTo("SOME_DELAYED_RESULT");
  }

  @Test
  @NotYetImplemented(SAFARI)
  @NotYetImplemented(IE)
  @NotYetImplemented(EDGE)
  @NotYetImplemented(CHROME)
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

    assertThat(result.getResultType()).isEqualTo(EvaluateResult.EvaluateResultType.SUCCESS);
    assertThat(result.getRealmId()).isNotNull();

    EvaluateResultSuccess successResult = (EvaluateResultSuccess) result;
    assertThat(successResult.getResult().getType()).isEqualTo("promise");
    assertThat(successResult.getResult().getValue().isPresent()).isFalse();
  }

  @Test
  @NotYetImplemented(SAFARI)
  @NotYetImplemented(IE)
  @NotYetImplemented(EDGE)
  @NotYetImplemented(CHROME)
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

    assertThat(result.getResultType()).isEqualTo(EvaluateResult.EvaluateResultType.SUCCESS);
    assertThat(result.getRealmId()).isNotNull();

    EvaluateResultSuccess successResult = (EvaluateResultSuccess) result;
    assertThat(successResult.getResult().getType()).isEqualTo("number");
    assertThat(successResult.getResult().getValue().isPresent()).isTrue();
    assertThat((Long) successResult.getResult().getValue().get()).isEqualTo(42L);
  }

  @Test
  @NotYetImplemented(SAFARI)
  @NotYetImplemented(IE)
  @NotYetImplemented(EDGE)
  @NotYetImplemented(CHROME)
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

    assertThat(result.getResultType()).isEqualTo(EvaluateResult.EvaluateResultType.SUCCESS);
    assertThat(result.getRealmId()).isNotNull();

    EvaluateResultSuccess successResult = (EvaluateResultSuccess) result;
    assertThat(successResult.getResult().getHandle().isPresent()).isTrue();
    assertThat(successResult.getResult().getValue().isPresent()).isTrue();
  }

  @Test
  @NotYetImplemented(SAFARI)
  @NotYetImplemented(IE)
  @NotYetImplemented(EDGE)
  @NotYetImplemented(CHROME)
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

    assertThat(result.getResultType()).isEqualTo(EvaluateResult.EvaluateResultType.SUCCESS);
    assertThat(result.getRealmId()).isNotNull();

    EvaluateResultSuccess successResult = (EvaluateResultSuccess) result;
    assertThat(successResult.getResult().getHandle().isPresent()).isFalse();
    assertThat(successResult.getResult().getValue().isPresent()).isTrue();
  }

  @Test
  @NotYetImplemented(SAFARI)
  @NotYetImplemented(IE)
  @NotYetImplemented(EDGE)
  @NotYetImplemented(CHROME)
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

    assertThat(result.getResultType()).isEqualTo(EvaluateResult.EvaluateResultType.EXCEPTION);
    assertThat(result.getRealmId()).isNotNull();

    EvaluateResultExceptionValue exception = (EvaluateResultExceptionValue) result;
    assertThat(exception.getExceptionDetails().getException().getType()).isEqualTo("error");
    assertThat(exception.getExceptionDetails().getText())
        .isEqualTo("SyntaxError: expected expression, got ')'");
    assertThat(exception.getExceptionDetails().getLineNumber()).isPositive();
    assertThat(exception.getExceptionDetails().getColumnNumber()).isPositive();
    assertThat(exception.getExceptionDetails().getStacktrace().getCallFrames().size()).isEqualTo(0);
  }

  @Test
  @NotYetImplemented(SAFARI)
  @NotYetImplemented(IE)
  @NotYetImplemented(EDGE)
  @NotYetImplemented(CHROME)
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

    assertThat(resultNotInSandbox.getResultType())
        .isEqualTo(EvaluateResult.EvaluateResultType.SUCCESS);

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

    assertThat(resultInSandbox.getResultType())
        .isEqualTo(EvaluateResult.EvaluateResultType.SUCCESS);
    assertThat(resultInSandbox.getRealmId()).isNotNull();

    EvaluateResultSuccess resultInSandboxSuccess = (EvaluateResultSuccess) resultInSandbox;
    assertThat(resultInSandboxSuccess.getResult().getType()).isEqualTo("number");
    assertThat(resultInSandboxSuccess.getResult().getValue().isPresent()).isTrue();
    assertThat((Long) resultInSandboxSuccess.getResult().getValue().get()).isEqualTo(2L);
  }

  @Test
  void canEvaluateScript() {
    String id = driver.getWindowHandle();
    Script script = new Script(id, driver);

    EvaluateResult result =
        script.evaluateFunctionInBrowsingContext(id, "1 + 2", true, Optional.empty());

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
    Script script = new Script(id, driver);

    EvaluateResult result =
        script.evaluateFunctionInBrowsingContext(
            id, "))) !!@@## some invalid JS script (((", false, Optional.empty());

    assertThat(result.getResultType()).isEqualTo(EvaluateResult.EvaluateResultType.EXCEPTION);
    assertThat(result.getRealmId()).isNotNull();

    EvaluateResultExceptionValue exception = (EvaluateResultExceptionValue) result;
    assertThat(exception.getExceptionDetails().getException().getType()).isEqualTo("error");
    assertThat(exception.getExceptionDetails().getText())
        .isEqualTo("SyntaxError: expected expression, got ')'");
    assertThat(exception.getExceptionDetails().getLineNumber()).isPositive();
    assertThat(exception.getExceptionDetails().getColumnNumber()).isPositive();
    assertThat(exception.getExceptionDetails().getStacktrace().getCallFrames().size()).isEqualTo(0);
  }

  @Test
  void canEvaluateScriptWithResulWithOwnership() {
    String id = driver.getWindowHandle();
    Script script = new Script(id, driver);

    EvaluateResult result =
        script.evaluateFunctionInBrowsingContext(
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
    Script script = new Script(id, driver);

    // Make changes without sandbox
    script.evaluateFunctionInBrowsingContext(id, "window.foo = 1", true, Optional.empty());

    // Check changes are not present in the sandbox
    EvaluateResult resultNotInSandbox =
        script.evaluateFunctionInBrowsingContext(
            id, "sandbox", "window.foo", true, Optional.empty());

    assertThat(resultNotInSandbox.getResultType())
        .isEqualTo(EvaluateResult.EvaluateResultType.SUCCESS);

    EvaluateResultSuccess result = (EvaluateResultSuccess) resultNotInSandbox;
    assertThat(result.getResult().getType()).isEqualTo("undefined");

    // Make changes in the sandbox
    script.evaluateFunctionInBrowsingContext(
        id, "sandbox", "window.foo = 2", true, Optional.empty());

    // Check if the changes are present in the sandbox
    EvaluateResult resultInSandbox =
        script.evaluateFunctionInBrowsingContext(
            id, "sandbox", "window.foo", true, Optional.empty());

    assertThat(resultInSandbox.getResultType())
        .isEqualTo(EvaluateResult.EvaluateResultType.SUCCESS);
    assertThat(resultInSandbox.getRealmId()).isNotNull();

    EvaluateResultSuccess resultInSandboxSuccess = (EvaluateResultSuccess) resultInSandbox;
    assertThat(resultInSandboxSuccess.getResult().getType()).isEqualTo("number");
    assertThat(resultInSandboxSuccess.getResult().getValue().isPresent()).isTrue();
    assertThat((Long) resultInSandboxSuccess.getResult().getValue().get()).isEqualTo(2L);
  }

  @Test
  void canDisownHandles() {
    String id = driver.getWindowHandle();
    Script script = new Script(id, driver);

    EvaluateResult evaluateResult =
        script.evaluateFunctionInBrowsingContext(
            id, "({a:1})", false, Optional.of(ResultOwnership.ROOT));

    assertThat(evaluateResult.getResultType()).isEqualTo(EvaluateResult.EvaluateResultType.SUCCESS);
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

    assertThat(evaluateResult.getResultType()).isEqualTo(EvaluateResult.EvaluateResultType.SUCCESS);
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

  @AfterEach
  public void quitDriver() {
    if (driver != null) {
      driver.quit();
    }
  }
}
