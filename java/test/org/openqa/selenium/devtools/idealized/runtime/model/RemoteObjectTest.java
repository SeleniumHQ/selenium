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

package org.openqa.selenium.devtools.idealized.runtime.model;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import org.junit.jupiter.api.Test;

class RemoteObjectTest {
  @Test
  void toString_embracesStringValueInQuotes() {
    assertThat(new RemoteObject("foo", "bar"))
        .hasToString(
            """
            "bar"
            """
                .trim());
  }

  @Test
  void toString_escapesQuotesInStringValue() {
    assertThat(new RemoteObject("foo", "bar\"baz"))
        .hasToString(
            """
            "bar\\"baz"
            """
                .trim());
  }

  @Test
  void toString_withNonStringValues() {
    assertThat(new RemoteObject("foo", 42)).hasToString("42");
    assertThat(new RemoteObject("foo", false)).hasToString("false");
    assertThat(new RemoteObject("foo", List.of("a", "b", "c"))).hasToString("[a, b, c]");
  }

  @Test
  void toString_withNullValue() {
    assertThat(new RemoteObject("foo", null)).hasToString("null");
  }
}
