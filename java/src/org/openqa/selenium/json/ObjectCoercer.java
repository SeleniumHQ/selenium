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
import java.util.List;
import java.util.function.BiFunction;
import org.openqa.selenium.internal.Require;

class ObjectCoercer extends TypeCoercer<Object> {

  private final JsonTypeCoercer coercer;

  ObjectCoercer(JsonTypeCoercer coercer) {
    this.coercer = Require.nonNull("Type coercer", coercer);
  }

  @Override
  public boolean test(Class type) {
    return Object.class.equals(type);
  }

  @Override
  public BiFunction<JsonInput, PropertySetting, Object> apply(Type type) {
    // Resolve the possible target coercers once rather than paying a cache lookup per value.
    BiFunction<JsonInput, PropertySetting, Object> booleanCoercer =
        coercer.lazyResolve(Boolean.class);
    BiFunction<JsonInput, PropertySetting, Object> stringCoercer =
        coercer.lazyResolve(String.class);
    BiFunction<JsonInput, PropertySetting, Object> numberCoercer =
        coercer.lazyResolve(Number.class);
    BiFunction<JsonInput, PropertySetting, Object> listCoercer = coercer.lazyResolve(List.class);
    BiFunction<JsonInput, PropertySetting, Object> mapCoercer = coercer.lazyResolve(Json.MAP_TYPE);

    return (jsonInput, setting) -> {
      switch (jsonInput.peek()) {
        case BOOLEAN:
          return booleanCoercer.apply(jsonInput, setting);

        case NAME:
        case STRING:
          return stringCoercer.apply(jsonInput, setting);

        case NUMBER:
          return numberCoercer.apply(jsonInput, setting);

        case START_COLLECTION:
          return listCoercer.apply(jsonInput, setting);

        case START_MAP:
          return mapCoercer.apply(jsonInput, setting);

        default:
          throw new JsonException(
              "Object coercer cannot determine proper type: " + jsonInput.peek());
      }
    };
  }
}
