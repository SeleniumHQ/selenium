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

package org.openqa.selenium.bidi.protocol.script;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.bidi.ConverterFunctions;

@Tag("UnitTests")
class NumberValueTest {

  @Test
  void specialNumbersDeserializeAndSerializeAsTheirWireValues() {
    for (String wire : new String[] {"NaN", "-0", "Infinity", "-Infinity"}) {
      NumberValue value =
          ConverterFunctions.JSON.toType(
              "{\"type\":\"number\",\"value\":\"" + wire + "\"}", NumberValue.class);
      assertThat(value.getValue()).isEqualTo(SpecialNumber.fromJson(wire));
      assertThat(value.toMap()).containsEntry("value", wire);
    }
  }

  @Test
  void enumArgumentsSerializeAsStrings() {
    for (SpecialNumber special : SpecialNumber.values()) {
      assertThat(new NumberValue("number", special).toMap())
          .containsEntry("value", special.toWireValue());
    }
  }

  @Test
  void ordinaryNumbersRetainTheirNumericValue() {
    NumberValue value =
        ConverterFunctions.JSON.toType("{\"type\":\"number\",\"value\":1.5}", NumberValue.class);
    assertThat(value.getValue()).isEqualTo(1.5);
    assertThat(value.toMap()).containsEntry("value", 1.5);
  }

  @Test
  void invalidUnionValuesAreRejected() {
    for (String raw : new String[] {"\"nan\"", "\"bogus\"", "true", "null"}) {
      assertThatThrownBy(
              () ->
                  ConverterFunctions.JSON.toType(
                      "{\"type\":\"number\",\"value\":" + raw + "}", NumberValue.class))
          .isInstanceOf(RuntimeException.class);
    }
  }
}
