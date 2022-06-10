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

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

import java.util.Arrays;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;

public class VersionTest {

  public static Stream<Arguments> data() {
    return Arrays.asList(new Object[][]{
      // Version 1, Version 2, do they match?, is v1 less then v2?, is v1 greater than v2?
      {"1", "1", true, false, false},
      {"1.0", "1", true, false, false},
      {"1", "1.0", true, false, false},
      {"2", "1", false, false, true},
      {"1", "2", false, true, false},
      {"1.2", "1.50", false, true, false},
      {"2.2", "1.2", false, false, true}
    }).stream().map(Arguments::of);
  }

  @ParameterizedTest
  @MethodSource("data")
  public void shouldMatch(Version first, Version second, boolean match, boolean lessThan, boolean greaterThan) {
    assertThat(first.equalTo(second)).describedAs("%s == %s", first, second).isEqualTo(match);
  }

  @ParameterizedTest
  @MethodSource("data")
  public void shouldImplementLessThan(Version first, Version second, boolean match, boolean lessThan, boolean greaterThan) {
    assertThat(first.isLessThan(second)).describedAs("%s < %s", first, second).isEqualTo(lessThan);
  }

  @ParameterizedTest
  @MethodSource("data")
  public void shouldImplementGreaterThan(Version first, Version second, boolean match, boolean lessThan, boolean greaterThan) {
    assertThat(first.isGreaterThan(second)).describedAs("%s > %s", first, second).isEqualTo(greaterThan);
  }
}
