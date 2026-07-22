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

package org.openqa.selenium.bidi.protocol.module;

import static org.assertj.core.api.Assertions.assertThat;
import static org.openqa.selenium.testing.drivers.Browser.CHROME;
import static org.openqa.selenium.testing.drivers.Browser.EDGE;
import static org.openqa.selenium.testing.drivers.Browser.FIREFOX;

import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.bidi.protocol.script.AddPreloadScriptParameters;
import org.openqa.selenium.bidi.protocol.script.AddPreloadScriptResult;
import org.openqa.selenium.bidi.protocol.script.ArrayRemoteValue;
import org.openqa.selenium.bidi.protocol.script.CallFunctionParameters;
import org.openqa.selenium.bidi.protocol.script.ChannelProperties;
import org.openqa.selenium.bidi.protocol.script.ChannelValue;
import org.openqa.selenium.bidi.protocol.script.ContextTarget;
import org.openqa.selenium.bidi.protocol.script.EvaluateParameters;
import org.openqa.selenium.bidi.protocol.script.EvaluateResult;
import org.openqa.selenium.bidi.protocol.script.EvaluateResultException;
import org.openqa.selenium.bidi.protocol.script.EvaluateResultSuccess;
import org.openqa.selenium.bidi.protocol.script.GetRealmsParameters;
import org.openqa.selenium.bidi.protocol.script.GetRealmsResult;
import org.openqa.selenium.bidi.protocol.script.MessageParameters;
import org.openqa.selenium.bidi.protocol.script.NumberValue;
import org.openqa.selenium.bidi.protocol.script.RealmDestroyedParameters;
import org.openqa.selenium.bidi.protocol.script.RealmInfo;
import org.openqa.selenium.bidi.protocol.script.RemoteValue;
import org.openqa.selenium.bidi.protocol.script.RemovePreloadScriptParameters;
import org.openqa.selenium.bidi.protocol.script.StringValue;
import org.openqa.selenium.bidi.protocol.script.WindowRealmInfo;
import org.openqa.selenium.testing.JupiterTestBase;
import org.openqa.selenium.testing.NeedsFreshDriver;
import org.openqa.selenium.testing.NotYetImplemented;
import org.openqa.selenium.testing.Pages;

class ScriptModuleTest extends JupiterTestBase {

  @Test
  @NeedsFreshDriver
  void canCallFunctionWithDeclaration() {
    Script script = new Script(driver);
    ContextTarget target = new ContextTarget(driver.getWindowHandle());

    EvaluateResult result =
        script.callFunction(new CallFunctionParameters("()=>{return 1+2;}", false, target));

    assertThat(result).isInstanceOf(EvaluateResultSuccess.class);
    EvaluateResultSuccess success = (EvaluateResultSuccess) result;
    assertThat(success.getRealm()).isNotNull();
    assertThat(success.getResult()).isInstanceOf(NumberValue.class);
    assertThat(((NumberValue) success.getResult()).getValue()).isEqualTo(3L);
  }

  @Test
  @NeedsFreshDriver
  void canCallFunctionWithArguments() {
    Script script = new Script(driver);
    ContextTarget target = new ContextTarget(driver.getWindowHandle());

    EvaluateResult result =
        script.callFunction(
            new CallFunctionParameters("(...args)=>{return args}", false, target)
                .setArguments(
                    List.of(
                        new StringValue("string", "ARGUMENT_STRING_VALUE"),
                        new NumberValue("number", 42L))));

    assertThat(result).isInstanceOf(EvaluateResultSuccess.class);
    EvaluateResultSuccess success = (EvaluateResultSuccess) result;
    assertThat(success.getResult()).isInstanceOf(ArrayRemoteValue.class);
    List<RemoteValue> args = ((ArrayRemoteValue) success.getResult()).getValue().orElseThrow();
    assertThat(args).hasSize(2);
    assertThat(((StringValue) args.get(0)).getValue()).isEqualTo("ARGUMENT_STRING_VALUE");
    assertThat(((NumberValue) args.get(1)).getValue()).isEqualTo(42L);
  }

  @Test
  @NeedsFreshDriver
  void canCallFunctionWithAwaitPromise() {
    Script script = new Script(driver);
    ContextTarget target = new ContextTarget(driver.getWindowHandle());

    EvaluateResult result =
        script.callFunction(
            new CallFunctionParameters(
                "async function() {"
                    + "  await new Promise(r => setTimeout(() => r(), 0));"
                    + "  return \"SOME_DELAYED_RESULT\";"
                    + "}",
                true,
                target));

    assertThat(result).isInstanceOf(EvaluateResultSuccess.class);
    EvaluateResultSuccess success = (EvaluateResultSuccess) result;
    assertThat(success.getResult()).isInstanceOf(StringValue.class);
    assertThat(((StringValue) success.getResult()).getValue()).isEqualTo("SOME_DELAYED_RESULT");
  }

