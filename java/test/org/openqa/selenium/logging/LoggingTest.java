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

package org.openqa.selenium.logging;

import static java.util.logging.Level.ALL;
import static java.util.logging.Level.FINE;
import static java.util.logging.Level.INFO;
import static java.util.logging.Level.OFF;
import static java.util.logging.Level.SEVERE;
import static java.util.logging.Level.WARNING;
import static org.assertj.core.api.Assertions.assertThat;
import static org.openqa.selenium.logging.LogLevelMapping.toLevel;

import java.util.Map;
import java.util.logging.Level;
import org.junit.jupiter.api.Test;

class LoggingTest {

  @Test
  void testLogLevelConversions() {
    assertThat(toLevel("ALL")).isEqualTo(ALL);
    assertThat(toLevel("DEBUG")).isEqualTo(FINE);
    assertThat(toLevel("INFO")).isEqualTo(INFO);
    assertThat(toLevel("WARNING")).isEqualTo(WARNING);
    assertThat(toLevel("SEVERE")).isEqualTo(SEVERE);
    assertThat(toLevel("OFF")).isEqualTo(OFF);
  }

  @Test
  void canCompareLoggingPreferences() {
    LoggingPreferences prefs1 = new LoggingPreferences();
    LoggingPreferences prefs2 = new LoggingPreferences();
    assertThat(prefs2).isEqualTo(prefs1);

    prefs1.enable(LogType.BROWSER, Level.ALL);
    assertThat(prefs1).isNotEqualTo(prefs2);

    prefs2.enable(LogType.BROWSER, Level.ALL);
    assertThat(prefs2).isEqualTo(prefs1);
  }

  @Test
  void canRepresentLogEntryAsJson() {
    long timestamp = 1572882588202L;
    LogEntry entry = new LogEntry(INFO, timestamp, "There is no more cheese");
    Map<String, Object> json = entry.toJson();
    assertThat(json)
        .containsEntry("timestamp", timestamp)
        .containsEntry("level", INFO)
        .containsEntry("message", "There is no more cheese");
  }

  @Test
  void canRepresentLogEntryAsString() {
    long timestamp = 1572882588202L;
    LogEntry entry = new LogEntry(INFO, timestamp, "There is no more cheese");
    assertThat(entry.toString())
        .isEqualTo("[2019-11-04T15:49:48.202Z] [INFO] There is no more cheese");
  }
}
