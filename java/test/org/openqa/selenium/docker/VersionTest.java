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

package org.openqa.selenium.docker;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Arrays;
import java.util.stream.Stream;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

class VersionTest {

  public static Stream<Arguments> data() {
    return Arrays.stream(
            new Object[][] {
              // Version 1, Version 2, do they match?, is v1 less than v2?, is v1 greater than v2?
              {"1", "1", true, false, false},
              {"1.0", "1", true, false, false},
              {"1", "1.0", true, false, false},
              {"2", "1", false, false, true},
              {"1", "2", false, true, false},
              {"1.2", "1.50", false, true, false},
              {"2.2", "1.2", false, false, true},
              {"1.2.3", "1.2.3.4", false, true, false},
              {"1.2.4", "1.2.3.4", false, false, true},
              {
                "1.2.4444444444444444444444444",
                "1.2.3.4444444444444444444444444",
                false,
                false,
                true
              }, // large

              // versions with non-digits
              {"1.2.beta", "1.2.beta", true, false, false}, // equals to itself
              {"1.2.alpha", "1.2.beta", false, true, false}, // 1.2.alpha < 1.2.beta
              {"1.2.3.alpha", "1.2.beta", false, false, true}, // 1.2.beta < 1.2.3.alpha
              {"1.2.3.alpha", "1.2.3", false, true, false} // 1.2.3.alpha < 1.2.3
            })
        .map(Arguments::of);
  }

  @ParameterizedTest
  @MethodSource("data")
  void shouldMatch(
      Version first, Version second, boolean equals, boolean lessThan, boolean greaterThan) {
    assertThat(first.equalTo(second)).describedAs("%s == %s", first, second).isEqualTo(equals);
    assertThat(second.equalTo(first)).describedAs("%s == %s", second, first).isEqualTo(equals);
  }

  @ParameterizedTest
  @MethodSource("data")
  void shouldImplementLessThan(
      Version first, Version second, boolean equals, boolean lessThan, boolean greaterThan) {
    assertThat(first.isLessThan(second)).describedAs("%s < %s", first, second).isEqualTo(lessThan);
    assertThat(second.isLessThan(first))
        .describedAs("%s < %s", second, first)
        .isEqualTo(!equals && !lessThan);
  }

  @ParameterizedTest
  @MethodSource("data")
  void shouldImplementGreaterThan(
      Version first, Version second, boolean equals, boolean lessThan, boolean greaterThan) {
    assertThat(first.isGreaterThan(second))
        .describedAs("%s > %s", first, second)
        .isEqualTo(greaterThan);
    assertThat(second.isGreaterThan(first))
        .describedAs("%s > %s", second, first)
        .isEqualTo(!equals && !greaterThan);
  }

  @Test
  void toStringShowsVersion() {
    assertThat(new Version("1.2.3")).hasToString("1.2.3");
    assertThat(new Version("a.b.c.d")).hasToString("a.b.c.d");
  }
}
