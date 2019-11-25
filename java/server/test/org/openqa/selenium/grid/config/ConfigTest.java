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
import static org.junit.Assert.assertFalse;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;

import com.beust.jcommander.JCommander;
import com.beust.jcommander.Parameter;

import org.junit.Test;

import java.util.List;
import java.util.Optional;

public class ConfigTest {

  @Test
  public void ensureFirstConfigValueIsChosen() {
    Config config = new CompoundConfig(
        new MapConfig(ImmutableMap.of("section", ImmutableMap.of("option", "foo"))),
        new MapConfig(ImmutableMap.of("section", ImmutableMap.of("option", "bar"))));

    assertEquals("foo", config.get("section", "option").get());
  }

  @Test
  public void shouldReturnEmptyIfConfigValueIsMissing() {
    Config config = new MapConfig(ImmutableMap.of());

    assertFalse(config.get("section", "option").isPresent());
  }

  @Test
  public void shouldReadSystemProperties() {
    Config config = new CompoundConfig(
        new MapConfig(ImmutableMap.of()),
        new ConcatenatingConfig("", '.', System.getProperties()));

    assertEquals(System.getProperty("user.home"), config.get("user", "home").get());
  }

  @Test
  public void shouldReturnAllMatchingOptions() {
    Config config = new CompoundConfig(
        new MapConfig(ImmutableMap.of("section", ImmutableMap.of("option", "foo"))),
        new MapConfig(ImmutableMap.of("section", ImmutableMap.of("cake", "fish"))),
        new MapConfig(ImmutableMap.of("section", ImmutableMap.of("option", "bar"))));

    assertEquals(Optional.empty(), config.getAll("cheese", "brie"));
    assertEquals(Optional.of(ImmutableList.of("fish")), config.getAll("section", "cake"));
    assertEquals(Optional.of(ImmutableList.of("foo", "bar")), config.getAll("section", "option"));
  }

  @Test
  public void shouldAllowMultipleValues() {
    class Settable {
      @Parameter(
          names = {"-D"},
          variableArity = true)
      @ConfigValue(section = "food", name = "kinds")
      public List<String> field;
    }

    Settable settable = new Settable();

    JCommander commander = JCommander.newBuilder()
        .addObject(settable)
        .build();

    commander.parse("-D", "peas", "-D", "cheese", "-D", "sausages", "--boo");

    Config config = new AnnotatedConfig(settable);

    assertEquals(Optional.of(settable.field), config.getAll("food", "kinds"));
  }
}
