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

package org.openqa.selenium.bidi;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.json.JsonException;

@Tag("UnitTests")
class ConverterFunctionsTest {

  // A JSON number with a huge exponent (RFC 8259 places no bound on one) is a tiny wire payload
  // but is always out of Long's range, so StrictLongCoercer always rejects it. The rejection
  // message must stay cheap to build regardless: an implementation that expands the value to its
  // full decimal digit string (BigDecimal#toPlainString()) would blow that budget for large enough
  // exponents, turning a malformed/adversarial number into an OutOfMemoryError instead of an
  // ordinary JsonException. 1e10000 is already far larger than any exponent this rejection path
  // should ever need to render (a 10,000-character string, not a billion-character one) — large
  // enough to fail the length assertion below if the guard regresses, but small enough that a
  // regressed test still finishes instead of exhausting the test JVM's heap.
  @Test
  void rejectingAnExtremeOutOfRangeLongDoesNotExpandItsFullDecimalForm() {
    // toType(String, Type) wraps any JsonException in its own "Unable to parse" JsonException —
    // the rejection this test cares about is that wrapper's cause.
    assertThatThrownBy(() -> ConverterFunctions.JSON.toType("1e10000", Long.class))
        .isInstanceOf(JsonException.class)
        .cause()
        .isInstanceOf(JsonException.class)
        .hasMessageContaining("Long range")
        .satisfies(e -> assertThat(e.getMessage().length()).isLessThan(1000));
  }

  @Test
  void rejectingAnExtremeOutOfRangeNegativeLongDoesNotExpandItsFullDecimalForm() {
    assertThatThrownBy(() -> ConverterFunctions.JSON.toType("-1e10000", Long.class))
        .isInstanceOf(JsonException.class)
        .cause()
        .isInstanceOf(JsonException.class)
        .hasMessageContaining("Long range")
        .satisfies(e -> assertThat(e.getMessage().length()).isLessThan(1000));
  }

  @Test
  void aValueWithinLongRangeIsAcceptedNormally() {
    Long value = ConverterFunctions.JSON.toType("123456789", Long.class);

    assertThat(value).isEqualTo(123456789L);
  }
}
