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

/** All methods return immutable objects */
public class Sets {
  /** Create an immutable Set that keeps the order of elements */
  @SafeVarargs
  public static <T> Set<T> sequencedSetOf(T... values) {
    Set<T> set = new LinkedHashSet<>();
    addAll(set, values);
    return unmodifiableSet(set);
  }

  /** Create an immutable set that sorts its elements in natural order */
  @SafeVarargs
  public static <T extends Comparable<T>> Set<T> sortedSetOf(T... values) {
    Set<T> set = new TreeSet<>();
    addAll(set, values);
    return unmodifiableSet(set);
  }

  /** Collects a stream into an immutable set sorted in natural order */
  public static <T extends Comparable<? super T>> Collector<T, ?, Set<T>> toSortedSet() {
    return collectingAndThen(toCollection(TreeSet::new), Collections::unmodifiableSet);
  }

  /**
   * Collects stream to immutable set that keeps elements in the same order as the original stream
   */
  public static <T> Collector<T, ?, Set<T>> toSequencedSet() {
    return collectingAndThen(toCollection(LinkedHashSet::new), Collections::unmodifiableSet);
  }

  /** Create an immutable set sorted in natural order */
  public static <T extends Comparable<? super T>> Set<T> sortedSet(Set<T> source) {
    return unmodifiableSet(new TreeSet<>(source));
  }

  /** Check if two sets have at least one common element */
  public static <T> boolean haveCommonElements(Set<T> set1, Set<T> set2) {
    return set1.stream().anyMatch(set2::contains);
  }
}
