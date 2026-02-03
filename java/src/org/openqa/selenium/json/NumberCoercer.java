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

package org.openqa.selenium.json;

import java.io.StringReader;
import java.lang.reflect.Type;
import java.util.Map;
import java.util.function.BiFunction;
import java.util.function.Function;
import org.openqa.selenium.internal.Require;

class NumberCoercer<T extends Number> extends TypeCoercer<T> {

  private static final Map<Class<?>, Class<?>> PRIMITIVE_NUMBER_TYPES;

  static {
    PRIMITIVE_NUMBER_TYPES =
        Map.ofEntries(
            Map.entry(byte.class, Byte.class),
            Map.entry(double.class, Double.class),
            Map.entry(float.class, Float.class),
            Map.entry(int.class, Integer.class),
            Map.entry(long.class, Long.class),
            Map.entry(short.class, Short.class));
  }

  private final JsonTypeCoercer typeCoercer;
  private final Class<T> stereotype;
  private final Function<Number, T> mapper;

  NumberCoercer(JsonTypeCoercer typeCoercer, Class<T> stereotype, Function<Number, T> mapper) {
    this.typeCoercer = Require.nonNull("TypeCoercer", typeCoercer);
    this.stereotype = Require.nonNull("Stereotype", stereotype);
    this.mapper = Require.nonNull("Mapper", mapper);
  }

  @Override
  public boolean test(Class<?> type) {
    return stereotype.isAssignableFrom(PRIMITIVE_NUMBER_TYPES.getOrDefault(type, type));
  }

  @Override
  public BiFunction<JsonInput, PropertySetting, T> apply(Type ignored) {
    return (jsonInput, setting) -> {
      Number number;
      switch (jsonInput.peek()) {
        case NUMBER:
          number = jsonInput.nextNumber();
          break;

        case STRING:
          String numberAsString = jsonInput.nextString();
          // any PropertySetting is okay here, as we know it won't be used
          try (JsonInput nestedInput =
              new JsonInput(new StringReader(numberAsString), typeCoercer, setting)) {
            number = nestedInput.nextNumber();
            // ensure the 'numberAsString' string has been read to the end
            nestedInput.nextEnd();
          } catch (JsonException e) {
            throw new JsonException(
                String.format("Not a numeric value: \"%s\"", numberAsString), e);
          }
          break;

        default:
          throw new JsonException("Unable to coerce to a number: " + jsonInput.peek());
      }
      return mapper.apply(number);
    };
  }
}
