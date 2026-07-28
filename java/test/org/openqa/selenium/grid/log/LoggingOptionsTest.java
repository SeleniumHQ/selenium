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

package org.openqa.selenium.grid.log;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.ByteArrayOutputStream;
import java.io.PrintStream;
import java.util.Map;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.grid.config.MapConfig;

@Tag("UnitTests")
class LoggingOptionsTest {

  private String oldDebugProperty;

  @BeforeEach
  void storeSystemProperty() {
    oldDebugProperty = System.getProperty("selenium.debug");
    System.clearProperty("selenium.debug");
  }

  @AfterEach
  void restoreSystemProperty() {
    if (oldDebugProperty != null) {
      System.setProperty("selenium.debug", oldDebugProperty);
    } else {
      System.clearProperty("selenium.debug");
    }
  }

  @Test
  void setLoggingLevelForcesFineWhenSeleniumDebugPropertyIsSet() {
    System.setProperty("selenium.debug", "true");

    String output = captureStderrDuring(() -> new LoggingOptions(emptyConfig()).setLoggingLevel());

    // Before this change, only the SE_DEBUG environment variable (isDebugAll()) forced Grid's log
    // level to FINE; -Dselenium.debug=true had no effect on Grid at all. Grid operators using that
    // property must not silently lose Grid diagnostic output now that RemoteWebDriver's
    // configureLogger() reacts to it too.
    assertThat(output).contains("forcing Grid log level to FINE");
  }

  @Test
  void setLoggingLevelDoesNotForceFineWhenNoDebugSwitchIsSet() {
    String output = captureStderrDuring(() -> new LoggingOptions(emptyConfig()).setLoggingLevel());

    assertThat(output).doesNotContain("forcing Grid log level to FINE");
  }

  private static MapConfig emptyConfig() {
    return new MapConfig(Map.of());
  }

  private static String captureStderrDuring(Runnable action) {
    PrintStream originalErr = System.err;
    ByteArrayOutputStream captured = new ByteArrayOutputStream();
    try {
      System.setErr(new PrintStream(captured));
      action.run();
    } finally {
      System.setErr(originalErr);
    }
    return captured.toString();
  }
}
