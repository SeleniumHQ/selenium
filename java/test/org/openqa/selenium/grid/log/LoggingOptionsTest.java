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
import java.util.logging.Level;
import java.util.logging.Logger;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.grid.config.MapConfig;
import org.openqa.selenium.internal.Debug;

@Tag("UnitTests")
class LoggingOptionsTest {

  private String oldDebugProperty;
  // Legacy alias for selenium.debug -- Debug.isDebugging() honors either, so a test JVM that
  // happens to have this set externally must not leak into the "no switch" baseline assertions.
  private String oldVerboseProperty;
  private Level oldSeleniumLoggerLevel;

  @BeforeEach
  void storeSystemProperty() {
    oldDebugProperty = System.getProperty("selenium.debug");
    oldVerboseProperty = System.getProperty("selenium.webdriver.verbose");
    oldSeleniumLoggerLevel = Logger.getLogger("org.openqa.selenium").getLevel();
    System.clearProperty("selenium.debug");
    System.clearProperty("selenium.webdriver.verbose");
  }

  @AfterEach
  void restoreSystemProperty() {
    if (oldDebugProperty != null) {
      System.setProperty("selenium.debug", oldDebugProperty);
    } else {
      System.clearProperty("selenium.debug");
    }
    if (oldVerboseProperty != null) {
      System.setProperty("selenium.webdriver.verbose", oldVerboseProperty);
    } else {
      System.clearProperty("selenium.webdriver.verbose");
    }
    // Reverts whatever configureLogging() may have done to the shared org.openqa.selenium logger
    // via Debug.configureLogger() during the test, now that the properties are back to their
    // original values.
    Debug.configureLogger();
    Logger.getLogger("org.openqa.selenium").setLevel(oldSeleniumLoggerLevel);
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

  @Test
  void configureLoggingRaisesSeleniumLoggerEvenWithExternalJulConfigSet() {
    // configureLogging() early-returns once an external java.util.logging.config.* property is
    // detected, handing the rest of logging setup off entirely. Debug.configureLogger() must still
    // run before that early return, or Selenium's own FINE-level wire diagnostics stay invisible
    // under -Dselenium.debug=true whenever an operator has such a property set.
    System.setProperty("selenium.debug", "true");
    String oldConfigFile = System.getProperty("java.util.logging.config.file");
    System.setProperty("java.util.logging.config.file", "does-not-need-to-exist.properties");
    try {
      new LoggingOptions(emptyConfig()).configureLogging();

      assertThat(Logger.getLogger("org.openqa.selenium").getLevel()).isEqualTo(Level.FINE);
    } finally {
      if (oldConfigFile != null) {
        System.setProperty("java.util.logging.config.file", oldConfigFile);
      } else {
        System.clearProperty("java.util.logging.config.file");
      }
    }
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
