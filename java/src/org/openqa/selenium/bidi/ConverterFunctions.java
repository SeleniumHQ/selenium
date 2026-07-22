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

package org.openqa.selenium.bidi;

import java.io.StringReader;
import java.lang.reflect.Type;
import java.util.Map;
import java.util.function.Function;
import org.jspecify.annotations.Nullable;
import org.openqa.selenium.Beta;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.json.JsonInput;

@Beta
public class ConverterFunctions {

  private static final Json JSON = new Json();

  private ConverterFunctions() {
    throw new IllegalStateException("Utility class");
  }

  /**
   * Returns a function that deserializes a {@code Map<String, Object>} event payload into an
   * instance of {@code type} via the Selenium JSON library (ConstructorCoercer).
   *
   * @param type the class to deserialize the map into
   * @param <T> the deserialized type
   * @return a function that converts a raw event payload into an instance of {@code type}
   */
  public static <T> Function<Map<String, Object>, T> fromMap(Class<T> type) {
    Require.nonNull("Type", type);
    return map -> {
      String json = JSON.toJson(map);
      try (StringReader reader = new StringReader(json);
          JsonInput input = JSON.newInput(reader)) {
        return input.readNonNull(type);
      }
    };
  }

  public static <X> Function<JsonInput, @Nullable X> map(final String keyName, Type typeOfX) {
    Require.nonNull("Key name", keyName);
    Require.nonNull("Type to convert to", typeOfX);

    return input -> {
      X value = null;

      input.beginObject();
      while (input.hasNext()) {
        String name = input.nextName();
        if (keyName.equals(name)) {
          value = input.read(typeOfX);
        } else {
          input.skipValue();
        }
      }
      input.endObject();

      return value;
    };
  }
}
