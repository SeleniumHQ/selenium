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

package org.openqa.selenium.bidi.browser;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;

class ClientWindowStateTest {
  @Test
  void fromString() {
    assertThat(ClientWindowState.fromString("fullscreen")).isEqualTo(ClientWindowState.FULLSCREEN);
    assertThat(ClientWindowState.fromString("maximized")).isEqualTo(ClientWindowState.MAXIMIZED);
    assertThat(ClientWindowState.fromString("minimized")).isEqualTo(ClientWindowState.MINIMIZED);
    assertThat(ClientWindowState.fromString("normal")).isEqualTo(ClientWindowState.NORMAL);

    assertThatThrownBy(() -> ClientWindowState.fromString("unknown"))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessage("Invalid window state: unknown");
  }

  @ParameterizedTest
  @EnumSource(ClientWindowState.class)
  void otherEnumValues(ClientWindowState state) {
    assertThat(ClientWindowState.fromString(state.toString())).isEqualTo(state);
  }
}
