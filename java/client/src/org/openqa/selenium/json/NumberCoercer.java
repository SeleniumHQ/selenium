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
import java.util.Objects;
import java.util.function.BiFunction;
import java.util.function.Function;

class NumberCoercer<T extends Number> extends TypeCoercer<T> {

  private final Class<T> stereotype;
  private final Function<String, T> mapper;

  NumberCoercer(Class<T> stereotype, Function<String, T> mapper) {
    this.stereotype = Objects.requireNonNull(stereotype);
    this.mapper = Objects.requireNonNull(mapper);
  }

  @Override
  public boolean test(Class<?> type) {
    return stereotype.isAssignableFrom(type);
  }

  @Override
  public BiFunction<JsonInput, PropertySetting, T> apply(Type ignored) {
    return (jsonInput, setting) -> {
      JsonType type = jsonInput.peek();

      if (type != JsonType.NUMBER) {
        throw new JsonException(
            "Cannot coerce something that is not a number to a number: " + type);
      }

      String number = jsonInput.nextString();
      return mapper.apply(number);
    };
  }
}
