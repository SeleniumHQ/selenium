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

import java.nio.file.Path;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

class SetDownloadBehaviorParametersTest {
  @Test
  void denied() {
    SetDownloadBehaviorParameters params =
        new SetDownloadBehaviorParameters(DownloadBehavior.denied());
    assertThat(params.toMap())
        .containsExactlyInAnyOrderEntriesOf(Map.of("downloadBehavior", Map.of("type", "denied")));
  }

  @Test
  void denied_withUserContexts() {
    SetDownloadBehaviorParameters params =
        new SetDownloadBehaviorParameters(DownloadBehavior.denied())
            .userContexts(List.of("window1", "tab2", "frame3"));

    assertThat(params.toMap())
        .containsExactlyInAnyOrderEntriesOf(
            Map.of(
                "downloadBehavior", Map.of("type", "denied"),
                "userContexts", List.of("window1", "tab2", "frame3")));
  }

  @Test
  void allowed() {
    SetDownloadBehaviorParameters params =
        new SetDownloadBehaviorParameters(DownloadBehavior.allowed(Path.of("/tmp/downloads")));
    assertThat(params.toMap())
        .containsExactlyInAnyOrderEntriesOf(
            Map.of(
                "downloadBehavior",
                Map.of("type", "allowed", "destinationFolder", "/tmp/downloads")));
  }

  @Test
  void allowed_withUserContexts() {
    SetDownloadBehaviorParameters params =
        new SetDownloadBehaviorParameters(DownloadBehavior.allowed(Path.of("/tmp/downloads")))
            .userContexts(List.of("window1", "tab2", "frame3"));

    assertThat(params.toMap())
        .containsExactlyInAnyOrderEntriesOf(
            Map.of(
                "downloadBehavior",
                    Map.of("type", "allowed", "destinationFolder", "/tmp/downloads"),
                "userContexts", List.of("window1", "tab2", "frame3")));
  }

  @Test
  void stringRepresentation() {
    SetDownloadBehaviorParameters params =
        new SetDownloadBehaviorParameters(DownloadBehavior.allowed(Path.of("/tmp/downloads")));

    assertThat(params.toString())
        .contains(
            "SetDownloadBehaviorParameters{",
            "downloadBehavior=",
            "destinationFolder=/tmp/downloads",
            "type=allowed");
  }
}
