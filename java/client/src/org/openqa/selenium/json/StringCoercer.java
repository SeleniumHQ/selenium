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
import java.util.function.BiFunction;

public class StringCoercer extends TypeCoercer<String> {

  @Override
  public boolean test(Class<?> type) {
    return CharSequence.class.isAssignableFrom(type);
  }

  @Override
  public BiFunction<JsonInput, PropertySetting, String> apply(Type type) {
    return (jsonInput, setting) -> {
      switch (jsonInput.peek()) {
        case BOOLEAN:
          return String.valueOf(jsonInput.nextBoolean());

        case NAME:
          return jsonInput.nextName();

        case NUMBER:
          return String.valueOf(jsonInput.nextNumber());

        case STRING:
          return jsonInput.nextString();

        default:
          throw new JsonException("Expected value to be a string type: " + jsonInput.peek());
      }
    };
  }
}
