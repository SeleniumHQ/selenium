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

import static java.lang.System.getProperty;
import static org.assertj.core.api.Assertions.assertThat;

import com.beust.jcommander.JCommander;
import com.beust.jcommander.Parameter;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;

class ConfigTest {

  @Test
  void ensureFirstConfigValueIsChosen() {
    Config config =
        new CompoundConfig(
            new MapConfig(Map.of("section", Map.of("option", "foo"))),
            new MapConfig(Map.of("section", Map.of("option", "bar"))));

    assertThat(config.get("section", "option").get()).isEqualTo("foo");
  }

  @Test
  void shouldReturnEmptyIfConfigValueIsMissing() {
    Config config = new MapConfig();

    assertThat(config.get("section", "option").isPresent()).isFalse();
  }

  @Test
  void shouldReadSystemProperties() {
    Config config =
        new CompoundConfig(
            new MapConfig(), new ConcatenatingConfig("", '.', System.getProperties()));

    assertThat(config.get("user", "home").get()).isEqualTo(getProperty("user.home"));
  }

  @Test
  void shouldReturnAllMatchingOptions() {
    Config config =
        new CompoundConfig(
            new MapConfig(Map.of("section", Map.of("option", "foo"))),
            new MapConfig(Map.of("section", Map.of("cake", "fish"))),
            new MapConfig(Map.of("section", Map.of("option", "bar"))));

    assertThat(config.getAll("cheese", "brie")).isEmpty();
    assertThat(config.getAll("section", "cake")).contains(List.of("fish"));
    assertThat(config.getAll("section", "option")).contains(List.of("foo", "bar"));
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

    assertThat(config.getAll("food", "kinds")).contains(settable.field);
  }

  @Test
  void compoundConfigsCanProperlyInstantiateClassesReferringToOptionsInOtherConfigs() {
    Config config =
        new CompoundConfig(
            new MapConfig(Map.of("cheese", Map.of("taste", "delicious"))),
            new MapConfig(Map.of("cheese", Map.of("name", "cheddar"))),
            new MapConfig(Map.of("cheese", Map.of("scent", "smelly"))));

    String name = config.getClass("foo", "bar", String.class, ReadsConfig.class.getName());

    assertThat(name).isEqualTo("cheddar");
  }

  @Test
  void shouldBeAbleToGetAClassWithDefaultConstructor() {
    Config config =
        new MapConfig(Map.of("foo", Map.of("caps", ImmutableCapabilities.class.getName())));

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
