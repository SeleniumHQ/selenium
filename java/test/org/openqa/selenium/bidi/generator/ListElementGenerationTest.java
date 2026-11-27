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

package org.openqa.selenium.bidi.generator;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.lang.reflect.InvocationTargetException;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.bidi.ConverterFunctions;

@Tag("UnitTests")
class ListElementGenerationTest {
  @Test
  void explicitlyNullableElementsAreAcceptedInBothDirections() {
    schema("{'list': {'primitive': 'string', 'nullable': true}}")
        .generate(
            loader -> {
              try {
                Class<?> type = loader.loadClass("org.openqa.selenium.bidi.protocol.x.Values");
                Object parsed = ConverterFunctions.JSON.toType("{\"values\":[\"a\",null]}", type);
                assertThat(type.getMethod("getValues").invoke(parsed))
                    .isEqualTo(Arrays.asList("a", null));
                Object sent = type.getConstructor(List.class).newInstance(Arrays.asList("a", null));
                assertThat(type.getMethod("toMap").invoke(sent))
                    .isEqualTo(Map.of("values", Arrays.asList("a", null)));
              } catch (ReflectiveOperationException e) {
                throw new AssertionError(e);
              }
            });
  }

  @Test
  void nullableListDoesNotMakeItsElementsNullable() {
    schema("{'list': {'primitive': 'string'}, 'nullable': true}")
        .generate(
            loader -> {
              try {
                Class<?> type = loader.loadClass("org.openqa.selenium.bidi.protocol.x.Values");
                Object parsed = ConverterFunctions.JSON.toType("{\"values\":null}", type);
                assertThat(type.getMethod("getValues").invoke(parsed)).isNull();
                assertThatThrownBy(
                        () -> ConverterFunctions.JSON.toType("{\"values\":[null]}", type))
                    .isInstanceOf(RuntimeException.class);
                assertThatThrownBy(
                        () -> type.getConstructor(List.class).newInstance(Arrays.asList("a", null)))
                    .isInstanceOf(InvocationTargetException.class);
              } catch (ReflectiveOperationException e) {
                throw new AssertionError(e);
              }
            });
  }

  @Test
  void nullableUnionElementsAreAcceptedAndOtherElementsAreStillValidated() {
    schema(
            "{'list': {'union': [{'primitive': 'integer'}, {'primitive': 'string'}], 'nullable':"
                + " true}}")
        .generate(
            loader -> {
              try {
                Class<?> type = loader.loadClass("org.openqa.selenium.bidi.protocol.x.Values");
                Object parsed =
                    ConverterFunctions.JSON.toType("{\"values\":[5.0,null,\"x\"]}", type);
                assertThat(type.getMethod("getValues").invoke(parsed))
                    .isEqualTo(Arrays.asList(5L, null, "x"));
                Object sent =
                    type.getConstructor(List.class).newInstance(Arrays.asList(5.0, null, "x"));
                assertThat(type.getMethod("toMap").invoke(sent))
                    .isEqualTo(Map.of("values", Arrays.asList(5.0, null, "x")));
                assertThatThrownBy(
                        () -> ConverterFunctions.JSON.toType("{\"values\":[true]}", type))
                    .isInstanceOf(RuntimeException.class);
              } catch (ReflectiveOperationException e) {
                throw new AssertionError(e);
              }
            });
  }

  @Test
  void numericUnionArmsRetainSeparateNarrowedAliasBounds() {
    schema(
            "{'list': {'union': [{'ref': 'x.Small', 'min': 2, 'exclusiveMin': true},"
                + " {'primitive': 'integer', 'min': 20, 'max': 30}]}}")
        .type("x.Small", "{'kind': 'alias', 'type': {'primitive': 'integer', 'min': 1, 'max': 9}}")
        .generate(
            loader -> {
              try {
                Class<?> type = loader.loadClass("org.openqa.selenium.bidi.protocol.x.Values");
                for (int number : new int[] {3, 9, 20, 30}) {
                  Object parsed =
                      ConverterFunctions.JSON.toType("{\"values\":[" + number + "]}", type);
                  assertThat(type.getMethod("getValues").invoke(parsed))
                      .isEqualTo(List.of((long) number));
                }
                for (int number : new int[] {1, 2, 10, 19, 31}) {
                  assertThatThrownBy(
                          () ->
                              ConverterFunctions.JSON.toType("{\"values\":[" + number + "]}", type))
                      .isInstanceOf(RuntimeException.class);
                  assertThatThrownBy(
                          () -> type.getConstructor(List.class).newInstance(List.of((long) number)))
                      .isInstanceOf(InvocationTargetException.class);
                }
              } catch (ReflectiveOperationException e) {
                throw new AssertionError(e);
              }
            });
  }

  private Schema schema(String type) {
    return new Schema()
        .sends("x.Values")
        .receives("x.Values")
        .type(
            "x.Values",
            "{'kind': 'record', 'fields': [{'name': 'values', 'wire': 'values',"
                + " 'required': true, 'type': "
                + type
                + "}]}");
  }
}
