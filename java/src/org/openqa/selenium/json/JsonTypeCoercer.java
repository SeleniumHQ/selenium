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

import static java.util.stream.Collectors.collectingAndThen;
import static java.util.stream.Collectors.toSet;
import static org.openqa.selenium.json.Types.narrow;

import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.BiFunction;
import java.util.stream.Stream;
import java.util.stream.StreamSupport;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.MutableCapabilities;

/**
 * The <b>JsonTypeCoercer</b> class manages a collection of type coercers, providing a single source
 * for obtaining functions to convert JSON strings into instances of their corresponding Java types.
 */
class JsonTypeCoercer {

  private final Set<TypeCoercer<?>> additionalCoercers;
  private final Set<TypeCoercer<?>> coercers;

  /**
   * Cache of resolved coercion functions for plain {@link Class} keys, which are the overwhelmingly
   * common case. A {@link ClassValue} stores each entry on the class itself, so classes (and their
   * class loaders) remain eligible for garbage collection — important for callers that deserialize
   * into dynamically generated classes, since {@link Json} shares a single coercer for the life of
   * the JVM.
   */
  private final ClassValue<BiFunction<JsonInput, PropertySetting, Object>> classCoercers =
      new ClassValue<BiFunction<JsonInput, PropertySetting, Object>>() {
        @Override
        protected BiFunction<JsonInput, PropertySetting, Object> computeValue(Class<?> type) {
          return buildCoercer(type);
        }
      };

  /**
   * Cache of resolved coercion functions for parameterized types passed directly to {@link #coerce}
   * — in practice, the handful of {@link TypeToken} constants in the codebase. Unlike {@link
   * #classCoercers}, entries here live as long as this coercer does, so the map is capped: if a
   * caller funnels many distinct types through it (say, types built around generated classes), it
   * is cleared rather than allowed to pin those classes forever.
   */
  private static final int MAX_CACHED_GENERIC_TYPES = 256;

  private final Map<Type, BiFunction<JsonInput, PropertySetting, Object>> knownCoercers =
      new ConcurrentHashMap<>();

  JsonTypeCoercer() {
    this(Stream.of());
  }

  JsonTypeCoercer(JsonTypeCoercer coercer, Iterable<TypeCoercer<?>> coercers) {
    this(
        Stream.concat(
            StreamSupport.stream(coercers.spliterator(), false),
            coercer.additionalCoercers.stream()));
  }

  private JsonTypeCoercer(Stream<TypeCoercer<?>> coercers) {
    this.additionalCoercers =
        coercers.collect(collectingAndThen(toSet(), Collections::unmodifiableSet));

    // Note: we call out when ordering matters.
    Set<TypeCoercer<?>> builder = new LinkedHashSet<>(additionalCoercers);

    // Types that don't contain other types first
    // From java
    builder.add(new BooleanCoercer());

    builder.add(new NumberCoercer<>(this, Byte.class, Number::byteValue));
    builder.add(new NumberCoercer<>(this, Double.class, Number::doubleValue));
    builder.add(new NumberCoercer<>(this, Float.class, Number::floatValue));
    builder.add(new NumberCoercer<>(this, Integer.class, Number::intValue));
    builder.add(new NumberCoercer<>(this, Long.class, Number::longValue));
    builder.add(
        new NumberCoercer<>(
            this,
            Number.class,
            num -> {
              if (num instanceof Long) {
                return num;
              }

              double doubleValue = num.doubleValue();
              if (doubleValue % 1 != 0
                  || doubleValue < Long.MIN_VALUE
                  || doubleValue > Long.MAX_VALUE) {
                return doubleValue;
              }
              return num.longValue();
            }));
    builder.add(new NumberCoercer<>(this, Short.class, Number::shortValue));
    builder.add(new StringCoercer());
    builder.add(new EnumCoercer<>());
    builder.add(new UriCoercer());
    builder.add(new UrlCoercer());
    builder.add(new UuidCoercer());
    builder.add(new InstantCoercer(this));

    // From Selenium
    builder.add(
        new MapCoercer<>(
            Capabilities.class,
            this,
            MutableCapabilities::new,
            (caps) -> ((k, v) -> caps.setCapability((String) k, v))));

    // Container types
    //noinspection unchecked
    builder.add(new CollectionCoercer<>(List.class, this, ArrayList::new, (list) -> list::add));
    //noinspection unchecked
    builder.add(new CollectionCoercer<>(Set.class, this, HashSet::new, (set) -> set::add));
    //noinspection unchecked
    builder.add(
        new CollectionCoercer<>(
            Collection.class, this, ArrayList::new, (collection) -> collection::add));

    builder.add(new OptionalCoercer(this));

    builder.add(new StaticInitializerCoercer());

    builder.add(new MapCoercer<>(Map.class, this, LinkedHashMap::new, (map) -> map::put));

    // If the requested type is exactly "Object", do some guess work
    builder.add(new ObjectCoercer(this));

    builder.add(new ConstructorCoercer(this));

    // Order matters here: we want this to be the last called coercer
    builder.add(new InstanceCoercer(this));

    this.coercers = Collections.unmodifiableSet(builder);
  }

