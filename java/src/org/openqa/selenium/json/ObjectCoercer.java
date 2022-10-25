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

import org.openqa.selenium.internal.Require;

import java.lang.reflect.Type;
import java.util.List;
import java.util.Map;
import java.util.function.BiFunction;

class ObjectCoercer extends TypeCoercer {

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
    return (jsonInput, setting) -> {
      Type target;

      switch (jsonInput.peek()) {
        case BOOLEAN:
          target = Boolean.class;
          break;

        case NAME:
        case STRING:
          target = String.class;
          break;

        case NUMBER:
          target = Number.class;
          break;

        case START_COLLECTION:
          target = List.class;
          break;

        case START_MAP:
          target = Map.class;
          break;

        default:
          throw new JsonException(
              "Object coercer cannot determine proper type: " + jsonInput.peek());
      }

      return coercer.coerce(jsonInput, target, setting);
    };
  }
}
