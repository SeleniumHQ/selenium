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
import static org.openqa.selenium.bidi.generator.Fragments.FORCED_COLORS_MODE_THEME;
import static org.openqa.selenium.bidi.generator.Fragments.INTEGER_ALIAS;
import static org.openqa.selenium.bidi.generator.Fragments.JS_INT;
import static org.openqa.selenium.bidi.generator.Fragments.JS_UINT;
import static org.openqa.selenium.bidi.generator.Fragments.SET_FORCED_COLORS_MODE_THEME_OVERRIDE_PARAMETERS;
import static org.openqa.selenium.bidi.generator.Fragments.SET_VIEWPORT_PARAMETERS;
import static org.openqa.selenium.bidi.generator.Fragments.STRING_ALIAS;
import static org.openqa.selenium.bidi.generator.Fragments.VIEWPORT;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

/** Per-field validation: required, nullable, const, inline-union and numeric range checks. */
@Tag("UnitTests")
class FieldValidationTest {

  @Test
  void inlineUnionFieldIsTypedObjectAndValidatedAgainstEveryArm() {
    Generated out =
        new Schema()
            .sends("script.NumberValue")
            .type(
                "script.NumberValue",
                "{'kind': 'record', 'fields': [{'name': 'type', 'wire': 'type', 'required': true,"
                    + " 'type': {'const': 'number'}},{'name': 'value', 'wire': 'value', 'required':"
                    + " true, 'type': {'union': [{'primitive': 'number'}, {'ref':"
                    + " 'script.SpecialNumber'}], 'scalar': 'number'}}]}")
            .type(
                "script.SpecialNumber",
                "{'kind': 'enum', 'values': ['NaN', '-0', 'Infinity', '-Infinity'],"
                    + " 'primitive': 'string'}")
            .generate();

    assertThat(out.type("script.NumberValue"))
        .contains("public NumberValue(String type, Object value) {")
        .contains(
            "if (value != null && !(value instanceof Number || value instanceof SpecialNumber)) {")
        .contains(
            "throw new BiDiException(\"value must be one of its declared union types, got: \" +"
                + " value);")
        .contains("this.value = Objects.requireNonNull(value, \"value is required\");")
        .contains("map.put(\"value\", value);");
  }

  @Test
  void stringConstFieldRejectsAnyOtherValue() {
    Generated out =
        new Schema()
            .sends("script.NumberValue")
            .type(
                "script.NumberValue",
                "{'kind': 'record', 'fields': [{'name': 'type', 'wire': 'type', 'required': true,"
                    + " 'type': {'const': 'number'}}]}")
            .generate();

    assertThat(out.type("script.NumberValue"))
        .contains("private final String type;")
        .contains("if (!Objects.equals(type, \"number\")) {")
        .contains("throw new BiDiException(\"type must be \" + \"number\" + \", got: \" + type);")
        .contains("this.type = Objects.requireNonNull(type, \"type is required\");");
  }

  @Test
  void nullableBooleanConstAcceptsTheLiteralOrNull() {
    Generated out =
        new Schema()
            .sends("browsingContext.SetBypassCSPParameters")
            .type(
                "browsingContext.SetBypassCSPParameters",
                "{'kind': 'record', 'fields': [{'name': 'bypass', 'wire': 'bypass',"
                    + " 'required': true, 'type': {'const': true, 'nullable': true}}]}")
            .generate();

    assertThat(out.type("browsingContext.SetBypassCSPParameters"))
        .contains("public SetBypassCSPParameters(@Nullable Boolean bypass) {")
        .contains("if (bypass != null && !Objects.equals(bypass, true)) {")
        .contains(
            "throw new BiDiException(\"bypass must be \" + true + \" or null, got: \" + bypass);")
        .contains("this.bypass = bypass;")
        .contains("map.put(\"bypass\", bypass);");
  }

