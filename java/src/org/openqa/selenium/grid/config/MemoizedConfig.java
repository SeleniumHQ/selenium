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

import org.openqa.selenium.internal.Require;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicReference;

public class MemoizedConfig implements Config {

  private final Config delegate;

  private final Map<Key, Optional<Boolean>> seenBools = new ConcurrentHashMap<>();
  private final Map<Key, Object> seenClasses = new ConcurrentHashMap<>();
  private final Map<Key, Optional<Integer>> seenInts = new ConcurrentHashMap<>();
  private final Map<Key, Optional<String>> seenStrings = new ConcurrentHashMap<>();
  private final Map<Key, Optional<List<String>>> seenOptions = new ConcurrentHashMap<>();

  public MemoizedConfig(Config delegate) {
    this.delegate = Require.nonNull("Delegate config", delegate);
  }

  @Override
  public Set<String> getSectionNames() {
    return delegate.getSectionNames();
  }

  @Override
  public Set<String> getOptions(String section) {
    Require.nonNull("Section name", section);
    return delegate.getOptions(section);
  }

  @Override
  public Optional<List<String>> getAll(String section, String option) {
    Require.nonNull("Section name", section);
    Require.nonNull("Option", option);

    return seenOptions.computeIfAbsent(new Key(section, option), ignored -> delegate.getAll(section, option));
  }

  @Override
  public Optional<String> get(String section, String option) {
    Require.nonNull("Section name", section);
    Require.nonNull("Option", option);

    return seenStrings.computeIfAbsent(new Key(section, option), ignored -> delegate.get(section, option));
  }

  @Override
  public Optional<Integer> getInt(String section, String option) {
    Require.nonNull("Section name", section);
    Require.nonNull("Option", option);

    return seenInts.computeIfAbsent(new Key(section, option), ignored -> delegate.getInt(section, option));
  }

  @Override
  public Optional<Boolean> getBool(String section, String option) {
    Require.nonNull("Section name", section);
    Require.nonNull("Option", option);

    return seenBools.computeIfAbsent(new Key(section, option), ignored -> delegate.getBool(section, option));
  }

  @Override
  public <X> X getClass(String section, String option, Class<X> typeOfX, String defaultClassName) {
    Require.nonNull("Section name", section);
    Require.nonNull("Option", option);
    Require.nonNull("Type to load", typeOfX);
    Require.nonNull("Default class name", defaultClassName);

    AtomicReference<Exception> thrown = new AtomicReference<>();
    Object value = seenClasses.computeIfAbsent(
      new Key(section, option, typeOfX.toGenericString(), defaultClassName),
      ignored -> {
        try {
          String clazz = delegate.get(section, option).orElse(defaultClassName);
          return ClassCreation.callCreateMethod(clazz, typeOfX, this);
        } catch (Exception e) {
          thrown.set(e);
          return null;
        }
      });

    if (value != null) {
      return typeOfX.cast(value);
    }

    Exception exception = thrown.get();
    if (exception instanceof RuntimeException) {
      throw (RuntimeException) exception;
    }
    throw new ConfigException(exception);
  }

  private static class Key {
    private final String[] segments;

    public Key(String... segments) {
      this.segments = segments;
    }

    @Override
    public boolean equals(Object o) {
      if (!(o instanceof Key)) {
        return false;
      }
      Key that = (Key) o;

      return Arrays.equals(this.segments, that.segments);
    }


    @Override
    public int hashCode() {
      return Arrays.hashCode(segments);
    }
  }
}
