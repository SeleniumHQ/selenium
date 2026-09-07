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
import java.util.List;
import java.util.Map;
import java.util.function.BiFunction;
import java.util.function.Function;
import org.jspecify.annotations.Nullable;
import org.openqa.selenium.Beta;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.json.JsonException;
import org.openqa.selenium.json.JsonInput;
import org.openqa.selenium.json.JsonType;
import org.openqa.selenium.json.PropertySetting;
import org.openqa.selenium.json.StaticInitializerCoercer;
import org.openqa.selenium.json.TypeCoercer;

@Beta
public class ConverterFunctions {

  /**
   * The shared {@link Json} every generated BiDi type is decoded through, including via {@link
   * #fromMap}. Adds {@code StrictLongCoercer} (rejects a string or fractional value for an integer
   * field) and {@link StaticInitializerCoercer} ahead of {@code EnumCoercer} (so a generated enum's
   * exact-match {@code fromJson} runs, not the case-insensitive default) — both scoped to this
   * instance only.
   */
  public static final Json JSON =
      new Json(List.of(new StrictLongCoercer(), new StaticInitializerCoercer()));

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

  /**
   * A stricter replacement for the shared {@code NumberCoercer<Long>}: that one accepts a JSON
   * string by re-parsing it as a number, and silently truncates a fractional value. Every BiDi
   * "integer" field (e.g. a spec'd js-int/js-uint) is required to hold a value strictly to its
   * declared type inbound — see the low-level behavioral contract ADR — so this rejects both
   * instead. Private: only ever instantiated once, for {@link #JSON} above.
   */
  private static class StrictLongCoercer extends TypeCoercer<Long> {

    @Override
    public boolean test(Class<?> aClass) {
      return Long.class.equals(aClass) || long.class.equals(aClass);
    }

    @Override
    public BiFunction<JsonInput, PropertySetting, Long> apply(Type ignored) {
      return (jsonInput, setting) -> {
        if (jsonInput.peek() != JsonType.NUMBER) {
          throw new JsonException(
              "Expected a JSON number for an integer value, got: " + jsonInput.peek());
        }
        Number number = jsonInput.nextNumber();
        if (number.doubleValue() % 1 != 0) {
          throw new JsonException("Expected an integer, got a fractional value: " + number);
        }
        return number.longValue();
      };
    }
  }
}
