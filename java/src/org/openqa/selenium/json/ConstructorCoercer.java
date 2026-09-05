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

import static java.util.stream.Collectors.toList;
import static org.openqa.selenium.json.Types.narrow;

import java.io.StringReader;
import java.io.StringWriter;
import java.lang.reflect.Constructor;
import java.lang.reflect.Modifier;
import java.lang.reflect.Parameter;
import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.function.BiFunction;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.stream.Stream;
import org.jspecify.annotations.Nullable;
import org.openqa.selenium.internal.Require;

class ConstructorCoercer extends TypeCoercer<Object> {

  private static final Logger LOG = Logger.getLogger(ConstructorCoercer.class.getName());

  // A JSON property name is attacker-controlled input, so it is never logged verbatim: a raw
  // \r or \n could forge what looks like a separate log line, and an unbounded key could blow up
  // log storage. Escaping control characters and capping length neutralizes both.
  private static final int MAX_LOGGED_KEY_LENGTH = 200;

  private static String sanitizeForLog(String value) {
    String truncated =
        value.length() > MAX_LOGGED_KEY_LENGTH
            ? value.substring(0, MAX_LOGGED_KEY_LENGTH) + "...(truncated)"
            : value;
    StringBuilder sanitized = new StringBuilder(truncated.length());
    for (int i = 0; i < truncated.length(); i++) {
      char c = truncated.charAt(i);
      switch (c) {
        case '\n':
          sanitized.append("\\n");
          break;
        case '\r':
          sanitized.append("\\r");
          break;
        case '\t':
          sanitized.append("\\t");
          break;
        default:
          if (c < 0x20 || c == 0x7f) {
            sanitized.append(String.format("\\u%04x", (int) c));
          } else {
            sanitized.append(c);
          }
      }
    }
    return sanitized.toString();
  }

  // A payload with many undeclared keys must not turn into one log record per key — that is
  // log-amplification the caller controls the size of. One summary record, capped at the first
  // few keys plus a total count, keeps the cost bounded regardless of how many keys arrive.
  private static final int MAX_LOGGED_UNKNOWN_KEYS = 10;

  // sampleKeys holds at most MAX_LOGGED_UNKNOWN_KEYS entries — the caller stops appending once
  // it hits that cap, so this never buffers more than it will ever print. unknownCount is the
  // true total, tracked separately so a capped sample never has to lie about how many there were.
  private static String describeUnknownFields(
      Class<?> declaringClass, int unknownCount, List<String> sampleKeys) {
    StringBuilder message =
        new StringBuilder(declaringClass.getSimpleName())
            .append(": dropped ")
            .append(unknownCount)
            .append(" undeclared field")
            .append(unknownCount == 1 ? "" : "s")
            .append(": [");
    for (int i = 0; i < sampleKeys.size(); i++) {
      if (i > 0) {
        message.append(", ");
      }
      message.append(sanitizeForLog(sampleKeys.get(i)));
    }
    if (unknownCount > sampleKeys.size()) {
      message.append(", ...");
    }
    return message.append("]").toString();
  }

  private final JsonTypeCoercer coercer;

  ConstructorCoercer(JsonTypeCoercer coercer) {
    this.coercer = Require.nonNull("Coercer", coercer);
  }

  @Override
  public boolean test(Class<?> aClass) {
    return !Modifier.isAbstract(aClass.getModifiers())
        && !hasNoArgConstructor(aClass)
        && getConstructors(aClass).findAny().isPresent();
  }

  @Override
  public BiFunction<JsonInput, PropertySetting, Object> apply(Type type) {
    List<ConstructorCandidate> candidates = getConstructorCandidates(type);

    return (jsonInput, setting) -> {
      Map<String, Object> properties = coercer.coerce(jsonInput, Json.MAP_TYPE, setting);
      ConstructorCandidate candidate = findConstructor(type, candidates, properties.keySet());

      return candidate.create(type, properties, setting);
    };
  }

  private List<ConstructorCandidate> getConstructorCandidates(Type type) {
    List<Constructor<?>> constructors = getConstructors(narrow(type)).collect(toList());
    if (constructors.isEmpty()) {
      throw new JsonException("Cannot determine constructor for " + type);
    }

    return constructors.stream()
        .map(ConstructorCandidate::new)
        .sorted(Comparator.comparing(ConstructorCandidate::parameterCount).reversed())
        .collect(toList());
  }

