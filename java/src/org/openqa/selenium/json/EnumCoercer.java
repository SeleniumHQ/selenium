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

import static org.openqa.selenium.json.Types.narrow;

import java.lang.reflect.Type;
import java.util.function.BiFunction;

public class EnumCoercer<T extends Enum> extends TypeCoercer<T> {

  @Override
  public boolean test(Class<?> aClass) {
    return aClass.isEnum();
  }

  @Override
  public BiFunction<JsonInput, PropertySetting, T> apply(Type type) {
    Class<?> aClass = narrow(type);
    if (!aClass.isEnum()) {
      throw new JsonException("Type was not an enum: " + type);
    }

    return (jsonInput, setting) -> {
      String value = jsonInput.nextString();

      for (Object constant : aClass.getEnumConstants()) {
        if (constant.toString().equalsIgnoreCase(value)) {
          //noinspection unchecked
          return (T) constant;
        }
      }

      throw new JsonException(
          String.format("Unable to find matching enum value for %s in %s", value, aClass));
    };
  }
}
