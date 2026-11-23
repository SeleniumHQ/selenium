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
import static org.openqa.selenium.bidi.generator.Fragments.FORCED_COLORS_MODE_THEME;
import static org.openqa.selenium.bidi.generator.Fragments.GET_CLIENT_WINDOWS_RESULT;
import static org.openqa.selenium.bidi.generator.Fragments.INTEGER_ALIAS;
import static org.openqa.selenium.bidi.generator.Fragments.NODE_PROPERTIES;
import static org.openqa.selenium.bidi.generator.Fragments.NODE_PROPERTIES_ATTRIBUTES;
import static org.openqa.selenium.bidi.generator.Fragments.SET_FORCED_COLORS_MODE_THEME_OVERRIDE_PARAMETERS;
import static org.openqa.selenium.bidi.generator.Fragments.STRING_ALIAS;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

/** List and map emission: element conversion, null rejection, and immutable copies. */
@Tag("UnitTests")
class CollectionGenerationTest {

  @Test
  void listSerializationRejectsNullElementsBeforeConvertingThem() {
    Generated out =
        new Schema()
            .sends("input.PerformActionsParameters")
            .type(
                "input.PerformActionsParameters",
                "{'kind': 'record', 'fields': ["
                    + "{'name': 'context', 'wire': 'context', 'required': true,"
                    + " 'type': {'ref': 'browsingContext.BrowsingContext'}},"
                    + "{'name': 'actions', 'wire': 'actions', 'required': true,"
                    + " 'type': {'list': {'ref': 'input.SourceActions'}}}]}")
            .type(
                "input.SourceActions",
                "{'kind': 'union', 'variants': ['input.NoneSourceActions',"
                    + " 'input.KeySourceActions'], 'selector': {'by': 'type', 'variants': ["
                    + "{'value': 'none', 'ref': 'input.NoneSourceActions'},"
                    + "{'value': 'key', 'ref': 'input.KeySourceActions'}]}}")
            .type("browsingContext.BrowsingContext", STRING_ALIAS)
            .type(
                "input.NoneSourceActions",
                "{'kind': 'record', 'fields': [{'name': 'type', 'wire': 'type', 'required': true,"
                    + " 'type': {'const': 'none'}}]}")
            .type(
                "input.KeySourceActions",
                "{'kind': 'record', 'fields': [{'name': 'type', 'wire': 'type', 'required': true,"
                    + " 'type': {'const': 'key'}}]}")
            .generate();

    assertThat(out.type("input.PerformActionsParameters"))
        .contains("private final java.util.List<SourceActions> actions;")
        .contains(
            "map.put(\"actions\", actions.stream().map(e -> java.util.Objects.requireNonNull(e,"
                + " \"actions element must not be null\").toMap())"
                + ".collect(java.util.stream.Collectors.toList()));");
  }

  @Test
  void listOfAliasedPrimitivesStillRejectsNullElements() {
    Generated out =
        new Schema()
            .sends("emulation.SetForcedColorsModeThemeOverrideParameters")
            .type(
                "emulation.SetForcedColorsModeThemeOverrideParameters",
                SET_FORCED_COLORS_MODE_THEME_OVERRIDE_PARAMETERS)
            .type("emulation.ForcedColorsModeTheme", FORCED_COLORS_MODE_THEME)
            .type("browser.UserContext", STRING_ALIAS)
            .generate();

    assertThat(out.type("emulation.SetForcedColorsModeThemeOverrideParameters"))
        .contains(
            "userContexts.ifPresent(v -> map.put(\"userContexts\", v.stream().map(e ->"
                + " java.util.Objects.requireNonNull(e, \"userContexts element must not be"
                + " null\")).collect(java.util.stream.Collectors.toList())));");
  }

  @Test
  void receivedListFieldIsCopiedIntoAnUnmodifiableList() {
    Generated out =
        new Schema()
            .receives("browser.GetClientWindowsResult")
            .type("browser.GetClientWindowsResult", GET_CLIENT_WINDOWS_RESULT)
            .type("browser.ClientWindowInfo", CLIENT_WINDOW_INFO)
            .generate();

    assertThat(out.type("browser.GetClientWindowsResult"))
        .contains("private final java.util.List<ClientWindowInfo> clientWindows;")
        .contains(
            "this.clientWindows = java.util.Collections.unmodifiableList(new java.util.ArrayList<>("
                + "Objects.requireNonNull(clientWindows, \"clientWindows is required\")));");
  }

  @Test
  void fieldlessSyntheticMapRecordIsInlinedAsAMapInsteadOfAnEmptyClass() {
    Generated out =
        new Schema()
            .receives("script.NodeProperties")
            .type("script.NodeProperties", NODE_PROPERTIES)
            .type("script.NodePropertiesAttributes", NODE_PROPERTIES_ATTRIBUTES)
            .type("js-uint", INTEGER_ALIAS)
            .generate();

    assertThat(out.type("script.NodeProperties"))
        .doesNotContain("class Attributes")
        .contains("private final Optional<java.util.Map<String, String>> attributes;")
        .contains(
            "this.attributes = attributesValue.map(v -> java.util.Collections.unmodifiableMap("
                + "new java.util.LinkedHashMap<>(v)));");
  }

  @Test
  void mapValuedFieldSerializesEachValueAndRejectsNulls() {
    // No sent type in the current spec carries a map field, so the real received Attributes map
    // is wired as sent here to pin the serialization branch.
    Generated out =
        new Schema()
            .sends("script.NodeProperties")
            .type("script.NodeProperties", NODE_PROPERTIES)
            .type("script.NodePropertiesAttributes", NODE_PROPERTIES_ATTRIBUTES)
            .type("js-uint", INTEGER_ALIAS)
            .generate();

    assertThat(out.type("script.NodeProperties"))
        .contains(
            "attributes.ifPresent(v -> map.put(\"attributes\", v.entrySet().stream()"
                + ".collect(java.util.stream.Collectors.toMap(java.util.Map.Entry::getKey,"
                + " e -> java.util.Objects.requireNonNull(e.getValue(), \"attributes value must"
                + " not be null\"), (a, b) -> b, java.util.LinkedHashMap::new))));");
  }
}
