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
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.beust.jcommander.Parameter;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.junit.jupiter.api.Test;

class AnnotatedConfigTest {

  @Test
  void shouldAllowConfigsToBeAnnotated() {

    class WithAnnotations {

      @ConfigValue(section = "cheese", name = "type", example = "\"cheddar\"")
      private final String cheese = "brie";
    }

    WithAnnotations obj = new WithAnnotations();
    Config config = new AnnotatedConfig(obj);
    assertThat(config.get("cheese", "type")).contains("brie");
  }

  @Test
  void shouldAllowFieldsToBeSomethingOtherThanStrings() {
    class WithTypes {

      @ConfigValue(section = "types", name = "bool", example = "false")
      private final boolean boolField = true;

      @ConfigValue(section = "types", name = "int", example = "0")
      private final int intField = 42;
    }

    Config config = new AnnotatedConfig(new WithTypes());
    assertThat(config.getBool("types", "bool")).contains(true);
    assertThat(config.getInt("types", "int")).contains(42);
  }

  @Test
  void shouldAllowCollectionTypeFieldsToBeAnnotated() {
    class WithBadAnnotation {

      @ConfigValue(section = "the", name = "collection", example = "[]")
      private final Set<String> cheeses = Set.of("cheddar", "gouda");
    }

    AnnotatedConfig config = new AnnotatedConfig(new WithBadAnnotation());
    List<String> values =
        config
            .getAll("the", "collection")
            .orElseThrow(() -> new AssertionError("No value returned"));

    assertThat(values).containsExactlyInAnyOrder("cheddar", "gouda");
  }

  @Test
  void shouldNotAllowMapTypeFieldsToBeAnnotated() {
    assertThatThrownBy(
            () -> {
              class WithBadAnnotation {

                @ConfigValue(section = "bad", name = "map", example = "")
                private final Map<String, String> cheeses = Map.of("peas", "sausage");
              }

              new AnnotatedConfig(new WithBadAnnotation());
            })
        .isInstanceOf(ConfigException.class)
        .hasMessageStartingWith("Map fields may not be used for configuration");
  }

  @Test
  void shouldWalkInheritanceHierarchy() {
    class Parent {

      @ConfigValue(section = "cheese", name = "type", example = "")
      private final String value = "cheddar";
    }

    class Child extends Parent {}

    Config config = new AnnotatedConfig(new Child());

    assertThat(config.get("cheese", "type")).contains("cheddar");
  }

  @Test
  void configValuesFromChildClassesAreMoreImportant() {
    class Parent {

      @ConfigValue(section = "cheese", name = "type", example = "\"gouda\"")
      private final String value = "cheddar";
    }

    class Child extends Parent {

      @ConfigValue(section = "cheese", name = "type", example = "\"gouda\"")
      private final String cheese = "gorgonzola";
    }

    Config config = new AnnotatedConfig(new Child());

    assertThat(config.get("cheese", "type")).contains("gorgonzola");
  }

  @Test
  void defaultValuesForPrimitivesAreIgnored() {
    // There's no way to tell the difference between the default values and the value having been
    // set to the default. Best not worry about it.
    class Defaults {

      // We leave booleans out --- in order to allow us to differentiate
      // "default value" from "user set value", we need to use `Boolean`
      // instead.
      @ConfigValue(section = "default", name = "bool", example = "")
      private boolean bool;

      @ConfigValue(section = "default", name = "int", example = "")
      private int integer;

      @ConfigValue(section = "default", name = "string", example = "")
      private String string;
    }

    Config config = new AnnotatedConfig(new Defaults());

    assertThat(config.get("default", "bool").isPresent()).isTrue();
    assertThat(config.getBool("default", "bool").isPresent()).isTrue();
    assertThat(config.get("default", "int").isPresent()).isFalse();
    assertThat(config.getInt("default", "int").isPresent()).isFalse();
    assertThat(config.get("default", "string").isPresent()).isFalse();
  }

  @Test
  void shouldUseSetToFilterFields() {
    class TypesToBeFiltered {

      @Parameter(names = {"--bool"})
      @ConfigValue(section = "types", name = "boolean", example = "false")
      private final boolean boolField = true;

      @Parameter(names = {"--string"})
      @ConfigValue(section = "types", name = "string", example = "N/A")
      private final String stringField = "A String";

      @Parameter(names = {"--int"})
      @ConfigValue(section = "types", name = "integer", example = "0")
      private final int intField = 42;
    }

    Config config =
        new AnnotatedConfig(new TypesToBeFiltered(), Set.of("--string", "--bool"), true);
    assertThat(config.getBool("types", "boolean")).contains(true);
    assertThat(config.get("types", "string")).contains("A String");
    assertThat(config.getInt("types", "integer")).isEmpty();
  }
}
