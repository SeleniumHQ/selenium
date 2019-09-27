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

import static java.util.stream.Collector.Characteristics.CONCURRENT;
import static java.util.stream.Collector.Characteristics.UNORDERED;
import static org.openqa.selenium.json.Types.narrow;

import com.google.common.collect.ImmutableSet;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.MutableCapabilities;

import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.BiFunction;
import java.util.stream.Collector;
import java.util.stream.Collectors;

class JsonTypeCoercer {

  private final Set<TypeCoercer<?>> additionalCoercers;
  private final Set<TypeCoercer> coercers;
  private final Map<Type, BiFunction<JsonInput, PropertySetting, Object>> knownCoercers = new ConcurrentHashMap<>();

  JsonTypeCoercer() {
    this(ImmutableSet.of());
  }

  JsonTypeCoercer(JsonTypeCoercer coercer, Iterable<TypeCoercer<?>> coercers) {
    this(
        ImmutableSet.<TypeCoercer<?>>builder()
            .addAll(coercers)
            .addAll(coercer.additionalCoercers)
            .build());
  }

  JsonTypeCoercer(Iterable<TypeCoercer<?>> coercers) {
    this.additionalCoercers = ImmutableSet.copyOf(coercers);

    //noinspection unchecked
    this.coercers =
        // Note: we call out when ordering matters.
        ImmutableSet.<TypeCoercer>builder()
            .addAll(coercers)
            // Types that don't contain other types first
            // From java
            .add(new BooleanCoercer())

            .add(new NumberCoercer<>(Byte.class, Number::byteValue))
            .add(new NumberCoercer<>(Double.class, Number::doubleValue))
            .add(new NumberCoercer<>(Float.class, Number::floatValue))
            .add(new NumberCoercer<>(Integer.class, Number::intValue))
            .add(new NumberCoercer<>(Long.class, Number::longValue))
            .add(
                new NumberCoercer<>(
                    Number.class,
                    num -> {
                      if (num.doubleValue() % 1 != 0) {
                        return num.doubleValue();
                      }
                      return num.longValue();
                    }))
            .add(new NumberCoercer<>(Short.class, Number::shortValue))
            .add(new StringCoercer())
            .add(new EnumCoercer())
            .add(new UriCoercer())
            .add(new UrlCoercer())
            .add(new UuidCoercer())

            // From Selenium
            .add(new MapCoercer<>(
                Capabilities.class,
                this,
                Collector.of(MutableCapabilities::new, (caps, entry) -> caps.setCapability((String) entry.getKey(), entry.getValue()), MutableCapabilities::merge, UNORDERED)))
            .add(new CommandCoercer())
            .add(new ResponseCoercer(this))
            .add(new SessionIdCoercer())

            // Container types
            .add(new CollectionCoercer<>(List.class, this, Collectors.toCollection(ArrayList::new)))
            .add(new CollectionCoercer<>(Set.class, this, Collectors.toCollection(HashSet::new)))

            .add(new MapCoercer<>(
                Map.class,
                this,
                Collector.of(LinkedHashMap::new, (map, entry) -> map.put(entry.getKey(), entry.getValue()), (l, r) -> { l.putAll(r); return l; }, UNORDERED, CONCURRENT)))

            // If the requested type is exactly "Object", do some guess work
            .add(new ObjectCoercer(this))

            .add(new StaticInitializerCoercer())

            // Order matters here: we want this to be the last called coercer
            .add(new InstanceCoercer(this))
            .build();
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
