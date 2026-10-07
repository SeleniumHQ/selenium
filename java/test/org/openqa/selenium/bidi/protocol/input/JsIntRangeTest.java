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

package org.openqa.selenium.bidi.protocol.input;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.bidi.BiDiException;
import org.openqa.selenium.bidi.protocol.browsingcontext.CssLocator;
import org.openqa.selenium.bidi.protocol.browsingcontext.LocateNodesParameters;

@Tag("UnitTests")
class JsIntRangeTest {

  private static final long JS_SAFE_INTEGER_MAX = 9007199254740991L; // 2^53 - 1

  // WheelScrollAction's x/y/deltaX/deltaY are all js-int — a signed field additionally bounded to
  // JavaScript's safe-integer range, which a plain "integer" (Long) alone doesn't enforce.

  @Test
  void jsIntAcceptsAValueAtTheExactPositiveBoundary() {
    WheelScrollAction action = new WheelScrollAction("scroll", JS_SAFE_INTEGER_MAX, 0, 0, 0);

    assertThat(action.getX()).isEqualTo(JS_SAFE_INTEGER_MAX);
  }

  @Test
  void jsIntAcceptsAValueAtTheExactNegativeBoundary() {
    WheelScrollAction action = new WheelScrollAction("scroll", -JS_SAFE_INTEGER_MAX, 0, 0, 0);

    assertThat(action.getX()).isEqualTo(-JS_SAFE_INTEGER_MAX);
  }

  @Test
  void jsIntRejectsAValueOnePastThePositiveBoundary() {
    assertThatThrownBy(() -> new WheelScrollAction("scroll", JS_SAFE_INTEGER_MAX + 1, 0, 0, 0))
        .isInstanceOf(BiDiException.class)
        .hasMessageContaining("x");
  }

  @Test
  void jsIntRejectsAValueOnePastTheNegativeBoundary() {
    assertThatThrownBy(() -> new WheelScrollAction("scroll", -JS_SAFE_INTEGER_MAX - 1, 0, 0, 0))
        .isInstanceOf(BiDiException.class)
        .hasMessageContaining("x");
  }

  // browsingContext.LocateNodesParameters.maxNodeCount is js-uint (unsigned) — same upper bound
  // as js-int, but 0 is the floor instead of -(2^53 - 1). It's optional, so this also exercises
  // the fluent setter path (a caller-created value), not just the constructor.

  private static LocateNodesParameters params() {
    return new LocateNodesParameters("context-1", new CssLocator("css", "div"));
  }

  @Test
  void jsUintRejectsANegativeValue() {
    assertThatThrownBy(() -> params().setMaxNodeCount(-1L))
        .isInstanceOf(BiDiException.class)
        .hasMessageContaining("maxNodeCount");
  }

  @Test
  void jsUintAcceptsZero() {
    LocateNodesParameters p = params().setMaxNodeCount(0L);

    assertThat(p.getMaxNodeCount()).contains(0L);
  }

  @Test
  void jsUintRejectsAValuePastTheSafeIntegerBound() {
    assertThatThrownBy(() -> params().setMaxNodeCount(JS_SAFE_INTEGER_MAX + 1))
        .isInstanceOf(BiDiException.class)
        .hasMessageContaining("maxNodeCount");
  }

  @Test
  void jsUintAcceptsTheExactBoundary() {
    LocateNodesParameters p = params().setMaxNodeCount(JS_SAFE_INTEGER_MAX);

    assertThat(p.getMaxNodeCount()).contains(JS_SAFE_INTEGER_MAX);
  }
}
