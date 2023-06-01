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

import static java.util.Comparator.comparing;
import static java.util.Comparator.naturalOrder;

import com.beust.jcommander.Parameter;
import com.google.common.collect.ImmutableSet;
import com.google.common.collect.ImmutableSortedSet;
import com.google.common.collect.Sets;
import com.google.common.primitives.Primitives;
import java.lang.reflect.Field;
import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.util.Arrays;
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

/** Represents a configurable attribute of the Selenium Grid. */
public class DescribedOption implements Comparable<DescribedOption> {

  public final String section;
  public final String optionName;
  public final String description;
  public final String type;
  public final String[] example;
  public final String defaultValue;
  public final boolean prefixed;
  public final boolean repeats;
  public final boolean quotable;
  public final boolean hidden;
  public final Set<String> flags;

  DescribedOption(Type type, Parameter parameter, ConfigValue configValue, String defaultValue) {
    Objects.requireNonNull(type);
    Objects.requireNonNull(parameter);
    Objects.requireNonNull(configValue);
    Objects.requireNonNull(defaultValue);

    this.section = configValue.section();
    this.optionName = configValue.name();
    this.type = getType(type);
    this.description = parameter.description();
    this.prefixed = configValue.prefixed();
    this.repeats = isCollection(type);
    this.quotable = isTomlStringType(type);
    this.example = configValue.example();
    this.flags = ImmutableSortedSet.<String>naturalOrder().add(parameter.names()).build();
    this.defaultValue = defaultValue;
    this.hidden = parameter.hidden();
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
        String fieldValue = "";
        try {
          Object fieldInstance = field.get(clazz.newInstance());
          fieldValue = fieldInstance == null ? "" : fieldInstance.toString();
        } catch (IllegalAccessException | InstantiationException ignore) {
          // We'll swallow this exception since we are just trying to get field's default value
        }
        if (param != null && configValue != null) {
          fields.add(new DescribedOption(field.getGenericType(), param, configValue, fieldValue));
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

  public String[] example() {
    return example;
  }

  public String example(Config config, String example) {
    Optional<List<String>> allOptions = config.getAll(section, optionName);
    if (allOptions.isPresent() && !allOptions.get().isEmpty()) {
      if (repeats) {
        return allOptions.get().stream()
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
    return comparing((DescribedOption describedOption) -> describedOption.section)
        .thenComparing(describedOption -> describedOption.optionName)
        .compare(this, o);
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    DescribedOption that = (DescribedOption) o;
    return repeats == that.repeats
        && quotable == that.quotable
        && Objects.equals(section, that.section)
        && Objects.equals(optionName, that.optionName)
        && Objects.equals(description, that.description)
        && Objects.equals(defaultValue, that.defaultValue)
        && Objects.equals(type, that.type)
        && Arrays.equals(example, that.example)
        && Objects.equals(flags, that.flags);
  }

  @Override
  public int hashCode() {
    return Objects.hash(
        section,
        optionName,
        description,
        type,
        Arrays.hashCode(example),
        repeats,
        quotable,
        flags,
        defaultValue);
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
    if (type instanceof ParameterizedType
        && ((ParameterizedType) type).getRawType() instanceof Class
        && Collection.class.isAssignableFrom((Class<?>) ((ParameterizedType) type).getRawType())) {
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
    return type instanceof ParameterizedType
        && ((ParameterizedType) type).getRawType() instanceof Class
        && Collection.class.isAssignableFrom((Class<?>) ((ParameterizedType) type).getRawType());
  }
}
