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
import static org.openqa.selenium.bidi.generator.Fragments.CLOSE_PARAMETERS;
import static org.openqa.selenium.bidi.generator.Fragments.INTEGER_ALIAS;
import static org.openqa.selenium.bidi.generator.Fragments.SET_VIEWPORT_PARAMETERS;
import static org.openqa.selenium.bidi.generator.Fragments.STATUS_RESULT;
import static org.openqa.selenium.bidi.generator.Fragments.STRING_ALIAS;
import static org.openqa.selenium.bidi.generator.Fragments.USER_PROMPT_HANDLER;
import static org.openqa.selenium.bidi.generator.Fragments.USER_PROMPT_HANDLER_TYPE;
import static org.openqa.selenium.bidi.generator.Fragments.VIEWPORT;
import static org.openqa.selenium.bidi.generator.Fragments.WINDOW_REALM_INFO;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

/** Record emission: the class shape each send/receive direction gets. */
@Tag("UnitTests")
class RecordGenerationTest {

  @Test
  void aliasResolvesInlineWithoutAClassOfItsOwn() {
    Generated out =
        new Schema()
            .sends("browsingContext.CloseParameters")
            .type("browsingContext.CloseParameters", CLOSE_PARAMETERS)
            .type("browsingContext.BrowsingContext", STRING_ALIAS)
            .generate();

    assertThat(out.has("browsingContext.BrowsingContext")).isFalse();
    assertThat(out.type("browsingContext.CloseParameters"))
        .contains("private final String context;");
  }

  @Test
  void sentOnlyRecordIsMutableWithFluentSettersAndToMap() {
    Generated out =
        new Schema()
            .sends("browsingContext.CloseParameters")
            .type("browsingContext.CloseParameters", CLOSE_PARAMETERS)
            .type("browsingContext.BrowsingContext", STRING_ALIAS)
            .generate();

    assertThat(out.type("browsingContext.CloseParameters"))
        .contains("public class CloseParameters {")
        .doesNotContain("@WarnOnUnknownFields\n")
        .contains("private Optional<Boolean> promptUnload;")
        .contains("public CloseParameters(String context) {")
        .contains("this.context = Objects.requireNonNull(context, \"context is required\");")
        .contains("this.promptUnload = Optional.empty();")
        .contains("public CloseParameters setPromptUnload(Boolean promptUnload) {")
        .contains("map.put(\"context\", context);")
        .contains("promptUnload.ifPresent(v -> map.put(\"promptUnload\", v));")
        .contains("return Collections.unmodifiableMap(map);")
        .doesNotContain("Builder")
        .doesNotContain("fromJson")
        .doesNotContain("extensions");
  }

  @Test
  void receivedOnlyRecordWithoutOptionalsHasAPublicDeserializationConstructorAndNoToMap() {
    Generated out =
        new Schema()
            .receives("session.StatusResult")
            .type("session.StatusResult", STATUS_RESULT)
            .generate();

    assertThat(out.type("session.StatusResult"))
        .contains("@WarnOnUnknownFields\npublic class StatusResult {")
        .contains("private final boolean ready;")
        .contains("public StatusResult(boolean ready, String message) {")
        .contains("this.ready = ready;")
        .doesNotContain("toMap()");
  }

  @Test
  void receivedOnlyRecordWithOptionalsIsImmutableWithoutSettersOrBuilder() {
    Generated out =
        new Schema()
            .receives("script.WindowRealmInfo")
            .type("script.WindowRealmInfo", WINDOW_REALM_INFO)
            .type("script.Realm", STRING_ALIAS)
            .type("browsingContext.BrowsingContext", STRING_ALIAS)
            .generate();

    assertThat(out.type("script.WindowRealmInfo"))
        .contains("@WarnOnUnknownFields\npublic class WindowRealmInfo {")
        .contains("private final Optional<String> sandbox;")
        .contains(
            "  WindowRealmInfo(String realm, String type, String context, Optional<String>"
                + " sandbox) {")
        .doesNotContain("public WindowRealmInfo(")
        .doesNotContain("public WindowRealmInfo set")
        .doesNotContain("Builder")
        .contains("if (!Objects.equals(type, \"window\")) {")
        .contains("this.realm = Objects.requireNonNull(realm, \"realm is required\");")
        .doesNotContain("extensions")
        .contains("this.sandbox = sandbox != null ? sandbox : Optional.empty();")
        .contains("public Optional<String> getSandbox() {");
  }

