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
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.openqa.selenium.internal.Sets.*;

import java.util.Set;
import java.util.stream.Stream;
import org.junit.jupiter.api.Test;

class SetsTest {
  @Test
  void toSequencedSet_keepsOriginalOrdering() {
    Set<Integer> sorted = Stream.of(6, 2, 5, 1, 4, 3).collect(toSequencedSet());

    assertThat(sorted).containsExactly(6, 2, 5, 1, 4, 3);
    assertImmutable(sorted);
  }

  @Test
  void toSortedSet_sortsUsingNaturalOrder() {
    Set<Integer> sorted = Stream.of(6, 2, 5, 1, 4, 3).collect(toSortedSet());

    assertThat(sorted).containsExactly(1, 2, 3, 4, 5, 6);
    assertImmutable(sorted);
  }

  @Test
  void checksIfTwoSetsHaveCommonElements() {
    assertThat(haveCommonElements(Set.of(1, 2, 3), Set.of(4, 5, 6))).isFalse();
    assertThat(haveCommonElements(Set.of(1, 2, 3), Set.of(4, 5, 3))).isTrue();
    assertThat(haveCommonElements(Set.of(1, 2, 3, 4, 5), Set.of(4, 5))).isTrue();
    assertThat(haveCommonElements(Set.of(1, 2, 3), Set.of(9, 8, 7, 6, 5, 4, 3))).isTrue();
    assertThat(haveCommonElements(Set.of(1, 2, 3), Set.of(9, 8, 7, 6, 5, 4, 3, 2))).isTrue();
    assertThat(haveCommonElements(Set.of(1, 2, 3), Set.of(9, 8, 7, 6, 5, 4, 3, 2, 1))).isTrue();
  }

  @Test
  void sortedSet_usesNaturalOrdering() {
    Set<Integer> set = sortedSet(Set.of(9, 8, 7, 6, 5, 4, 3, 2, 1));
    assertThat(set).containsExactly(1, 2, 3, 4, 5, 6, 7, 8, 9);
    assertImmutable(set);
  }

  @Test
  void sortedSet_2() {
    Set<String> set = sortedSetOf("Vanessa", "Agnessa");
    assertThat(set).containsExactly("Agnessa", "Vanessa");
    assertImmutable(set, "John");
  }

  @Test
  void sequencedSetOf_2() {
    Set<String> set = sequencedSetOf("Vanessa", "Agnessa");
    assertThat(set).containsExactly("Vanessa", "Agnessa");
    assertImmutable(set, "John");
  }

  @Test
  void sequencedSetOf_3() {
    Set<String> set = sequencedSetOf("Leela", "Bender", "Fry");
    assertThat(set).containsExactly("Leela", "Bender", "Fry");
    assertImmutable(set, "Bender");
  }

  @Test
  void sequencedSetOf_4() {
    Set<String> set = sequencedSetOf("Leela", "Bender", "Fry", "Zoidberg");
    assertThat(set).containsExactly("Leela", "Bender", "Fry", "Zoidberg");
    assertImmutable(set, "Bender");
  }

  @Test
  void sequencedSetOf_5() {
    Set<String> set = sequencedSetOf("Leela", "Bender", "Fry", "Zoidberg", "Nibbler");
    assertThat(set).containsExactly("Leela", "Bender", "Fry", "Zoidberg", "Nibbler");
    assertImmutable(set, "Bender");
  }

  private static void assertImmutable(Set<Integer> set) {
    assertImmutable(set, 42);
  }

  private static <T> void assertImmutable(Set<T> sorted, T sample) {
    assertThatThrownBy(() -> sorted.add(sample)).isInstanceOf(UnsupportedOperationException.class);
    assertThatThrownBy(() -> sorted.remove(sample))
        .isInstanceOf(UnsupportedOperationException.class);
  }
}
