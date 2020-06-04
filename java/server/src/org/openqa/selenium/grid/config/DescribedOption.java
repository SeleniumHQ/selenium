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

package org.openqa.selenium.grid.config;

import com.beust.jcommander.Parameter;
import com.google.common.collect.ImmutableSet;
import com.google.common.collect.ImmutableSortedSet;
import com.google.common.collect.Sets;
import com.google.common.primitives.Primitives;

import java.lang.reflect.Field;
import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.ServiceLoader;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import java.util.stream.StreamSupport;

import static java.util.Comparator.naturalOrder;

/**
 * Represents a configurable attribute of the Selenium Grid.
 */
public class DescribedOption implements Comparable<DescribedOption> {
  public final String section;
  public final String optionName;
  public final String description;
  public final String type;
  public final String example;
  public final boolean repeats;
  public final boolean quotable;
  public final Set<String> flags;

  DescribedOption(Type type, Parameter parameter, ConfigValue configValue) {
    Objects.requireNonNull(type);
    Objects.requireNonNull(parameter);
    Objects.requireNonNull(configValue);

    this.section = configValue.section();
    this.optionName = configValue.name();
    this.type = getType(type);
    this.description = parameter.description();
    this.repeats = isCollection(type);
    this.quotable = isTomlStringType(type);
    this.example = configValue.example();
    this.flags = ImmutableSortedSet.<String>naturalOrder().add(parameter.names()).build();
  }

  public static Set<DescribedOption> findAllMatchingOptions(Collection<Role> roles) {
    Objects.requireNonNull(roles);

    Set<Role> minimized = ImmutableSet.copyOf(roles);

    return StreamSupport.stream(ServiceLoader.load(HasRoles.class).spliterator(), false)
      .filter(hasRoles -> !Sets.intersection(hasRoles.getRoles(), minimized).isEmpty())
      .flatMap(DescribedOption::getAllFields)
      .collect(ImmutableSortedSet.toImmutableSortedSet(naturalOrder()));
  }

  private static Stream<DescribedOption> getAllFields(HasRoles hasRoles) {
    Set<DescribedOption> fields = new HashSet<>();
    Class<?> clazz = hasRoles.getClass();
    while (clazz != null && !Object.class.equals(clazz)) {
      for (Field field : clazz.getDeclaredFields()) {
        field.setAccessible(true);
        Parameter param = field.getAnnotation(Parameter.class);
        ConfigValue configValue = field.getAnnotation(ConfigValue.class);

        if (param != null && configValue != null) {
          fields.add(new DescribedOption(field.getGenericType(), param, configValue));
        }
      }
      clazz = clazz.getSuperclass();
    }
    return fields.stream();
  }


  public String section() {
    return section;
  }

  public String optionName() {
    return optionName;
  }

  public String description() {
    return description;
  }

  public boolean repeats() {
    return repeats;
  }

  public boolean requiresTomlQuoting() {
    return quotable;
  }

  public String example() {
    return example;
  }

  public String example(Config config) {
    Optional<List<String>> allOptions = config.getAll(section, optionName);
    if (allOptions.isPresent() && !allOptions.get().isEmpty()) {
      if (repeats) {
        return allOptions.stream()
          .map(value -> quotable ? "\"" + value + "\"" : String.valueOf(value))
          .collect(Collectors.joining(", ", "[", "]"));
      }
      String value = allOptions.get().get(0);
      return quotable ? "\"" + value + "\"" : value;
    }

    return example;
  }

  public Set<String> flags() {
    return flags;
  }

  @Override
  public int compareTo(DescribedOption o) {
    return optionName.compareTo(o.optionName);
  }

  public String getType(Type type) {
    String className = deriveClass(type).getSimpleName().toLowerCase();

    return isCollection(type) ? "list of " + className + "s" : className;
  }

  private boolean isTomlStringType(Type type) {
    Class<?> derived = Primitives.wrap(deriveClass(type));

    // Everything other than numbers and booleans must be quoted
    return !(Number.class.isAssignableFrom(derived) || Boolean.class.isAssignableFrom(derived));
  }

  private Class<?> deriveClass(Type type) {
    if (type instanceof ParameterizedType &&
      ((ParameterizedType) type).getRawType() instanceof Class &&
      Collection.class.isAssignableFrom((Class<?>) ((ParameterizedType) type).getRawType())) {
      Type[] typeArgs = ((ParameterizedType) type).getActualTypeArguments();
      if (typeArgs.length == 1 && typeArgs[0] instanceof Class) {
        // TODO: This is not how to pluralise something
        return (Class<?>) typeArgs[0];
      }
    }

    if (type instanceof Class) {
      return (Class<?>) type;
    }

    throw new IllegalStateException("Unknown type: " + type);
  }

  private boolean isCollection(Type type) {
     return type instanceof ParameterizedType &&
      ((ParameterizedType) type).getRawType() instanceof Class &&
      Collection.class.isAssignableFrom((Class<?>) ((ParameterizedType) type).getRawType());
  }
}