  @Test
  void sentAndReceivedRecordIsImmutableWithABuilder() {
    Generated out =
        new Schema()
            .sends("session.UserPromptHandler")
            .receives("session.UserPromptHandler")
            .type("session.UserPromptHandler", USER_PROMPT_HANDLER)
            .type("session.UserPromptHandlerType", USER_PROMPT_HANDLER_TYPE)
            .generate();

    assertThat(out.type("session.UserPromptHandler"))
        .contains("private final Optional<UserPromptHandlerType> alert;")
        .doesNotContain("public UserPromptHandler set")
        .contains("public static Builder builder() {")
        .contains("public static final class Builder {")
        .contains("public Builder setAlert(UserPromptHandlerType alert) {")
        .contains("alert.ifPresent(v -> map.put(\"alert\", v.toWireValue()));");
  }

  @Test
  void builderStatesAnExplicitNullThatTheDeserializerCannot() {
    // No sent-and-received type in the current spec has an optional nullable field, so the real
    // sent-only SetViewportParameters is wired both ways to pin the Builder's override path.
    Generated out =
        new Schema()
            .sends("browsingContext.SetViewportParameters")
            .receives("browsingContext.SetViewportParameters")
            .type("browsingContext.SetViewportParameters", SET_VIEWPORT_PARAMETERS)
            .type("browsingContext.Viewport", VIEWPORT)
            .type("browsingContext.BrowsingContext", STRING_ALIAS)
            .type("js-uint", INTEGER_ALIAS)
            .generate();

    assertThat(out.type("browsingContext.SetViewportParameters"))
        .contains("private final boolean devicePixelRatioSet;")
        .contains("Optional<Boolean> devicePixelRatioSetOverride")
        .contains(
            "this.devicePixelRatioSet = devicePixelRatioSetOverride != null &&"
                + " devicePixelRatioSetOverride.isPresent() ? devicePixelRatioSetOverride.get() :"
                + " this.devicePixelRatio.isPresent();")
        .contains("Optional.of(devicePixelRatioSet)")
        .contains("if (devicePixelRatioSet) {");
  }

  @Test
  void reservedWordFieldIsEscapedButKeepsItsWireKeyViaFromJson() {
    Generated out =
        new Schema()
            .sends("session.UserPromptHandler")
            .receives("session.UserPromptHandler")
            .type("session.UserPromptHandler", USER_PROMPT_HANDLER)
            .type("session.UserPromptHandlerType", USER_PROMPT_HANDLER_TYPE)
            .generate();

    assertThat(out.type("session.UserPromptHandler"))
        .contains("private final Optional<UserPromptHandlerType> default_;")
        .contains("public Builder setDefault_(UserPromptHandlerType default_) {")
        .contains("default_.ifPresent(v -> map.put(\"default\", v.toWireValue()));")
        .contains("private static UserPromptHandler fromJson(Map<String, Object> map) {")
        // The strict mapper, not a lenient new Json(): a received enum or integer must match its
        // declared type exactly rather than be coerced from a near-miss.
        .contains("Json json = ConverterFunctions.JSON;")
        .contains(
            "Optional<UserPromptHandlerType> default_ = json.toType(json.toJson(map.get("
                + "\"default\")), new TypeToken<Optional<UserPromptHandlerType>>() {}.getType());")
        .contains("return new UserPromptHandler(alert, default_);")
        // fromJson bypasses ConstructorCoercer, so the annotation would be inert; the warning is
        // emitted from fromJson itself instead.
        .doesNotContain("@WarnOnUnknownFields\n")
        .contains(
            "org.openqa.selenium.json.UnknownFieldsWarning.warnOnUnknownFields("
                + "UserPromptHandler.class, Set.of(\"alert\", \"default\"), map);");
  }

  @Test
  void unreachableTypesAreNotGenerated() {
    Generated out =
        new Schema()
            .sends("browsingContext.CloseParameters")
            .type("browsingContext.CloseParameters", CLOSE_PARAMETERS)
            .type("browsingContext.BrowsingContext", STRING_ALIAS)
            .type("session.StatusResult", STATUS_RESULT)
            .generate();

    assertThat(out.has("browsingContext.CloseParameters")).isTrue();
    assertThat(out.has("session.StatusResult")).isFalse();
  }
}
