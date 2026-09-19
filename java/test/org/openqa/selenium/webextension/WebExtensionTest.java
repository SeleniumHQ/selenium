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

package org.openqa.selenium.webextension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;

class WebExtensionTest {

  @Test
  void exposesTheId() {
    assertThat(new WebExtension("addon@example.com").getId()).isEqualTo("addon@example.com");
  }

  @Test
  void rejectsANullId() {
    assertThatThrownBy(() -> new WebExtension(null)).isInstanceOf(IllegalArgumentException.class);
  }

  @Test
  void hasValueEquality() {
    assertThat(new WebExtension("a"))
        .isEqualTo(new WebExtension("a"))
        .isNotEqualTo(new WebExtension("b"));
    assertThat(new WebExtension("a").hashCode()).isEqualTo(new WebExtension("a").hashCode());
  }

  @Test
  void toStringMentionsTheId() {
    assertThat(new WebExtension("addon@example.com").toString()).contains("addon@example.com");
  }
}
