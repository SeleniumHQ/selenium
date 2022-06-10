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

import com.beust.jcommander.Parameter;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class AnnotatedConfigTest {

  @Test
  public void shouldAllowConfigsToBeAnnotated() {

    class WithAnnotations {

      @ConfigValue(section = "cheese", name = "type", example = "\"cheddar\"")
      private final String cheese = "brie";
    }

    WithAnnotations obj = new WithAnnotations();
    Config config = new AnnotatedConfig(obj);
    assertEquals(Optional.of("brie"), config.get("cheese", "type"));

  }

  @Test
  public void shouldAllowFieldsToBeSomethingOtherThanStrings() {
    class WithTypes {

      @ConfigValue(section = "types", name = "bool", example = "false")
      private final boolean boolField = true;
      @ConfigValue(section = "types", name = "int", example = "0")
      private final int intField = 42;
    }

    Config config = new AnnotatedConfig(new WithTypes());
    assertEquals(Optional.of(true), config.getBool("types", "bool"));
    assertEquals(Optional.of(42), config.getInt("types", "int"));
  }

  @Test
  public void shouldAllowCollectionTypeFieldsToBeAnnotated() {
    class WithBadAnnotation {

      @ConfigValue(section = "the", name = "collection", example = "[]")
      private final Set<String> cheeses = ImmutableSet.of("cheddar", "gouda");
    }

    AnnotatedConfig config = new AnnotatedConfig(new WithBadAnnotation());
    List<String> values = config.getAll("the", "collection")
      .orElseThrow(() -> new AssertionError("No value returned"));

    assertEquals(2, values.size());
    assertTrue(values.contains("cheddar"));
    assertTrue(values.contains("gouda"));
  }

  @Test
  public void shouldNotAllowMapTypeFieldsToBeAnnotated() {
    assertThrows(ConfigException.class, () -> {
      class WithBadAnnotation {

        @ConfigValue(section = "bad", name = "map", example = "")
        private final Map<String, String> cheeses = ImmutableMap.of("peas", "sausage");
      }

      new AnnotatedConfig(new WithBadAnnotation());
    });
  }

  @Test
  public void shouldWalkInheritanceHierarchy() {
    class Parent {

      @ConfigValue(section = "cheese", name = "type", example = "")
      private final String value = "cheddar";
    }

    class Child extends Parent {

    }

    Config config = new AnnotatedConfig(new Child());

    assertEquals(Optional.of("cheddar"), config.get("cheese", "type"));
  }

  @Test
  public void configValuesFromChildClassesAreMoreImportant() {
    class Parent {

      @ConfigValue(section = "cheese", name = "type", example = "\"gouda\"")
      private final String value = "cheddar";
    }

    class Child extends Parent {

      @ConfigValue(section = "cheese", name = "type", example = "\"gouda\"")
      private final String cheese = "gorgonzola";
    }

    Config config = new AnnotatedConfig(new Child());

    assertEquals(Optional.of("gorgonzola"), config.get("cheese", "type"));
  }

  @Test
  public void defaultValuesForPrimitivesAreIgnored() {
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

    assertTrue(config.get("default", "bool").isPresent());
    assertTrue(config.getBool("default", "bool").isPresent());
    assertFalse(config.get("default", "int").isPresent());
    assertFalse(config.getInt("default", "int").isPresent());
    assertFalse(config.get("default", "string").isPresent());
  }

  @Test
  public void shouldUseSetToFilterFields() {
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

    Config config = new AnnotatedConfig(
      new TypesToBeFiltered(),
      ImmutableSet.of("--string", "--bool"),
      true);
    assertEquals(Optional.of(true), config.getBool("types", "boolean"));
    assertEquals(Optional.of("A String"), config.get("types", "string"));
    assertEquals(Optional.empty(), config.getInt("types", "integer"));
  }
}
