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
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;
import com.google.common.collect.Sets;
import com.google.common.primitives.Primitives;
import org.openqa.selenium.json.Json;

import java.io.PrintStream;
import java.lang.reflect.Field;
import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.nio.file.Path;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.ServiceLoader;
import java.util.Set;
import java.util.SortedSet;
import java.util.TreeMap;
import java.util.TreeSet;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import java.util.stream.StreamSupport;

public class ConfigFlags {

  private static final ImmutableSet<String> IGNORED_SECTIONS = ImmutableSet.of("java", "lc", "term");

  @Parameter(names = "--config", description = "Config file to read from (may be specified more than once)")
  private List<Path> configFiles;

  @Parameter(names = "--dump-config", description = "Dump the config of the server as JSON.", hidden = true)
  private boolean dumpConfig;

  @Parameter(names = "--config-help", description = "Output detailed information about config options")
  private boolean dumpConfigHelp;

  public Config readConfigFiles() {
    if (configFiles == null || configFiles.isEmpty()) {
      return new MapConfig(ImmutableMap.of());
    }

    return new CompoundConfig(
      configFiles.stream()
        .map(Configs::from)
        .toArray(Config[]::new));
  }

  public boolean dumpConfig(Config config, PrintStream dumpTo) {
    if (!dumpConfig) {
      return false;
    }

    Map<String, Map<String, Object>> toOutput = new TreeMap<>();
    for (String section : config.getSectionNames()) {
      if (section.isEmpty() || IGNORED_SECTIONS.contains(section)) {
        continue;
      }

      config.getOptions(section).forEach(option ->
        config.get(section, option).ifPresent(value ->
          toOutput.computeIfAbsent(section, ignored -> new TreeMap<>()).put(option, value)
        )
      );
    }

    dumpTo.print(new Json().toJson(toOutput));

    return true;
  }

  public boolean dumpConfigHelp(Config config, Set<Role> currentRoles, PrintStream dumpTo) {
    if (!dumpConfigHelp) {
      return false;
    }

    Map<String, SortedSet<DescribedOption>> allOptions = new TreeMap<>();

    StreamSupport.stream(ServiceLoader.load(HasRoles.class).spliterator(), false)
      .filter(hasRoles -> !Sets.intersection(hasRoles.getRoles(), currentRoles).isEmpty())
      .flatMap(this::getAllFields)
      .forEach(pac -> allOptions.computeIfAbsent(pac.configValue.section(), key -> new TreeSet<>())
        .add(
          new DescribedOption(
            pac.configValue.name(),
            pac.type,
            pac.parameter.description(),
            pac.configValue.example())));

    StringBuilder demoToml = new StringBuilder();
    allOptions.forEach((section, options) -> {
      demoToml.append("[").append(section).append("]\n");
      options.forEach(option -> {
        if (!option.optionName.isEmpty()) {
          demoToml.append("# ").append(option.comment).append("\n");
        }
        demoToml.append("# Type: ").append(option.type).append("\n");
        demoToml.append(option.optionName).append(" = ").append(exampleValue(config, section, option)).append("\n\n");
      });
      demoToml.append("\n");
    });

    dumpTo.print(demoToml);

    return true;
  }

  private String exampleValue(Config config, String section, DescribedOption option) {
    Optional<List<String>> allOptions = config.getAll(section, option.optionName);
    if (allOptions.isPresent() && !allOptions.get().isEmpty()) {
      if (option.repeats) {
        return allOptions.stream()
          .map(value -> option.quotable ? "\"" + value + "\"" : String.valueOf(value))
          .collect(Collectors.joining(", ", "[", "]"));
      }
      String value = allOptions.get().get(0);
      return option.quotable ? "\"" + value + "\"" : value;
    }

    return option.example;
  }

  private Stream<ParameterAndConfigValue> getAllFields(HasRoles hasRoles) {
    Set<ParameterAndConfigValue> fields = new HashSet<>();
    Class<?> clazz = hasRoles.getClass();
    while (clazz != null && !Object.class.equals(clazz)) {
      for (Field field : clazz.getDeclaredFields()) {
        field.setAccessible(true);
        Parameter param = field.getAnnotation(Parameter.class);
        ConfigValue configValue = field.getAnnotation(ConfigValue.class);

        if (param != null && configValue != null) {
          fields.add(new ParameterAndConfigValue(field.getGenericType(), param, configValue));
        }
      }
      clazz = clazz.getSuperclass();
    }
    return fields.stream();
  }

  private static class ParameterAndConfigValue {
    public final Type type;
    public final Parameter parameter;
    public final ConfigValue configValue;

    private ParameterAndConfigValue(Type type, Parameter parameter, ConfigValue configValue) {
      this.type = type;
      this.parameter = parameter;
      this.configValue = configValue;
    }
  }

  private static class DescribedOption implements Comparable<DescribedOption> {
    public final String optionName;
    public final String comment;
    public final String type;
    public final String example;
    public final boolean repeats;
    public final boolean quotable;

    private DescribedOption(String optionName, Type type, String comment, String example) {
      this.optionName = optionName;
      this.type = getType(type);
      this.comment = comment;
      this.repeats = isCollection(type);
      this.quotable = isTomlStringType(type);
      this.example = example;
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
}
