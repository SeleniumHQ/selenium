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

import static org.assertj.core.api.Assertions.assertThat;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class MultimapTest {
  Multimap<Integer, String> map = new Multimap<>();

  @BeforeEach
  void setUp() {
    map.put(6, "Leela");
    map.put(7, "Bender");
    map.put(6, "Fry");
  }

  @Test
  void canHaveMultipleValuesPerKey() {
    assertThat(map.asMap())
        .containsExactlyInAnyOrderEntriesOf(
            Map.of(
                6, Set.of("Leela", "Fry"),
                7, Set.of("Bender")));
  }

  @Test
  void canCopyExistingMultimap() {
    Multimap<Integer, String> newMap = new Multimap<>(map);
    map.put(8, "Zoidberg");
    map.put(8, "Nibbler");
    assertThat(newMap.asMap())
        .containsExactlyInAnyOrderEntriesOf(
            Map.of(
                6, Set.of("Leela", "Fry"),
                7, Set.of("Bender")));
  }

  @Test
  void addAll() {
    Multimap<Integer, String> newMap = new Multimap<>();
    newMap.putAll(4, List.of("Leela", "Fry", "Leela", "Fry"));
    newMap.putAll(4, List.of("Zoidberg", "Nibbler"));
    newMap.putAll(4, List.of("Nibbler", "Fry"));

    assertThat(newMap.asMap()).hasSize(1);
    assertThat(newMap.asMap().get(4))
        .containsExactlyInAnyOrder("Leela", "Fry", "Zoidberg", "Nibbler");
  }

  @Test
  void isEmpty() {
    assertThat(map.isEmpty()).isFalse();
    assertThat(new Multimap<>().isEmpty()).isTrue();
  }

  @Test
  void keySet() {
    assertThat(map.keySet()).containsExactly(6, 7);
  }

  @Test
  void forEach() {
    Map<Integer, AtomicInteger> counters = new HashMap<>();
    map.forEach(
        (id, name) -> {
          counters.computeIfAbsent(id, __ -> new AtomicInteger(0)).incrementAndGet();
        });
    assertThat(counters).hasSize(2);
    assertThat(counters.get(6).get()).isEqualTo(2);
    assertThat(counters.get(7).get()).isEqualTo(1);
  }
}
