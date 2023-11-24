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

import java.util.Collections;
import java.util.Iterator;
import java.util.function.Function;
import java.util.stream.Stream;

public class Either<A, B> implements Iterable<B> {
  private final A left;
  private final B right;

  private Either(A a, B b) {
    left = a;
    right = b;
  }

  public static <A, B> Either<A, B> left(A a) {
    return new Either<>(a, null);
  }

  public static <A, B> Either<A, B> right(B b) {
    return new Either<>(null, b);
  }

  public boolean isLeft() {
    return left != null;
  }

  public boolean isRight() {
    return right != null;
  }

  public A left() {
    return left;
  }

  public B right() {
    return right;
  }

  public <R> R map(Function<? super B, ? extends R> mapper) {
    Require.nonNull("Mapper", mapper);
    return mapper.apply(right());
  }

  public <R> R mapLeft(Function<? super A, ? extends R> mapper) {
    Require.nonNull("Mapper", mapper);
    return mapper.apply(left());
  }

  @Override
  public Iterator<B> iterator() {
    return Collections.singleton(right()).iterator();
  }

  public Stream<B> stream() {
    return Stream.of(right());
  }

  @Override
  public String toString() {
    return "[Either(" + (isLeft() ? "left" : "right") + "): " + (isLeft() ? left() : right()) + "]";
  }
}
