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

package org.openqa.selenium.injector;

import com.google.common.collect.ImmutableSet;

import java.lang.reflect.Constructor;
import java.lang.reflect.Parameter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Stream;

public class Injector {

  private final static int MAGIC_SIZE = 100;

  private final Injector parent;
  private final ImmutableSet<Object> injectables;
  private final Map<Class<?>, Object> seenMappings;

  private Injector(Injector parent, Set<Object> injectables) {
    this.parent = parent;
    this.injectables = ImmutableSet.copyOf(injectables);

    // Maintain a cache of lookups to make things faster. Limit the size to stop it growing too
    // large and consuming all the memory.
    this.seenMappings = new LinkedHashMap<Class<?>, Object>() {
      @Override
      protected boolean removeEldestEntry(Map.Entry<Class<?>, Object> eldest) {
        return size() > MAGIC_SIZE;
      }
    };
  }

  public static Builder builder() {
    return new Builder();
  }

  public <T> T newInstance(Class<T> stereotype) {
    try {
      // Find the longest constructor
      class ConstructorAndArgs {
        public Constructor<?> constructor;
        public List<Object> args;

        public ConstructorAndArgs(Constructor<?> constructor, List<Object> args) {
          this.constructor = constructor;
          this.args = args;
        }
      }

      Optional<ConstructorAndArgs> possibleConstructor =
          Stream.of(stereotype.getDeclaredConstructors())
              .map(con -> new ConstructorAndArgs(con, populateArgs(con)))
              .filter(canda -> canda.args != null)
              .max(Comparator.comparing(canda -> canda.args.size()));

      if (!possibleConstructor.isPresent()) {
        // List all constructors to help with debugging
        StringBuilder message = new StringBuilder()
            .append("Unable to find required matches for constructor of: ")
            .append(stereotype)
            .append(". Available constructors:");
        Arrays.stream(stereotype.getDeclaredConstructors()).forEach(
            constructor -> message.append("\n").append(constructor));

        throw new UnableToInstaniateInstanceException(message.toString());
      }

      ConstructorAndArgs canda = possibleConstructor.get();
      canda.constructor.setAccessible(true);
      //noinspection unchecked
      return (T) canda.constructor.newInstance(canda.args.toArray());
    } catch (ReflectiveOperationException e) {
      throw new UnableToInstaniateInstanceException(e);
    }
  }

  private List<Object> populateArgs(Constructor<?> constructor) {
    List<Object> toReturn = new ArrayList<>(constructor.getParameterCount());

    for (Parameter param : constructor.getParameters()) {
      Object value = findArg(param.getType());

      if (value == null) {
        return null;
      }

      toReturn.add(value);
    }

    return toReturn;
  }

  private Object findArg(Class<?> parameterType) {
    Optional<Object> possibleMatch = injectables.stream()
        .filter(obj -> parameterType.isAssignableFrom(obj.getClass()))
        .findFirst();

    // Only cache items from this injector.
    if (possibleMatch.isPresent()) {
      seenMappings.put(parameterType, possibleMatch.get());
      return possibleMatch.get();
    } else {
      return parent == null ? null : parent.findArg(parameterType);
    }
  }

  public static class Builder {
    private Injector parent;
    private final Set<Object> registered = new HashSet<>();
    private final Set<Class<?>> registeredClasses = new HashSet<>();

    private Builder() {
      // Only accessed via builder method above
    }

    public Builder register(Object object) {
      Objects.requireNonNull(object);

      // Ensure we only add one instance of each type.
      if (registeredClasses.contains(object.getClass())) {
        throw new IllegalArgumentException(String.format(
            "Only one instance of a particular class is supported. Duplicate instance of %s is added: %s",
            object.getClass(),
            object));
      }

      registered.add(object);
      registeredClasses.add(object.getClass());

      return this;
    }

    public Builder parent(Injector parent) {
      if (this.parent != null) {
        throw new IllegalStateException("Injectors may only have one parent");
      }

      this.parent = Objects.requireNonNull(parent);

      return this;
    }

    public Injector build() {
      return new Injector(parent, registered);
    }
  }
}
