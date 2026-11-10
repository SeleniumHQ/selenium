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

import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.util.Optional;
import java.util.function.BiFunction;

class OptionalCoercer extends TypeCoercer<Optional<?>> {

  private final JsonTypeCoercer coercer;

  OptionalCoercer(JsonTypeCoercer coercer) {
    this.coercer = coercer;
  }

  @Override
  public boolean test(Class<?> aClass) {
    return Optional.class.equals(aClass);
  }

  @Override
  public BiFunction<JsonInput, PropertySetting, Optional<?>> apply(Type type) {
    Type valueType = Object.class;

    if (type instanceof ParameterizedType) {
      valueType = ((ParameterizedType) type).getActualTypeArguments()[0];
    } else if (!(type instanceof Class)) {
      throw new IllegalArgumentException("Unhandled type: " + type.getClass());
    }

    Type finalValueType = valueType;
    return (jsonInput, setting) -> {
      if (jsonInput.peek() == JsonType.NULL) {
        jsonInput.nextNull();
        return Optional.empty();
      }

      return Optional.ofNullable(coercer.coerce(jsonInput, finalValueType, setting));
    };
  }
}
