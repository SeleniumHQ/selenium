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

import java.nio.file.Path;
import java.util.Map;
import org.junit.jupiter.api.Test;

class DownloadBehaviorTest {
  @Test
  void allowed_toMap() {
    assertThat(new DownloadBehavior(true, "/Downloads").toMap())
        .containsExactlyInAnyOrderEntriesOf(
            Map.of(
                "type", "allowed",
                "destinationFolder", "/Downloads"));
  }

  @Test
  void denied_toMap() {
    assertThat(new DownloadBehavior(false, (String) null).toMap())
        .containsExactlyInAnyOrderEntriesOf(Map.of("type", "denied"));
  }

  @Test
  void allowed_shouldHaveFolder() {
    assertThatThrownBy(() -> new DownloadBehavior(true, (Path) null))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessage("destinationFolder must be set");
  }

  @Test
  void denied_shouldNotHaveFolder() {
    assertThatThrownBy(() -> new DownloadBehavior(false, "/tmp"))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessage("destinationFolder must not be set");
  }

  @Test
  void stringRepresentation() {
    assertThat(DownloadBehavior.allowed(Path.of("/tmp")))
        .hasToString("DownloadBehavior{allowed=true, destinationFolder=/tmp}");
  }
}
