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

package org.openqa.selenium.json;

import static org.assertj.core.api.Assertions.assertThat;
import static org.openqa.selenium.json.PropertySetting.BY_NAME;

import java.io.StringReader;
import java.util.Random;
import org.junit.jupiter.api.Test;

/**
 * The decimal parser takes a fast path for values whose significand fits exactly in a double; these
 * tests pin its results bit-for-bit to {@link Double#parseDouble}.
 */
class NumberParsingTest {

  @Test
  void readsDoubleEdgeCasesBitForBitIdenticalToTheJdk() {
    String[] edges = {
      "0.0",
      "-0.0",
      "0.5",
      "0.1",
      "0.3",
      "2.5",
      "123.456",
      "-123.456",
      "1e22",
      "1E22",
      "1e-22",
      "-1e22",
      "1e23",
      "1e-23",
      "999999999999999.9",
      "9007199254740992.0",
      "9007199254740993.0",
      "0.000001",
      "0.000000000000001234",
      "1234567890.12345",
      "31.875",
      "1e0",
      "0.0e0",
      "5e-1",
      "1.7976931348623157e308",
      "4.9e-324",
      "2.2250738585072011e-308",
      "2.2250738585072014e-308",
      "1e-325",
      "3.141592653589793",
      "2.718281828459045",
      "1.7976931348623157e307"
    };

    for (String raw : edges) {
      assertParsesIdentically(raw);
    }
  }

  @Test
  void readsRandomisedDoublesBitForBitIdenticalToTheJdk() {
    Random random = new Random(42);

    // Doubles of varying magnitude, rendered by the JDK itself.
    for (int i = 0; i < 20_000; i++) {
      double scale = Math.pow(10, random.nextInt(40) - 20);
      assertParsesIdentically(Double.toString(random.nextDouble() * scale));
    }

    // Adversarial decimal strings: random significand lengths, fraction points, and exponents.
    for (int i = 0; i < 20_000; i++) {
      StringBuilder raw = new StringBuilder();
      if (random.nextBoolean()) {
        raw.append('-');
      }
      int intDigits = random.nextInt(19) + 1;
      raw.append(random.nextInt(9) + 1);
      for (int d = 1; d < intDigits; d++) {
        raw.append(random.nextInt(10));
      }
      boolean hasFraction = random.nextBoolean();
      if (hasFraction) {
        raw.append('.');
        int fractionDigits = random.nextInt(19) + 1;
        for (int d = 0; d < fractionDigits; d++) {
          raw.append(random.nextInt(10));
        }
      }
      if (!hasFraction || random.nextBoolean()) {
        raw.append(random.nextBoolean() ? 'e' : 'E');
        if (random.nextBoolean()) {
          raw.append(random.nextBoolean() ? '+' : '-');
        }
        raw.append(random.nextInt(40));
      }
      assertParsesIdentically(raw.toString());
    }
  }

  private void assertParsesIdentically(String raw) {
    Number parsed;
    try (JsonInput input = new JsonInput(new StringReader(raw), new JsonTypeCoercer(), BY_NAME)) {
      parsed = input.nextNumber();
    }

    assertThat(parsed).isInstanceOf(Double.class);
    double expected = Double.parseDouble(raw);
    assertThat(Double.doubleToLongBits((Double) parsed))
        .as("parsing %s (expected %s, got %s)", raw, expected, parsed)
        .isEqualTo(Double.doubleToLongBits(expected));
  }
}