  <T> T coerce(JsonInput json, Type typeOfT, PropertySetting setter) {
    @SuppressWarnings("unchecked")
    T result = (T) resolve(typeOfT).apply(json, setter);

    return result;
  }

  /**
   * Resolve the coercion function for the specified type, caching the result. Callers that coerce
   * many values of the same type (containers, in particular) should resolve once and reuse the
   * returned function rather than paying a cache lookup per element.
   *
   * @param type data type for deserialization (class or {@link TypeToken})
   * @return {@link BiFunction} object to deserialize the specified Java type
   */
  BiFunction<JsonInput, PropertySetting, Object> resolve(Type type) {
    if (type instanceof Class) {
      return classCoercers.get((Class<?>) type);
    }

    // Plain get first: this is almost always a hit, and avoids the capturing lambda that
    // computeIfAbsent would allocate on every call.
    BiFunction<JsonInput, PropertySetting, Object> coercer = knownCoercers.get(type);
    if (coercer == null) {
      if (knownCoercers.size() >= MAX_CACHED_GENERIC_TYPES) {
        knownCoercers.clear();
      }
      coercer = knownCoercers.computeIfAbsent(type, this::buildCoercer);
    }
    return coercer;
  }

  /**
   * Return a function that resolves the coercer for the specified type on first use. Unlike {@link
   * #resolve}, this is safe to call from within a {@link TypeCoercer#apply} implementation, where
   * an eager resolution would recursively update the coercer cache mid-computation.
   *
   * @param type data type for deserialization (class or {@link TypeToken})
   * @return {@link BiFunction} object to deserialize the specified Java type
   */
  BiFunction<JsonInput, PropertySetting, Object> lazyResolve(Type type) {
    return new LazyCoercer(this, type);
  }

  private static class LazyCoercer implements BiFunction<JsonInput, PropertySetting, Object> {
    private final JsonTypeCoercer coercer;
    private final Type type;
    private volatile BiFunction<JsonInput, PropertySetting, Object> delegate;

    LazyCoercer(JsonTypeCoercer coercer, Type type) {
      this.coercer = coercer;
      this.type = type;
    }

    @Override
    public Object apply(JsonInput json, PropertySetting setter) {
      BiFunction<JsonInput, PropertySetting, Object> resolved = delegate;
      if (resolved == null) {
        if (type instanceof Class) {
          resolved = coercer.resolve(type);
        } else {
          // Memoize here rather than in the shared map: this LazyCoercer is reachable only from
          // the coercion function for its owning type, so a parameterized type mentioning a
          // generated class dies with that class instead of being pinned by the cache.
          resolved = coercer.buildCoercer(type);
        }
        delegate = resolved;
      }
      return resolved.apply(json, setter);
    }
  }

  /**
   * Extract the coercer that supports the specified type from the collection managed by this {@code
   * JsonTypeCoercer}, returning a coercion function for the client to use. The returned function
   * takes care of JSON null handling, so it can be invoked directly.
   *
   * @param type data type for deserialization (class or {@link TypeToken})
   * @return {@link BiFunction} object to deserialize the specified Java type
   */
  private BiFunction<JsonInput, PropertySetting, Object> buildCoercer(Type type) {
    TypeCoercer<?> matched =
        coercers.stream()
            .filter(coercer -> coercer.test(narrow(type)))
            .findFirst()
            .orElseThrow(() -> new JsonException("Unable to find type coercer for " + type));

    @SuppressWarnings("unchecked")
    BiFunction<JsonInput, PropertySetting, Object> inner =
        (BiFunction<JsonInput, PropertySetting, Object>) matched.apply(type);

    if (matched.handlesNull() || isOptional(type)) {
      return inner;
    }

    return (json, setter) -> {
      if (json.peek() == JsonType.NULL) {
        return json.nextNull();
      }
      return inner.apply(json, setter);
    };
  }

  private boolean isOptional(Type type) {
    if (type instanceof Class) {
      return Optional.class.equals(type);
    }

    return type instanceof ParameterizedType
        && Optional.class.equals(((ParameterizedType) type).getRawType());
  }
}
