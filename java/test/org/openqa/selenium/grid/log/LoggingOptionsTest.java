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
import java.io.IOException;
import java.io.PrintStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;
import java.util.UUID;
import java.util.logging.Handler;
import java.util.logging.Level;
import java.util.logging.LogManager;
import java.util.logging.LogRecord;
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

  @Test
  void configureLoggingPreservesDebugHandlerWhenNoExternalJulConfigIsSet() {
    // configureLogging() enumerates every registered logger and strips its handlers so Grid's own
    // console setup starts from a clean slate. org.openqa.selenium stays registered throughout
    // (Debug holds a strong static reference to it), so the handler Debug.configureLogger() just
    // installed one line above used to get swept up in that too: removed before configureLogging()
    // returned, leaving debug mode silently broken since Debug's bookkeeping has no way to learn
    // its handler was removed out from under it.
    System.setProperty("selenium.debug", "true");

    new LoggingOptions(emptyConfig()).configureLogging();

    Logger seleniumLogger = Logger.getLogger("org.openqa.selenium");
    Handler[] handlers = seleniumLogger.getHandlers();
    assertThat(handlers).hasSize(1);
    assertThat(handlers[0].getLevel()).isEqualTo(Level.FINE);

    LogRecord infoRecord = new LogRecord(Level.INFO, "info message");
    LogRecord fineRecord = new LogRecord(Level.FINE, "fine message");
    assertThat(handlers[0].isLoggable(infoRecord)).isFalse();
    assertThat(handlers[0].isLoggable(fineRecord)).isTrue();
  }

  @Test
  void configureLoggingDoesNotDuplicateSeleniumDebugRecordsThroughGridsRootHandler()
      throws IOException {
    // Debug.configureLogger() (called one line into configureLogging()) installs a handler
    // directly on org.openqa.selenium that already prints FINE/CONFIG-range records to stderr --
    // it never disables useParentHandlers, so those same records also propagate up to whatever
    // handler(s) configureLogging() itself then attaches to the ROOT logger a few lines later.
    // Nothing stopped Grid's own root handler from ALSO accepting them: a FINE record from any
    // org.openqa.selenium(.*) logger got printed twice, once by each handler. INFO-and-above
    // records must be unaffected -- Debug's own handler already excludes those, so they only ever
    // reached Grid's root handler in the first place.
    System.setProperty("selenium.debug", "true");
    Path logFile = Files.createTempFile("logging-options-test", ".log");
    String marker = "duplicate-check-" + UUID.randomUUID();
    try {
      String seleniumErr =
          captureStderrDuring(
              () -> {
                new LoggingOptions(
                        new MapConfig(
                            Map.of(
                                "logging",
                                Map.of("log-file", logFile.toAbsolutePath().toString()))))
                    .configureLogging();
                Logger.getLogger("org.openqa.selenium.grid.log.LoggingOptionsTest").fine(marker);
              });

      // Debug's own handler on org.openqa.selenium must still print it -- unchanged behavior.
      assertThat(seleniumErr).contains(marker);
      // Grid's root handler must not ALSO print it now that the two ranges overlap.
      String gridLog = Files.readString(logFile);
      assertThat(gridLog).doesNotContain(marker);
      // INFO+ output Grid already prints (e.g. its own "Using encoding" startup line) must still
      // reach the file -- only the FINE/CONFIG range Debug's handler already owns is suppressed.
      assertThat(gridLog).contains("Using");
    } finally {
      for (Handler handler : LogManager.getLogManager().getLogger("").getHandlers()) {
        handler.close();
      }
      Files.deleteIfExists(logFile);
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
