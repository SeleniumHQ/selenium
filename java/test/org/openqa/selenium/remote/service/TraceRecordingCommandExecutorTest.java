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

package org.openqa.selenium.remote.service;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

@Tag("UnitTests")
class TraceRecordingCommandExecutorTest {

  @Test
  void findsProxyUrlAmongLogLines() {
    String output =
        "[2026-11-19T13:51:43.824Z DEBUG] Starting driver in pipe mode: /usr/bin/chromedriver\r\n"
            + "{\"driver_path\":\"/usr/bin/chromedriver\",\"proxy_url\":\"http://127.0.0.1:43341\"}\n"
            + "[2026-11-19T13:51:43.863Z DEBUG] Pipe mode proxy listening\n";

    assertThat(TraceRecordingCommandExecutor.findProxyUrl(output))
        .isEqualTo("http://127.0.0.1:43341");
  }

  @Test
  void ignoresOutputWithoutAValidReadyLine() {
    assertThat(TraceRecordingCommandExecutor.findProxyUrl("")).isNull();
    assertThat(TraceRecordingCommandExecutor.findProxyUrl("[INFO] proxy_url not yet\n")).isNull();
    assertThat(TraceRecordingCommandExecutor.findProxyUrl("{\"proxy_url\": broken")).isNull();
  }
}
