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

package org.openqa.selenium.internal;

import static java.util.Collections.unmodifiableMap;

import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Set;
import java.util.function.BiConsumer;

/**
 * A map that can hold multiple values for every key. NB! It holds only unique values per each key
 * (no duplicates).
 */
public class Multimap<K, V> {
  private final Map<K, Set<V>> map = new LinkedHashMap<>();

  public Multimap() {}

  public Multimap(Multimap<K, V> source) {
    map.putAll(source.map);
  }

  public Multimap<K, V> put(K key, V value) {
    map.computeIfAbsent(key, __ -> new LinkedHashSet<>()).add(value);
    return this;
  }

  /**
   * Add given values for the given key.
   *
   * <p>If this map already contains some of the {@code values}, they will be ignored.
   *
   * <p>If {@code values} contains duplicates, only the first of them will be added.
   */
  public Multimap<K, V> putAll(K key, Collection<V> values) {
    map.computeIfAbsent(key, __ -> new LinkedHashSet<>()).addAll(values);
    return this;
  }

  public boolean isEmpty() {
    return map.isEmpty();
  }

  public Map<K, Collection<V>> asMap() {
    return unmodifiableMap(map);
  }

  public Set<K> keySet() {
    return map.keySet();
  }

  public void forEach(BiConsumer<K, V> consumer) {
    map.forEach((key, values) -> values.forEach(value -> consumer.accept(key, value)));
  }
}
