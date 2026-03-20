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
import static org.assertj.core.api.InstanceOfAssertFactories.MAP;

import java.util.List;
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
    PrintOptions printOptions =
        new PrintOptions().setBackground(true).setScale(1.5).setShrinkToFit(false);

    assertThat(printOptions.getScale()).isEqualTo(1.5);
    assertThat(printOptions.getBackground()).isTrue();
    assertThat(printOptions.getShrinkToFit()).isFalse();
  }

  @Test
  void setsPageRanges() {
    PrintOptions printOptions = new PrintOptions();

    printOptions.setPageRanges(List.of("1-2", "6-7"));
    assertThat(printOptions.getPageRanges()).containsExactly("1-2", "6-7");
  }

  @Test
  void toMapContainsProperKey() {
    PrintOptions printOptions = new PrintOptions();

    printOptions.setPageRanges("1-2");

    Map<String, Object> map = printOptions.toMap();
    assertThat(map).hasSize(7);
    assertThat(map)
        .containsOnlyKeys(
            "page", "orientation", "scale", "shrinkToFit", "background", "pageRanges", "margin");
    assertThat(map.get("margin"))
        .asInstanceOf(MAP)
        .containsOnlyKeys("top", "left", "bottom", "right");
    assertThat(map.get("page")).asInstanceOf(MAP).containsOnlyKeys("width", "height");
  }
}
