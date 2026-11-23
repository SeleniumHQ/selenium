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

import java.lang.reflect.Type;
import java.util.List;
import java.util.Map;
import java.util.function.BiFunction;
import java.util.function.Function;
import org.jetbrains.annotations.ApiStatus;
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
@ApiStatus.Internal
public class ConverterFunctions {

  /**
   * The shared {@link Json} every generated BiDi type is decoded through, including via {@link
   * #fromMap} and — through {@link Command}'s {@code Type}-based constructor — every plain command
   * result too, so a command and an event never disagree on how strictly to accept the same wire
   * shape. Adds {@code StrictLongCoercer}/{@code StrictStringCoercer}/{@code StrictNumberCoercer}
   * (each rejects a value of the wrong JSON type for a String/integer/number field, instead of
   * silently converting it — e.g. a numeric {@code url} or a quoted {@code timeOrigin}) and {@link
   * StaticInitializerCoercer} ahead of {@code EnumCoercer} (so a generated enum's exact-match
   * {@code fromJson} runs, not the case-insensitive default) — all scoped to this instance only.
   */
  public static final Json JSON =
      new Json(
          List.of(
              new StrictLongCoercer(),
              new StrictStringCoercer(),
              new StrictNumberCoercer(),
              new StaticInitializerCoercer()));

  private ConverterFunctions() {
    throw new IllegalStateException("Utility class");
  }

  /**
   * Build a {@link Command} result mapper for the common case where the useful value is a single
   * field of the response's {@code result} object.
   *
   * <p>The returned function is applied to a command's {@code result} value, which {@link
   * org.openqa.selenium.bidi.Connection} has already parsed into a {@code Map<String, Object>}. It
   * reads {@code keyName} from that map and deserializes it to {@code typeOfX} via {@link
   * Json#convert(Object, Type)}, without re-parsing any JSON text. Both the {@code result} and the
   * field are required: a missing {@code result} or a {@code null}/absent field is an error.
   *
   * @param keyName the field to read from the command's {@code result} object
   * @param typeOfX the type to deserialize that field to (class or {@link
   *     org.openqa.selenium.json.TypeToken})
   */
  public static <X> Function<@Nullable Object, X> map(String keyName, Type typeOfX) {
    Require.nonNull("Key name", keyName);
    Require.nonNull("Type to convert to", typeOfX);

    return result -> {
      Object value = ((Map<?, ?>) Require.nonNull("Command result", result)).get(keyName);
      return Require.nonNull("Field '" + keyName + "'", JSON.convert(value, typeOfX));
    };
  }

  /**
   * Returns a function that deserializes a {@code Map<String, Object>} event payload (or a nested
   * union variant, already parsed into a map) into an instance of {@code type} via {@link
   * Json#convert(Object, Type)} — the same single-round-trip primitive {@link #map(String, Type)}
   * uses, rather than a second hand-rolled {@code toJson}/{@code JsonInput} pair.
   */
  public static <T> Function<Map<String, Object>, T> fromMap(Class<T> type) {
    Require.nonNull("Type", type);
    return map -> Require.nonNull("Value", JSON.convert(map, type));
  }

