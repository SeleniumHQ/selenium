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

package org.openqa.selenium.bidi.generator;

import static org.assertj.core.api.Assertions.assertThat;
import static org.openqa.selenium.bidi.generator.Fragments.CLIENT_WINDOW_INFO;
import static org.openqa.selenium.bidi.generator.Fragments.CLOSE_PARAMETERS;
import static org.openqa.selenium.bidi.generator.Fragments.GET_CLIENT_WINDOWS_RESULT;
import static org.openqa.selenium.bidi.generator.Fragments.STRING_ALIAS;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

/** Module class emission: command methods and event constants. */
@Tag("UnitTests")
class ModuleGenerationTest {

  @Test
  void moduleEmitsVoidAndTypedCommandsAndEventConstants() {
    Generated out =
        new Schema()
            .command(
                "{'domain': 'browsingContext', 'method': 'browsingContext.close', 'name': 'close',"
                    + " 'params': {'ref': 'browsingContext.CloseParameters'}, 'result': null}")
            .command(
                "{'domain': 'browser', 'method': 'browser.getClientWindows',"
                    + " 'name': 'getClientWindows', 'params': null,"
                    + " 'result': {'ref': 'browser.GetClientWindowsResult'}}")
            .event(
                "{'domain': 'script', 'method': 'script.realmDestroyed', 'name': 'realmDestroyed',"
                    + " 'params': {'ref': 'script.RealmDestroyedParameters'}}")
            .event(
                "{'domain': 'script', 'method': 'script.realmCreated', 'name': 'realmCreated',"
                    + " 'params': {'ref': 'script.RealmInfo'}}")
            .type("browsingContext.CloseParameters", CLOSE_PARAMETERS)
            .type("browsingContext.BrowsingContext", STRING_ALIAS)
            .type("browser.GetClientWindowsResult", GET_CLIENT_WINDOWS_RESULT)
            .type("browser.ClientWindowInfo", CLIENT_WINDOW_INFO)
            .type(
                "script.RealmDestroyedParameters",
                "{'kind': 'record', 'fields': [{'name': 'realm', 'wire': 'realm',"
                    + " 'required': true, 'type': {'ref': 'script.Realm'}}]}")
            .type(
                "script.RealmInfo",
                "{'kind': 'union', 'variants': ['script.WindowRealmInfo'], 'selector': {'by':"
                    + " 'type', 'variants': [{'value': 'window', 'ref':"
                    + " 'script.WindowRealmInfo'}]}}")
            .type("script.Realm", STRING_ALIAS)
            .generate();

    assertThat(out.module("browsingContext"))
        .contains("public class BrowsingContext extends Module {")
        .contains(
            "public void close(org.openqa.selenium.bidi.protocol.browsingcontext.CloseParameters"
                + " params) {")
        .contains("send(new Command<>(\"browsingContext.close\", params.toMap()));");

    assertThat(out.module("browser"))
        .contains(
            "public org.openqa.selenium.bidi.protocol.browser.GetClientWindowsResult"
                + " getClientWindows() {")
        .contains(
            "return send(new Command<>(\"browser.getClientWindows\","
                + " java.util.Collections.emptyMap(),"
                + " org.openqa.selenium.bidi.protocol.browser.GetClientWindowsResult.class));");

    assertThat(out.module("script"))
        .contains(
            "public static final Event<org.openqa.selenium.bidi.protocol.script"
                + ".RealmDestroyedParameters> REALM_DESTROYED =")
        .contains(
            "new Event<>(\"script.realmDestroyed\", ConverterFunctions.fromMap("
                + "org.openqa.selenium.bidi.protocol.script.RealmDestroyedParameters.class));")
        .contains(
            "public static final Event<org.openqa.selenium.bidi.protocol.script.RealmInfo>"
                + " REALM_CREATED =")
        .contains(
            "new Event<>(\"script.realmCreated\","
                + " org.openqa.selenium.bidi.protocol.script.RealmInfo::fromMap);");
  }

  @Test
  void unionCommandResultIsDecodedThroughFromMap() {
    Generated out =
        new Schema()
            .command(
                "{'domain': 'script', 'method': 'script.evaluate', 'name': 'evaluate',"
                    + " 'params': null, 'result': {'ref': 'script.EvaluateResult'}}")
            .type(
                "script.EvaluateResult",
                "{'kind': 'union', 'variants': ['script.EvaluateResultSuccess'], 'selector':"
                    + " {'by': 'type', 'variants': [{'value': 'success', 'ref':"
                    + " 'script.EvaluateResultSuccess'}]}}")
            .generate();

    assertThat(out.module("script"))
        .contains("public org.openqa.selenium.bidi.protocol.script.EvaluateResult evaluate() {")
        .contains("return org.openqa.selenium.bidi.protocol.script.EvaluateResult.fromMap(m);");
  }
}
