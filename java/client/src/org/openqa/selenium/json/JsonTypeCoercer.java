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

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.MutableCapabilities;

import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.BiFunction;
import java.util.stream.Collector;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import java.util.stream.StreamSupport;

import static java.util.stream.Collector.Characteristics.CONCURRENT;
import static java.util.stream.Collector.Characteristics.UNORDERED;
import static java.util.stream.Collectors.collectingAndThen;
import static java.util.stream.Collectors.toSet;
import static org.openqa.selenium.json.Types.narrow;

class JsonTypeCoercer {

  private final Set<TypeCoercer<?>> additionalCoercers;
  private final Set<TypeCoercer> coercers;
  private final Map<Type, BiFunction<JsonInput, PropertySetting, Object>> knownCoercers = new ConcurrentHashMap<>();

  JsonTypeCoercer() {
    this(Stream.of());
  }

  JsonTypeCoercer(JsonTypeCoercer coercer, Iterable<TypeCoercer<?>> coercers) {
    this(
      Stream.concat(StreamSupport.stream(coercers.spliterator(), false), coercer.additionalCoercers.stream()));
  }

  private JsonTypeCoercer(Stream<TypeCoercer<?>> coercers) {
    this.additionalCoercers = coercers.collect(collectingAndThen(toSet(), Collections::unmodifiableSet));

    // Note: we call out when ordering matters.
    Set<TypeCoercer<?>> builder = new LinkedHashSet<>(additionalCoercers);

    // Types that don't contain other types first
    // From java
    builder.add(new BooleanCoercer());

    builder.add(new NumberCoercer<>(Byte.class, Number::byteValue));
    builder.add(new NumberCoercer<>(Double.class, Number::doubleValue));
    builder.add(new NumberCoercer<>(Float.class, Number::floatValue));
    builder.add(new NumberCoercer<>(Integer.class, Number::intValue));
    builder.add(new NumberCoercer<>(Long.class, Number::longValue));
    builder.add(
        new NumberCoercer<>(
            Number.class,
            num -> {
              Double doubleValue = num.doubleValue();
              if (doubleValue % 1 != 0 || doubleValue > Long.MAX_VALUE) {
                return doubleValue;
              }
              return num.longValue();
            }));
    builder.add(new NumberCoercer<>(Short.class, Number::shortValue));
    builder.add(new StringCoercer());
    builder.add(new EnumCoercer());
    builder.add(new UriCoercer());
    builder.add(new UrlCoercer());
    builder.add(new UuidCoercer());

    // From Selenium
    builder.add(new MapCoercer<>(
        Capabilities.class,
        this,
        Collector.of(MutableCapabilities::new, (caps, entry) -> caps.setCapability((String) entry.getKey(), entry.getValue()), MutableCapabilities::merge, UNORDERED)));

    // Container types
    //noinspection unchecked
    builder.add(new CollectionCoercer<>(List.class, this, Collectors.toCollection(ArrayList::new)));
    //noinspection unchecked
    builder.add(new CollectionCoercer<>(Set.class, this, Collectors.toCollection(HashSet::new)));

    builder.add(new MapCoercer<>(
        Map.class,
        this,
        Collector.of(LinkedHashMap::new, (map, entry) -> map.put(entry.getKey(), entry.getValue()), (l, r) -> { l.putAll(r); return l; }, UNORDERED, CONCURRENT)));

    // If the requested type is exactly "Object", do some guess work
    builder.add(new ObjectCoercer(this));

    builder.add(new StaticInitializerCoercer());

    // Order matters here: we want this to be the last called coercer
    builder.add(new InstanceCoercer(this));

    this.coercers = Collections.unmodifiableSet(builder);
  }

  <T> T coerce(JsonInput json, Type typeOfT, PropertySetting setter) {
    BiFunction<JsonInput, PropertySetting, Object> coercer =
        knownCoercers.computeIfAbsent(typeOfT, this::buildCoercer);

    // We need to keep null checkers happy, apparently.
    @SuppressWarnings("unchecked") T result = (T) Objects.requireNonNull(coercer).apply(json, setter);

    return result;
  }

  private BiFunction<JsonInput, PropertySetting, Object> buildCoercer(Type type) {
    return coercers.stream()
        .filter(coercer -> coercer.test(narrow(type)))
        .findFirst()
        .map(coercer -> coercer.apply(type))
        .map(
            func ->
                (BiFunction<JsonInput, PropertySetting, Object>)
                    (jsonInput, setter) -> {
                      if (jsonInput.peek() == JsonType.NULL) {
                        return jsonInput.nextNull();
                      }

                      //noinspection unchecked
                      return func.apply(jsonInput, setter);
                    })
        .orElseThrow(() -> new JsonException("Unable to find type coercer for " + type));
  }

}
