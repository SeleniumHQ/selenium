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

package org.openqa.selenium.concurrent;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

@Tag("UnitTests")
public class LazyTest {
  private final AtomicInteger counter = new AtomicInteger(0);

  @Test
  void trivialCase() {
    Lazy expression = Lazy.lazy(() -> "constant");
    assertThat(expression.get()).isEqualTo("constant");
    assertThat(expression.getIfInitialized()).contains("constant");
  }

  @Test
  void getIfInitialized_returnsNothing_ifNotInitializedYet() {
    Lazy expression = Lazy.lazy(() -> "value#" + counter.incrementAndGet());
    assertThat(expression.getIfInitialized()).isEmpty();
  }

  @Test
  void lazyEvaluatedExpression() {
    Lazy expression = Lazy.lazy(() -> "value#" + counter.incrementAndGet());
    assertThat(expression.get()).isEqualTo("value#1");
    assertThat(expression.get()).isEqualTo("value#1");
    assertThat(expression.getIfInitialized()).contains("value#1");
    assertThat(expression.getIfInitialized()).contains("value#1");
  }

  @Test
  void differentLazyInstances_produce_differentValues() {
    Lazy expression1 = Lazy.lazy(() -> "one#" + counter.incrementAndGet());
    Lazy expression2 = Lazy.lazy(() -> "two#" + counter.incrementAndGet());
    assertThat(expression1.get()).isEqualTo("one#1");
    assertThat(expression1.getIfInitialized()).contains("one#1");
    assertThat(expression2.getIfInitialized()).isEmpty();

    assertThat(expression2.get()).isEqualTo("two#2");
    assertThat(expression2.getIfInitialized()).contains("two#2");

    assertThat(expression1.get()).isEqualTo("one#1");
    assertThat(expression2.get()).isEqualTo("two#2");
  }
}
