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

package org.openqa.selenium.internal;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.logging.ConsoleHandler;
import java.util.logging.Handler;
import java.util.logging.Level;
import java.util.logging.LogRecord;
import java.util.logging.Logger;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

@Tag("UnitTests")
class DebugTest {

  private static final Logger SELENIUM_LOGGER = Logger.getLogger("org.openqa.selenium");

  private String oldDebugProperty;
  private String oldVerboseProperty;

  @BeforeEach
  void storeSystemProperties() {
    oldDebugProperty = System.getProperty("selenium.debug");
    oldVerboseProperty = System.getProperty("selenium.webdriver.verbose");
    System.clearProperty("selenium.debug");
    System.clearProperty("selenium.webdriver.verbose");
  }

  @AfterEach
  void restoreSystemProperties() {
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
    // Re-sync configureLogger's internal state/handler with the now-restored properties so a
    // handler installed by one test never leaks into the next.
    Debug.configureLogger();
  }

  @Test
  void isDebuggingReflectsPropertySetAfterClassLoad() {
    assertThat(Debug.isDebugging()).isFalse();

    System.setProperty("selenium.debug", "true");

    assertThat(Debug.isDebugging()).isTrue();
  }

  @Test
  void isDebuggingHonoursTheLegacyVerboseProperty() {
    assertThat(Debug.isDebugging()).isFalse();

    System.setProperty("selenium.webdriver.verbose", "true");

    assertThat(Debug.isDebugging()).isTrue();
  }

  @Test
  void configureLoggerRaisesSeleniumLoggerToFine() {
    System.setProperty("selenium.debug", "true");

    Debug.configureLogger();

    assertThat(SELENIUM_LOGGER.getLevel()).isEqualTo(Level.FINE);
  }

  @Test
  void configureLoggerRestoresPreviousLevelWhenDebuggingIsTurnedOff() {
    SELENIUM_LOGGER.setLevel(Level.WARNING);
    System.setProperty("selenium.debug", "true");
    Debug.configureLogger();
    assertThat(SELENIUM_LOGGER.getLevel()).isEqualTo(Level.FINE);

    System.clearProperty("selenium.debug");
    Debug.configureLogger();

    assertThat(SELENIUM_LOGGER.getLevel()).isEqualTo(Level.WARNING);
  }

  @Test
  void configureLoggerIsIdempotent() {
    int before = SELENIUM_LOGGER.getHandlers().length;
    System.setProperty("selenium.debug", "true");

    for (int i = 0; i < 5; i++) {
      Debug.configureLogger();
    }

    assertThat(SELENIUM_LOGGER.getHandlers().length - before).isEqualTo(1);
  }

  @Test
  void configureLoggerLeavesUserHandlersAlone() {
    Handler userHandler = new ConsoleHandler();
    SELENIUM_LOGGER.addHandler(userHandler);
    try {
      System.setProperty("selenium.debug", "true");
      Debug.configureLogger();
      assertThat(SELENIUM_LOGGER.getHandlers()).contains(userHandler);

      System.clearProperty("selenium.debug");
      Debug.configureLogger();
      assertThat(SELENIUM_LOGGER.getHandlers()).contains(userHandler);
    } finally {
      SELENIUM_LOGGER.removeHandler(userHandler);
    }
  }

  @Test
  void infoRecordsAreNotDuplicatedWhenDebuggingIsEnabled() {
    System.setProperty("selenium.debug", "true");
    Debug.configureLogger();

    Handler[] handlers = SELENIUM_LOGGER.getHandlers();
    assertThat(handlers).hasSize(1);
    Handler seleniumOwnedHandler = handlers[0];

    // Selenium's own handler must stay silent for INFO-and-above records so it never prints the
    // same line the caller's own (e.g. root/console) handler already prints for them; it exists
    // only to surface the FINE-and-below records those handlers don't.
    assertThat(seleniumOwnedHandler.isLoggable(new LogRecord(Level.INFO, "info-record")))
        .isFalse();
    assertThat(seleniumOwnedHandler.isLoggable(new LogRecord(Level.WARNING, "warning-record")))
        .isFalse();
    assertThat(seleniumOwnedHandler.isLoggable(new LogRecord(Level.FINE, "fine-record")))
        .isTrue();
  }

  @Test
  @SuppressWarnings({"deprecation", "removal"})
  void getDebugLogLevelStillReportsInfoWhileDeprecated() {
    System.setProperty("selenium.debug", "true");
    assertThat(Debug.getDebugLogLevel()).isEqualTo(Level.INFO);

    System.clearProperty("selenium.debug");
    assertThat(Debug.getDebugLogLevel()).isEqualTo(Level.FINE);
  }
}