  private ConstructorCandidate findConstructor(
      Type type, List<ConstructorCandidate> candidates, Set<String> fieldNames) {
    int matchedParameterCount = -1;
    List<ConstructorCandidate> matches = new ArrayList<>();

    for (ConstructorCandidate candidate : candidates) {
      if (matchedParameterCount != -1 && candidate.parameterCount() < matchedParameterCount) {
        break;
      }

      if (candidate.matches(fieldNames)) {
        matchedParameterCount = candidate.parameterCount();
        matches.add(candidate);
      }
    }

    if (matches.size() == 1) {
      return matches.get(0);
    }

    if (matches.size() > 1) {
      throw new JsonException(
          String.format("Unable to choose between %d constructors for %s", matches.size(), type));
    }

    if (candidates.size() == 1) {
      candidates.get(0).throwForMissingParameter(fieldNames);
    }

    throw new JsonException(
        String.format(
            "Unable to find matching constructor for %s using fields %s", type, fieldNames));
  }

  private Stream<Constructor<?>> getConstructors(Class<?> aClass) {
    if (aClass.isMemberClass() && !Modifier.isStatic(aClass.getModifiers())) {
      return Stream.empty();
    }

    return Arrays.stream(aClass.getDeclaredConstructors())
        .filter(constructor -> constructor.getParameterCount() > 0)
        .filter(constructor -> !constructor.isSynthetic())
        .filter(this::hasNamedParameters);
  }

  private boolean hasNamedParameters(Constructor<?> constructor) {
    return Arrays.stream(constructor.getParameters()).allMatch(Parameter::isNamePresent);
  }

  private boolean isOptional(Parameter parameter) {
    return Optional.class.equals(parameter.getType());
  }

  // Distinct from isOptional: this governs whether a JSON null is an acceptable *value* for an
  // already-present property, not whether the property's key may be absent. An Optional-typed
  // parameter is always nullable; a parameter explicitly annotated @Nullable is nullable too,
  // even when its key is required (e.g. a required field whose value may legitimately be null).
  private boolean isNullable(Parameter parameter) {
    // jspecify's @Nullable is @Target(TYPE_USE) only, not PARAMETER, so it is not visible via
    // Parameter.isAnnotationPresent (a declaration-annotation query); it must be read off the
    // annotated type instead.
    return isOptional(parameter)
        || parameter.isAnnotationPresent(Nullable.class)
        || parameter.getAnnotatedType().isAnnotationPresent(Nullable.class);
  }

  private boolean hasNoArgConstructor(Class<?> aClass) {
    return Arrays.stream(aClass.getDeclaredConstructors())
        .anyMatch(constructor -> constructor.getParameterCount() == 0);
  }

  private Map<String, Integer> getParameterIndexes(Parameter[] parameters) {
    Map<String, Integer> indexes = new LinkedHashMap<>();
    for (int i = 0; i < parameters.length; i++) {
      Integer previous = indexes.put(parameters[i].getName(), i);
      if (previous != null) {
        throw new JsonException("Duplicate constructor parameter name: " + parameters[i].getName());
      }
    }

    return indexes;
  }

  private Object coerceValue(Object value, Type type, PropertySetting setting) {
    if (value != null && type instanceof Class) {
      Object direct = tryDirectCoercion(value, (Class<?>) type);
      if (direct != null) {
        return direct;
      }
    }

    StringWriter rawJson = new StringWriter();
    try (JsonOutput output = new JsonOutput(rawJson)) {
      output.write(value);
    }

    try (JsonInput input = new JsonInput(new StringReader(rawJson.toString()), coercer, setting)) {
      return coercer.coerce(input, type, setting);
    }
  }

