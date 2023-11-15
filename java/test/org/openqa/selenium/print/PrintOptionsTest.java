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

package org.openqa.selenium.print;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Map;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

@Tag("UnitTests")
class PrintOptionsTest {

  @Test
  void setsDefaultValues() {
    PrintOptions printOptions = new PrintOptions();

    assertThat(printOptions.getScale()).isEqualTo(1.0);
    assertThat(printOptions.getBackground()).isFalse();
    assertThat(printOptions.getShrinkToFit()).isTrue();
  }

  @Test
  void setsValuesAsPassed() {
    PrintOptions printOptions = new PrintOptions();

    printOptions.setBackground(true);
    printOptions.setScale(1.5);
    printOptions.setShrinkToFit(false);

    assertThat(printOptions.getScale()).isEqualTo(1.5);
    assertThat(printOptions.getBackground()).isTrue();
    assertThat(printOptions.getShrinkToFit()).isFalse();
  }

  @Test
  void toMapContainsProperKey() {
    PrintOptions printOptions = new PrintOptions();

    printOptions.setPageRanges("1-2");

    Map<String, Object> map = printOptions.toMap();
    assertThat(map.size()).isEqualTo(7);
    assertThat(map.containsKey("page")).isTrue();
    assertThat(map.containsKey("orientation")).isTrue();
    assertThat(map.containsKey("scale")).isTrue();
    assertThat(map.containsKey("shrinkToFit")).isTrue();
    assertThat(map.containsKey("background")).isTrue();
    assertThat(map.containsKey("pageRanges")).isTrue();
    assertThat(map.containsKey("margin")).isTrue();
  }
}
