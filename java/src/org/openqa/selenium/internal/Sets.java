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

import static java.util.Collections.addAll;
import static java.util.Collections.unmodifiableSet;
import static java.util.stream.Collectors.collectingAndThen;
import static java.util.stream.Collectors.toCollection;

import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.TreeSet;
import java.util.stream.Collector;

public class Sets {
  @SafeVarargs
  public static <T> Set<T> orderedSetOf(T... values) {
    Set<T> set = new LinkedHashSet<>();
    addAll(set, values);
    return unmodifiableSet(set);
  }

  @SafeVarargs
  public static <T extends Comparable<T>> Set<T> sortedSetOf(T... values) {
    Set<T> set = new TreeSet<>();
    addAll(set, values);
    return unmodifiableSet(set);
  }

  /** Collects stream to immutable set in which elements are sorted using natural order */
  public static <T extends Comparable<? super T>> Collector<T, ?, Set<T>> toImmutableSortedSet() {
    return collectingAndThen(toCollection(TreeSet::new), Collections::unmodifiableSet);
  }

  /**
   * Collects stream to immutable set that keeps elements in the same order as the original stream
   */
  public static <T> Collector<T, ?, Set<T>> toImmutableSet() {
    return collectingAndThen(toCollection(LinkedHashSet::new), Collections::unmodifiableSet);
  }

  /** Returns an immutable set whose elements are ordered by their natural ordering. */
  public static <T extends Comparable<? super T>> Set<T> sortedSet(Set<T> source) {
    return unmodifiableSet(new TreeSet<>(source));
  }

  public static <T> boolean haveCommonElements(Set<T> set1, Set<T> set2) {
    return set1.stream().anyMatch(set2::contains);
  }
}
