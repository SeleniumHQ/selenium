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

import java.util.Iterator;
import java.util.List;
import java.util.stream.Collectors;
import org.junit.jupiter.api.Test;

class EitherTest {

  @Test
  void streamOnLeftValueShouldBeEmpty() {
    Either<String, Integer> either = Either.left("error");
    List<Integer> result = either.stream().collect(Collectors.toList());
    assertThat(result).isEmpty();
  }

  @Test
  void streamOnRightValueShouldContainRight() {
    Either<String, Integer> either = Either.right(42);
    List<Integer> result = either.stream().collect(Collectors.toList());
    assertThat(result).containsExactly(42);
  }

  @Test
  void iteratorOnLeftValueShouldBeEmpty() {
    Either<String, Integer> either = Either.left("error");
    Iterator<Integer> it = either.iterator();
    assertThat(it.hasNext()).isFalse();
  }

  @Test
  void iteratorOnRightValueShouldContainRight() {
    Either<String, Integer> either = Either.right(42);
    Iterator<Integer> it = either.iterator();
    assertThat(it.hasNext()).isTrue();
    assertThat(it.next()).isEqualTo(42);
    assertThat(it.hasNext()).isFalse();
  }
}
