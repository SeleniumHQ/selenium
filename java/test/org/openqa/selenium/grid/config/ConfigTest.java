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

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

import com.beust.jcommander.JCommander;
import com.beust.jcommander.Parameter;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;

class ConfigTest {

  @Test
  void ensureFirstConfigValueIsChosen() {
    Config config =
        new CompoundConfig(
            new MapConfig(ImmutableMap.of("section", ImmutableMap.of("option", "foo"))),
            new MapConfig(ImmutableMap.of("section", ImmutableMap.of("option", "bar"))));

    assertEquals("foo", config.get("section", "option").get());
  }

  @Test
  void shouldReturnEmptyIfConfigValueIsMissing() {
    Config config = new MapConfig(ImmutableMap.of());

    assertFalse(config.get("section", "option").isPresent());
  }

  @Test
  void shouldReadSystemProperties() {
    Config config =
        new CompoundConfig(
            new MapConfig(ImmutableMap.of()),
            new ConcatenatingConfig("", '.', System.getProperties()));

    assertEquals(System.getProperty("user.home"), config.get("user", "home").get());
  }

  @Test
  void shouldReturnAllMatchingOptions() {
    Config config =
        new CompoundConfig(
            new MapConfig(ImmutableMap.of("section", ImmutableMap.of("option", "foo"))),
            new MapConfig(ImmutableMap.of("section", ImmutableMap.of("cake", "fish"))),
            new MapConfig(ImmutableMap.of("section", ImmutableMap.of("option", "bar"))));

    assertEquals(Optional.empty(), config.getAll("cheese", "brie"));
    assertEquals(Optional.of(ImmutableList.of("fish")), config.getAll("section", "cake"));
    assertEquals(Optional.of(ImmutableList.of("foo", "bar")), config.getAll("section", "option"));
  }

  @Test
  void shouldAllowMultipleValues() {
    class Settable {
      @Parameter(
          names = {"-D"},
          variableArity = true)
      @ConfigValue(section = "food", name = "kinds", example = "[]")
      public List<String> field;
    }

    Settable settable = new Settable();

    JCommander commander = JCommander.newBuilder().addObject(settable).build();

    commander.parse("-D", "peas", "-D", "cheese", "-D", "sausages", "--boo");

    Config config = new AnnotatedConfig(settable);

    assertEquals(Optional.of(settable.field), config.getAll("food", "kinds"));
  }

  @Test
  void compoundConfigsCanProperlyInstantiateClassesReferringToOptionsInOtherConfigs() {
    Config config =
        new CompoundConfig(
            new MapConfig(ImmutableMap.of("cheese", ImmutableMap.of("taste", "delicious"))),
            new MapConfig(ImmutableMap.of("cheese", ImmutableMap.of("name", "cheddar"))),
            new MapConfig(ImmutableMap.of("cheese", ImmutableMap.of("scent", "smelly"))));

    String name = config.getClass("foo", "bar", String.class, ReadsConfig.class.getName());

    assertThat(name).isEqualTo("cheddar");
  }

  @Test
  void shouldBeAbleToGetAClassWithDefaultConstructor() {
    Config config =
        new MapConfig(
            ImmutableMap.of("foo", ImmutableMap.of("caps", ImmutableCapabilities.class.getName())));

    Capabilities caps =
        config.getClass("foo", "caps", Capabilities.class, ImmutableCapabilities.class.getName());

    assertThat(caps).isInstanceOf(ImmutableCapabilities.class);
  }

  public static class ReadsConfig {
    public static String create(Config config) {
      return config.get("cheese", "name").orElse("no cheese");
    }
  }
}