  /**
   * A stricter replacement for the shared {@code NumberCoercer<Long>}: that one accepts a JSON
   * string by re-parsing it as a number, and silently truncates a fractional value. Every BiDi
   * "integer" field (e.g. a spec'd js-int/js-uint) is required to hold a value strictly to its
   * declared type inbound — see the low-level behavioral contract ADR — so this rejects both
   * instead.
   *
   * <p>Uses {@link JsonInput#nextExactNumber()}, not {@link JsonInput#nextNumber()}: the latter
   * converts any decimal/exponent-form lexeme to a {@code double} before this coercer ever sees it,
   * and {@code double} cannot exactly represent every {@code long} (its mantissa is only 53 bits) —
   * a huge decimal-form integer like {@code 9007199254740993.0} would silently round, and an
   * out-of-range exponent-form value like {@code 1e20} would silently saturate to {@code
   * Long.MAX_VALUE} via {@code doubleValue()}/{@code longValue()} instead of being rejected. {@link
   * java.math.BigDecimal#longValueExact()} on the untouched lexeme has neither problem: it throws
   * for any fractional remainder and for any value outside {@code long}'s range, with no
   * intermediate {@code double}. Private: only ever instantiated once, for {@link #JSON} above.
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
        java.math.BigDecimal exact = jsonInput.nextExactNumber();
        try {
          return exact.longValueExact();
        } catch (ArithmeticException e) {
          // Not toPlainString(): an out-of-range value can carry a huge exponent (e.g. 1e999999999
          // — a 12-byte, otherwise-valid JSON number lexeme), and toPlainString() expands that to
          // its full decimal digit count, an allocation large enough to OOM the JVM on input this
          // small. toString() falls back to scientific notation once the exponent is large, so its
          // size tracks the value's precision (digit count), not its magnitude.
          throw new JsonException(
              "Expected an integer within the Long range, got: " + exact.toString(), e);
        }
      };
    }
  }

  /**
   * A stricter replacement for the shared {@code StringCoercer}: that one accepts a JSON boolean or
   * number and silently stringifies it. A spec'd BiDi "text" field (e.g. {@code url}) is required
   * to hold a value strictly to its declared type inbound — see the low-level behavioral contract
   * ADR — so this rejects anything but a JSON string instead.
   *
   * <p>A JSON object's own property key ({@link JsonType#NAME}) is accepted alongside {@link
   * JsonType#STRING}, unlike {@link JsonType#BOOLEAN}/{@link JsonType#NUMBER}: {@code
   * ObjectCoercer} routes a raw ({@code Map.class}, not {@code Map<String, ?>}) map's keys through
   * exactly this coercer (see its {@code case NAME} branch), and a JSON key is structurally always
   * textual — nothing to be strict about there, unlike a boolean/number masquerading as a string
   * field's value. Rejecting {@code NAME} here (as an earlier version of this class did) broke that
   * unrelated, legitimate mechanism — see {@code BiDi.subscribe}'s {@code Map.class}-typed {@link
   * Command}, whose {@code session.subscribe} result is exactly such a raw map. Private: only ever
   * instantiated once, for {@link #JSON} above.
   */
  private static class StrictStringCoercer extends TypeCoercer<String> {

    @Override
    public boolean test(Class<?> aClass) {
      return String.class.equals(aClass);
    }

    @Override
    public BiFunction<JsonInput, PropertySetting, String> apply(Type ignored) {
      return (jsonInput, setting) -> {
        JsonType type = jsonInput.peek();
        if (type == JsonType.NAME) {
          return jsonInput.nextName();
        }
        if (type != JsonType.STRING) {
          throw new JsonException("Expected a JSON string for a text value, got: " + type);
        }
        return jsonInput.nextString();
      };
    }
  }

  /**
   * A stricter replacement for the shared {@code NumberCoercer<Number>}: that one accepts a JSON
   * string by re-parsing it as a number. A spec'd BiDi "number" field (e.g. {@code timeOrigin}) is
   * required to hold a value strictly to its declared type inbound — see the low-level behavioral
   * contract ADR — so this rejects a string instead of silently parsing it. Private: only ever
   * instantiated once, for {@link #JSON} above.
   */
  private static class StrictNumberCoercer extends TypeCoercer<Number> {

    @Override
    public boolean test(Class<?> aClass) {
      return Number.class.equals(aClass);
    }

    @Override
    public BiFunction<JsonInput, PropertySetting, Number> apply(Type ignored) {
      return (jsonInput, setting) -> {
        if (jsonInput.peek() != JsonType.NUMBER) {
          throw new JsonException(
              "Expected a JSON number for a number value, got: " + jsonInput.peek());
        }
        return jsonInput.nextNumber();
      };
    }
  }
}
