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

package org.openqa.selenium.bidi.protocol.log;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Map;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.json.Json;

@Tag("UnitTests")
class EntryTest {

  @Test
  void consoleLogEntryWithAStringArgDeserializes() {
    String raw =
        "{\"type\":\"console\",\"level\":\"info\",\"method\":\"log\","
            + "\"source\":{\"realm\":\"r1\",\"context\":\"c1\"},"
            + "\"text\":\"Hello, world!\",\"timestamp\":1,"
            + "\"args\":[{\"type\":\"string\",\"value\":\"Hello, world!\"}]}";

    @SuppressWarnings("unchecked")
    Map<String, Object> map = (Map<String, Object>) new Json().toType(raw, Json.MAP_TYPE);

    Entry entry = Entry.fromMap(map);

    assertThat(entry).isInstanceOf(ConsoleLogEntry.class);
    ConsoleLogEntry consoleLogEntry = (ConsoleLogEntry) entry;
    assertThat(consoleLogEntry.getArgs()).hasSize(1);
  }
}