  @Test
  void requiredNullableFieldIsAnnotatedAndNullGuardedOnSerialization() {
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
            "public SetForcedColorsModeThemeOverrideParameters(@Nullable ForcedColorsModeTheme"
                + " theme) {")
        .contains("this.theme = theme;")
        .doesNotContain("Objects.requireNonNull(theme")
        .contains("map.put(\"theme\", theme == null ? null : theme.toWireValue());");
  }

  @Test
  void optionalNullableFieldTracksExplicitNullSeparatelyFromAbsence() {
    Generated out =
        new Schema()
            .sends("browsingContext.SetViewportParameters")
            .type("browsingContext.SetViewportParameters", SET_VIEWPORT_PARAMETERS)
            .type("browsingContext.Viewport", VIEWPORT)
            .type("browsingContext.BrowsingContext", STRING_ALIAS)
            .type("js-uint", INTEGER_ALIAS)
            .generate();

    assertThat(out.type("browsingContext.SetViewportParameters"))
        .contains("private Optional<Number> devicePixelRatio;")
        .contains("private boolean devicePixelRatioSet;")
        .contains("this.devicePixelRatioSet = true;")
        .contains("if (devicePixelRatioSet) {")
        .contains(
            "map.put(\"devicePixelRatio\", devicePixelRatio.isPresent() ? devicePixelRatio.get()"
                + " : null);")
        .contains("map.put(\"viewport\", viewport.isPresent() ? viewport.get().toMap() : null);")
        .contains("context.ifPresent(v -> map.put(\"context\", v));")
        .doesNotContain("contextSet");
  }

  @Test
  void jsIntegerAliasesAreRangeChecked() {
    Generated out =
        new Schema()
            .receives("browser.ClientWindowInfo")
            .type(
                "browser.ClientWindowInfo",
                "{'kind': 'record', 'fields': ["
                    + "{'name': 'height', 'wire': 'height', 'required': true,"
                    + " 'type': {'ref': 'js-uint'}},"
                    + "{'name': 'x', 'wire': 'x', 'required': true, 'type': {'ref': 'js-int'}}]}")
            .type("js-uint", JS_UINT)
            .type("js-int", JS_INT)
            .generate();

    assertThat(out.type("browser.ClientWindowInfo"))
        .contains("private final long height;")
        .contains("if (height < 0L || height > 9007199254740991L) {")
        .contains("if (x < -9007199254740991L || x > 9007199254740991L) {")
        .contains(
            "throw new BiDiException(\"x must be >= -9007199254740991 and <= 9007199254740991,"
                + " got: \" + x);");
  }

  @Test
  void optionalJsIntegerIsRangeCheckedInItsSetter() {
    Generated out =
        new Schema()
            .sends("input.PointerMoveAction")
            .type(
                "input.PointerMoveAction",
                "{'kind': 'record', 'fields': [{'name': 'duration', 'wire': 'duration',"
                    + " 'required': false, 'type': {'ref': 'js-uint'}}]}")
            .type("js-uint", JS_UINT)
            .generate();

    assertThat(out.type("input.PointerMoveAction"))
        .contains("public PointerMoveAction setDuration(Long duration) {")
        .contains("if (duration != null && (duration < 0L || duration > 9007199254740991L)) {");
  }

  @Test
  void optionalJsIntegerIsRangeCheckedOnReceipt() {
    Generated out =
        new Schema()
            .receives("network.Initiator")
            .type(
                "network.Initiator",
                "{'kind': 'record', 'fields': [{'name': 'columnNumber', 'wire': 'columnNumber',"
                    + " 'required': false, 'type': {'ref': 'js-uint'}}]}")
            .type("js-uint", JS_UINT)
            .generate();

    assertThat(out.type("network.Initiator"))
        .contains(
            "if (columnNumber != null && columnNumber.isPresent() && (columnNumber.get() < 0L ||"
                + " columnNumber.get() > 9007199254740991L)) {");
  }

  @Test
  void fieldBoundNarrowsItsAliasBound() {
    Generated out =
        new Schema()
            .sends("browsingContext.LocateNodesParameters")
            .type(
                "browsingContext.LocateNodesParameters",
                "{'kind': 'record', 'fields': [{'name': 'maxNodeCount', 'wire': 'maxNodeCount',"
                    + " 'required': false, 'type': {'ref': 'js-uint', 'min': 1}}]}")
            .type("js-uint", JS_UINT)
            .generate();

    assertThat(out.type("browsingContext.LocateNodesParameters"))
        .contains(
            "if (maxNodeCount != null && (maxNodeCount < 1L || maxNodeCount >"
                + " 9007199254740991L)) {")
        .contains(
            "if (maxNodeCount != null && maxNodeCount.isPresent() && (maxNodeCount.get() < 1L ||"
                + " maxNodeCount.get() > 9007199254740991L)) {");
  }

  @Test
  void fieldBoundLooserThanItsAliasBoundDoesNotWidenIt() {
    Generated out =
        new Schema()
            .receives("network.ResponseData")
            .type(
                "network.ResponseData",
                "{'kind': 'record', 'fields': [{'name': 'status', 'wire': 'status',"
                    + " 'required': true, 'type': {'ref': 'js-uint', 'min': -5}}]}")
            .type("js-uint", JS_UINT)
            .generate();

    assertThat(out.type("network.ResponseData"))
        .contains("if (status < 0L || status > 9007199254740991L) {");
  }

  @Test
  void integerWithItsOwnBoundsIsRangeChecked() {
    Generated out =
        new Schema()
            .sends("session.SocksProxyConfiguration")
            .type(
                "session.SocksProxyConfiguration",
                "{'kind': 'record', 'fields': [{'name': 'socksVersion', 'wire': 'socksVersion',"
                    + " 'required': true, 'type': {'primitive': 'integer', 'min': 0, 'max':"
                    + " 255}}]}")
            .generate();

    assertThat(out.type("session.SocksProxyConfiguration"))
        .contains("if (socksVersion < 0L || socksVersion > 255L) {")
        .contains(
            "throw new BiDiException(\"socksVersion must be >= 0 and <= 255, got: \" +"
                + " socksVersion);");
  }

  @Test
  void numberBoundsAreComparedAsDoublesSoNaNFails() {
    Generated out =
        new Schema()
            .sends("emulation.GeolocationCoordinates")
            .type(
                "emulation.GeolocationCoordinates",
                "{'kind': 'record', 'fields': [{'name': 'latitude', 'wire': 'latitude',"
                    + " 'required': true, 'type': {'primitive': 'number', 'min': -90, 'max':"
                    + " 90}}]}")
            .generate();

    assertThat(out.type("emulation.GeolocationCoordinates"))
        .contains(
            "if (latitude != null && !(latitude.doubleValue() >= -90d && latitude.doubleValue()"
                + " <= 90d)) {")
        .contains("this.latitude = Objects.requireNonNull(latitude, \"latitude is required\");");
  }

  @Test
  void exclusiveBoundsUseStrictComparisons() {
    Generated out =
        new Schema()
            .sends("emulation.GeolocationCoordinates")
            .type(
                "emulation.GeolocationCoordinates",
                "{'kind': 'record', 'fields': ["
                    + "{'name': 'heading', 'wire': 'heading', 'required': false, 'type':"
                    + " {'primitive': 'number', 'min': 0, 'max': 360, 'exclusiveMax': true,"
                    + " 'nullable': true}},"
                    + "{'name': 'devicePixelRatio', 'wire': 'devicePixelRatio', 'required': false,"
                    + " 'type': {'primitive': 'number', 'min': 0, 'exclusiveMin': true}}]}")
            .generate();

    assertThat(out.type("emulation.GeolocationCoordinates"))
        .contains("heading.get().doubleValue() >= 0d && heading.get().doubleValue() < 360d")
        .contains("throw new BiDiException(\"heading must be >= 0 and < 360, got: \"")
        .contains("!(devicePixelRatio.get().doubleValue() > 0d)")
        .contains("throw new BiDiException(\"devicePixelRatio must be > 0, got: \"");
  }

  @Test
  void unboundedNumberIsNotRangeChecked() {
    Generated out =
        new Schema()
            .sends("browsingContext.BoxClipRectangle")
            .type(
                "browsingContext.BoxClipRectangle",
                "{'kind': 'record', 'fields': [{'name': 'x', 'wire': 'x', 'required': true,"
                    + " 'type': {'primitive': 'number'}}]}")
            .generate();

    assertThat(out.type("browsingContext.BoxClipRectangle")).doesNotContain("must be");
  }
}
