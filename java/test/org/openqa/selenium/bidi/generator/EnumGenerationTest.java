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

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

/** Enum emission: wire type, strict decoding, and constant naming. */
@Tag("UnitTests")
class EnumGenerationTest {

  @Test
  void integerValuedEnumEmitsLongWireValuesAndDigitSafeConstants() {
    Generated out =
        new Schema()
            .sends("emulation.MediaFeatures")
            .type(
                "emulation.MediaFeatures",
                "{'kind': 'record', 'fields': [{'name': 'grid', 'wire': 'grid', 'required': false,"
                    + " 'type': {'ref': 'emulation.MediaFeaturesGrid', 'nullable': true}}]}")
            .type(
                "emulation.MediaFeaturesGrid",
                "{'kind': 'enum', 'values': [0, 1], 'primitive': 'integer', 'synthetic': true,"
                    + " 'owner': 'emulation.MediaFeatures', 'label': 'Grid'}")
            .generate();

    String src = out.type("emulation.MediaFeatures");
    assertThat(src)
        .contains("public enum Grid {")
        .contains("_0(0L),")
        .contains("_1(1L);")
        .contains("private final Long value;")
        .contains("public static Grid fromJson(Long s) {")
        .contains("private Optional<MediaFeatures.Grid> grid;")
        .contains("map.put(\"grid\", grid.isPresent() ? grid.get().toWireValue() : null);");
    assertThat(out.has("emulation.MediaFeaturesGrid")).isFalse();
  }

  @Test
  void stringValuedEnumEmitsStringWireValuesAndStrictFromJson() {
    Generated out =
        new Schema()
            .receives("browsingContext.ReadinessState")
            .type(
                "browsingContext.ReadinessState",
                "{'kind': 'enum', 'values': ['none', 'interactive', 'complete'],"
                    + " 'primitive': 'string'}")
            .generate();

    assertThat(out.type("browsingContext.ReadinessState"))
        .contains("public enum ReadinessState {")
        .contains("NONE(\"none\"),")
        .contains("COMPLETE(\"complete\");")
        .contains("private final String value;")
        .contains("public static ReadinessState fromJson(String s) {")
        .contains("if (e.value.equals(s)) return e;")
        .contains("throw new BiDiException(\"Unknown ReadinessState value: \" + s);")
        .contains("public Object toWireValue() {");
  }

  @Test
  void enumConstantNamesEscapeLeadingDigitsAndPunctuation() {
    Generated out =
        new Schema()
            .receives("script.SpecialNumber")
            .type(
                "script.SpecialNumber",
                "{'kind': 'enum', 'values': ['NaN', '-0', 'Infinity', '-Infinity'],"
                    + " 'primitive': 'string'}")
            .generate();

    assertThat(out.type("script.SpecialNumber"))
        .contains("NAN(\"NaN\"),")
        .contains("_0(\"-0\"),")
        .contains("INFINITY(\"Infinity\"),")
        .contains("_INFINITY(\"-Infinity\");");
  }
}