  @Test
  @NeedsFreshDriver
  void canCallFunctionThatThrowsException() {
    Script script = new Script(driver);
    ContextTarget target = new ContextTarget(driver.getWindowHandle());

    EvaluateResult result =
        script.callFunction(
            new CallFunctionParameters(")))!!@@## some invalid JS script (((", false, target));

    assertThat(result).isInstanceOf(EvaluateResultException.class);
    EvaluateResultException exception = (EvaluateResultException) result;
    assertThat(exception.getRealm()).isNotNull();
    assertThat(exception.getExceptionDetails().getException()).isInstanceOf(RemoteValue.class);
    assertThat(exception.getExceptionDetails().getText()).contains("SyntaxError");
    assertThat(exception.getExceptionDetails().getLineNumber()).isPositive();
    assertThat(exception.getExceptionDetails().getColumnNumber()).isPositive();
  }

  @Test
  @NeedsFreshDriver
  void canEvaluateScript() {
    Script script = new Script(driver);
    ContextTarget target = new ContextTarget(driver.getWindowHandle());

    EvaluateResult result = script.evaluate(new EvaluateParameters("1 + 2", target, true));

    assertThat(result).isInstanceOf(EvaluateResultSuccess.class);
    EvaluateResultSuccess success = (EvaluateResultSuccess) result;
    assertThat(success.getResult()).isInstanceOf(NumberValue.class);
    assertThat(((NumberValue) success.getResult()).getValue()).isEqualTo(3L);
  }

  @Test
  @NeedsFreshDriver
  void canGetRealms() {
    Script script = new Script(driver);

    GetRealmsResult result = script.getRealms(new GetRealmsParameters());

    assertThat(result.getRealms()).isNotEmpty();
    assertThat(result.getRealms().get(0)).isInstanceOf(WindowRealmInfo.class);
  }

  @Test
  @NeedsFreshDriver
  void canAddAndRemovePreloadScript() {
    Script script = new Script(driver);

    AddPreloadScriptResult addResult =
        script.addPreloadScript(new AddPreloadScriptParameters("() => {}"));
    assertThat(addResult.getScript()).isNotNull();

    script.removePreloadScript(new RemovePreloadScriptParameters(addResult.getScript()));
  }

  @Test
  @NeedsFreshDriver
  void canListenToChannelMessage() throws Exception {
    Script script = new Script(driver);
    CompletableFuture<MessageParameters> future = new CompletableFuture<>();
    script.subscribe(Script.MESSAGE, future::complete);

    script.callFunction(
        new CallFunctionParameters(
                "(channel) => channel('foo')", false, new ContextTarget(driver.getWindowHandle()))
            .setArguments(
                List.of(new ChannelValue("channel", new ChannelProperties("channel_name")))));

    MessageParameters message = future.get(5, TimeUnit.SECONDS);
    assertThat(message.getChannel()).isEqualTo("channel_name");
    assertThat(message.getData()).isInstanceOf(StringValue.class);
    assertThat(((StringValue) message.getData()).getValue()).isEqualTo("foo");
    assertThat(message.getSource().getRealm()).isNotNull();
    assertThat(message.getSource().getContext()).contains(driver.getWindowHandle());
  }

  @Test
  @NeedsFreshDriver
  void canListenToRealmCreatedEvent() throws Exception {
    Script script = new Script(driver);
    CompletableFuture<RealmInfo> future = new CompletableFuture<>();
    script.subscribe(Script.REALM_CREATED, future::complete);

    driver.get(new Pages(appServer).blankPage);

    RealmInfo realmInfo = future.get(5, TimeUnit.SECONDS);
    assertThat(realmInfo).isInstanceOf(WindowRealmInfo.class);
    assertThat(((WindowRealmInfo) realmInfo).getRealm()).isNotNull();
    assertThat(((WindowRealmInfo) realmInfo).getType()).isEqualTo("window");
  }

  @Test
  @NeedsFreshDriver
  @NotYetImplemented(CHROME)
  @NotYetImplemented(EDGE)
  @NotYetImplemented(FIREFOX)
  void canListenToRealmDestroyedEvent() throws Exception {
    Script script = new Script(driver);
    CompletableFuture<RealmDestroyedParameters> future = new CompletableFuture<>();
    script.subscribe(Script.REALM_DESTROYED, future::complete);

    driver.close();

    RealmDestroyedParameters realmDestroyed = future.get(5, TimeUnit.SECONDS);
    assertThat(realmDestroyed.getRealm()).isNotNull();
  }
}
