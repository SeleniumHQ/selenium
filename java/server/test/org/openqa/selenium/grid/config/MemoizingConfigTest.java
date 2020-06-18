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

import static org.junit.Assert.assertEquals;

import com.google.common.collect.ImmutableMap;

import org.junit.BeforeClass;
import org.junit.Test;

import java.util.List;
import java.util.Set;

public class MemoizingConfigTest {

  private static Config config;

  @BeforeClass
  public static void createConfig() {
    config = new MemoizingConfig(new CompoundConfig(
        new MapConfig(ImmutableMap.of("section", ImmutableMap.of("option", "foo"))),
        new MapConfig(ImmutableMap.of("section2", ImmutableMap.of("option", "bar")))));
  }

  @Test
  public void ensureGetSectionNamesWorks() {
    Set<String> expectedSections = Set.of("section", "section2");

    assertEquals(expectedSections, config.getSectionNames());
  }

  @Test
  public void ensureGetOptionWorks() {
    Set<String> expectedOption = Set.of("option");

    assertEquals(expectedOption, config.getOptions("section"));
  }

  @Test
  public void ensureGetAllWorks() {
    List<String> expectedValue = List.of("foo");

    assertEquals(expectedValue, config.getAll("section", "option").get());
  }
}
