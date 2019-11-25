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

import java.lang.reflect.Type;
import java.math.BigDecimal;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.function.BiFunction;
import java.util.function.Function;

class NumberCoercer<T extends Number> extends TypeCoercer<T> {

  private final static Map<Class<?>, Class<?>> PRIMITIVE_NUMBER_TYPES;
  static {
    Map<Class<?>, Class<?>> builder = new HashMap<>();
    builder.put(byte.class, Byte.class);
    builder.put(double.class, Double.class);
    builder.put(float.class, Float.class);
    builder.put(int.class, Integer.class);
    builder.put(long.class, Long.class);
    builder.put(short.class, Short.class);

    PRIMITIVE_NUMBER_TYPES = Collections.unmodifiableMap(builder);
  }

  private final Class<T> stereotype;
  private final Function<Number, T> mapper;

  NumberCoercer(Class<T> stereotype, Function<Number, T> mapper) {
    this.stereotype = Objects.requireNonNull(stereotype);
    this.mapper = Objects.requireNonNull(mapper);
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
          try {
            number = new BigDecimal(jsonInput.nextString());
          } catch (NumberFormatException e) {
            throw new JsonException(e);
          }
          break;

        default:
          throw new JsonException("Unable to coerce to a number: " + jsonInput.peek());
      }
      return mapper.apply(number);
    };
  }
}
