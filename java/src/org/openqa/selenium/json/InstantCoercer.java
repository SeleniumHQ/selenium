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
import java.time.Instant;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.time.temporal.TemporalAccessor;
import java.util.function.BiFunction;
import org.openqa.selenium.internal.Require;

public class InstantCoercer extends TypeCoercer<Instant> {

  private final JsonTypeCoercer typeCoercer;

  InstantCoercer(JsonTypeCoercer typeCoercer) {
    this.typeCoercer = Require.nonNull("TypeCoercer", typeCoercer);
  }

  @Override
  public boolean test(Class<?> aClass) {
    return Instant.class.isAssignableFrom(aClass);
  }

  @Override
  public BiFunction<JsonInput, PropertySetting, Instant> apply(Type type) {
    return (jsonInput, setting) -> {
      JsonType token = jsonInput.peek();

      switch (token) {
        case NUMBER:
          return Instant.ofEpochMilli(jsonInput.nextNumber().longValue());
        case STRING:
          String raw = jsonInput.nextString();
          try {
            TemporalAccessor parsed = DateTimeFormatter.ISO_INSTANT.parse(raw);
            return Instant.from(parsed);
          } catch (DateTimeParseException invalidDateTime) {
            var failure =
                new JsonException(
                    String.format("\"%s\" does not look like an Instant", raw), invalidDateTime);

            // any PropertySetting is okay here, as we know it won't be used
            try (JsonInput nestedInput =
                new JsonInput(new StringReader(raw), typeCoercer, PropertySetting.BY_NAME)) {
              Number number = nestedInput.nextNumber();
              // ensure the 'raw' string has been read to the end
              nestedInput.nextEnd();
              double doubleValue = number.doubleValue();
              if (doubleValue % 1 != 0) {
                throw new JsonException("unexpected decimal value");
              } else if (doubleValue < Long.MIN_VALUE || doubleValue > Long.MAX_VALUE) {
                throw new JsonException("value out of range");
              }
              return Instant.ofEpochMilli(number.longValue());
            } catch (JsonException invalidLong) {
              failure.addSuppressed(
                  new JsonException(
                      String.format("\"%s\" is not a valid timestamp", raw), invalidLong));
            }

            throw failure;
          }
        default:
          throw new JsonException("Unable to parse: " + token + " as Instant");
      }
    };
  }
}
