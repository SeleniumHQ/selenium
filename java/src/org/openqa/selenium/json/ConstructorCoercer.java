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
import java.util.stream.Stream;
import org.openqa.selenium.internal.Require;

class ConstructorCoercer extends TypeCoercer<Object> {

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
    StringWriter rawJson = new StringWriter();
    try (JsonOutput output = new JsonOutput(rawJson)) {
      output.write(value);
    }

    try (JsonInput input = new JsonInput(new StringReader(rawJson.toString()), coercer, setting)) {
      return coercer.coerce(input, type, setting);
    }
  }

  private class ConstructorCandidate {
    private final Constructor<?> constructor;
    private final Parameter[] parameters;
    private final Map<String, Integer> parameterIndexes;

    ConstructorCandidate(Constructor<?> constructor) {
      this.constructor = constructor;
      this.constructor.setAccessible(true);
      this.parameters = constructor.getParameters();
      this.parameterIndexes = getParameterIndexes(parameters);
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
        if (value == null && !isOptional(parameter)) {
          throw new JsonException(
              String.format(
                  "Constructor parameter %s.%s cannot be null",
                  constructor.getDeclaringClass().getName(), parameter.getName()));
        }

        values[i] = value;
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