  /**
   * Coerce the already-parsed value directly when the target is a scalar type, mirroring the
   * behavior of the corresponding {@link TypeCoercer}s without serializing the value back to JSON
   * text and re-parsing it.
   *
   * @return the coerced value; {@code null} if the caller must fall back to the JSON round trip
   */
  private static Object tryDirectCoercion(Object value, Class<?> target) {
    if (target == String.class) {
      return (value instanceof String || value instanceof Number || value instanceof Boolean)
          ? String.valueOf(value)
          : null;
    }

    if ((target == Boolean.class || target == boolean.class) && value instanceof Boolean) {
      return value;
    }

    if (value instanceof Number) {
      Number number = (Number) value;
      if (target == Integer.class || target == int.class) {
        return number.intValue();
      }
      if (target == Long.class || target == long.class) {
        return number.longValue();
      }
      if (target == Double.class || target == double.class) {
        return number.doubleValue();
      }
      if (target == Float.class || target == float.class) {
        return number.floatValue();
      }
      if (target == Short.class || target == short.class) {
        return number.shortValue();
      }
      if (target == Byte.class || target == byte.class) {
        return number.byteValue();
      }
      if (target == Number.class) {
        if (number instanceof Long) {
          return number;
        }
        double doubleValue = number.doubleValue();
        if (doubleValue % 1 != 0 || doubleValue < Long.MIN_VALUE || doubleValue > Long.MAX_VALUE) {
          return doubleValue;
        }
        return number.longValue();
      }
      return null;
    }

    if (target.isEnum() && value instanceof String) {
      for (Object constant : target.getEnumConstants()) {
        if (constant.toString().equalsIgnoreCase((String) value)) {
          return constant;
        }
      }
      throw new JsonException(
          String.format("Unable to find matching enum value for %s in %s", value, target));
    }

    return null;
  }

  private class ConstructorCandidate {
    private final Constructor<?> constructor;
    private final Parameter[] parameters;
    private final Map<String, Integer> parameterIndexes;
    // Computed once here rather than re-checked reflectively on every create() call: the
    // JsonTypeCoercer caches the coercer built for a type, so this candidate — and this flag —
    // is reused for every future deserialization of that type, not just the first one.
    private final boolean warnsOnUnknownFields;

    ConstructorCandidate(Constructor<?> constructor) {
      this.constructor = constructor;
      this.constructor.setAccessible(true);
      this.parameters = constructor.getParameters();
      this.parameterIndexes = getParameterIndexes(parameters);
      this.warnsOnUnknownFields =
          constructor.getDeclaringClass().isAnnotationPresent(WarnOnUnknownFields.class);
    }

    int parameterCount() {
      return parameters.length;
    }

    boolean matches(Set<String> fieldNames) {
      return Arrays.stream(parameters)
          .filter(parameter -> !isOptional(parameter))
          .map(Parameter::getName)
          .allMatch(fieldNames::contains);
    }

    Object create(Type type, Map<String, Object> properties, PropertySetting setting) {
      Object[] values = new Object[parameters.length];

      for (int i = 0; i < parameters.length; i++) {
        Parameter parameter = parameters[i];

        if (!properties.containsKey(parameter.getName())) {
          values[i] = Optional.empty();
          continue;
        }

        Object value =
            coerceValue(
                properties.get(parameter.getName()), parameter.getParameterizedType(), setting);
        if (value == null && !isNullable(parameter)) {
          throw new JsonException(
              String.format(
                  "Constructor parameter %s.%s cannot be null",
                  constructor.getDeclaringClass().getName(), parameter.getName()));
        }

        values[i] = value;
      }

      if (warnsOnUnknownFields && LOG.isLoggable(Level.WARNING)) {
        // Gated on isLoggable so a disabled WARNING level skips even scanning for unknown
        // keys, not just building the message — that scan scales with an attacker-controlled
        // payload size. sampleKeys itself never grows past what the message will ever print;
        // unknownCount tracks the true total separately, uncapped, since counting costs nothing.
        int unknownCount = 0;
        List<String> sampleKeys = new ArrayList<>(MAX_LOGGED_UNKNOWN_KEYS);
        for (String key : properties.keySet()) {
          if (!parameterIndexes.containsKey(key)) {
            unknownCount++;
            if (sampleKeys.size() < MAX_LOGGED_UNKNOWN_KEYS) {
              sampleKeys.add(key);
            }
          }
        }
        if (unknownCount > 0) {
          LOG.warning(
              describeUnknownFields(constructor.getDeclaringClass(), unknownCount, sampleKeys));
        }
      }

      try {
        return constructor.newInstance(values);
      } catch (ReflectiveOperationException | IllegalArgumentException e) {
        throw new JsonException("Unable to create instance of " + type, e);
      }
    }

    void throwForMissingParameter(Set<String> fieldNames) {
      Arrays.stream(parameters)
          .filter(parameter -> !isOptional(parameter))
          .filter(parameter -> !fieldNames.contains(parameter.getName()))
          .findFirst()
          .ifPresent(
              parameter -> {
                throw new JsonException(
                    String.format(
                        "Missing JSON value for constructor parameter %s.%s",
                        constructor.getDeclaringClass().getName(), parameter.getName()));
              });
    }
  }
}
