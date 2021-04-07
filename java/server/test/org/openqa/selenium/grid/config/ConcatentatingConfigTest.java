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

package org.openqa.selenium.grid.config;

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;
import org.junit.Test;

import static org.assertj.core.api.Assertions.assertThat;

public class ConcatentatingConfigTest {

  @Test
  public void shouldReturnSectionNames() {
    Config config = new ConcatenatingConfig(
      "FOO",
      '_',
      ImmutableMap.of(
        "FOO_CHEESE_SELECTED", "brie",
        "FOO_CHEESE_CURRENT", "cheddar",
        "FOO_VEGETABLES_GREEN", "peas",
        "FOO_", "should not show up",
        "BAR_FOOD_IS", "cheese sticks"));

    assertThat(config.getSectionNames()).isEqualTo(ImmutableSet.of("cheese", "vegetables"));
  }

  @Test
  public void shouldReturnOptionNamesInSection() {
    Config config = new ConcatenatingConfig(
      "FOO",
      '_',
      ImmutableMap.of(
        "FOO_CHEESE_SELECTED", "brie",
        "FOO_CHEESE_CURRENT", "cheddar",
        "FOO_VEGETABLES_GREEN", "peas",
        "FOO_", "should not show up",
        "BAR_FOOD_IS", "cheese sticks"));

    assertThat(config.getOptions("cheese")).isEqualTo(ImmutableSet.of("current", "selected"));
  }

}
