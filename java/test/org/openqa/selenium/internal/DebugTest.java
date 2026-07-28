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

import java.io.ByteArrayOutputStream;
import java.io.PrintStream;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
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
  private Level oldLoggerLevel;

  @BeforeEach
  void storeSystemProperties() {
    oldDebugProperty = System.getProperty("selenium.debug");
    oldVerboseProperty = System.getProperty("selenium.webdriver.verbose");
    oldLoggerLevel = SELENIUM_LOGGER.getLevel();
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
    // A test may have changed the logger's level directly (simulating code other than Debug
    // touching it); put it back exactly as found so tests stay isolated regardless of what
    // configureLogger()'s own restore logic decided to do.
    SELENIUM_LOGGER.setLevel(oldLoggerLevel);
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
  void configureLoggerDoesNotClobberALevelChangedWhileDebuggingWasOn() {
    System.setProperty("selenium.debug", "true");
    Debug.configureLogger();
    assertThat(SELENIUM_LOGGER.getLevel()).isEqualTo(Level.FINE);

    // Something other than Debug changes the level while debugging is still on -- e.g. the user's
    // own logging config.
    SELENIUM_LOGGER.setLevel(Level.WARNING);

    System.clearProperty("selenium.debug");
    Debug.configureLogger();

    // The externally-set WARNING must survive. Debug must not clobber it with the level that was
    // ambient before IT turned debugging on -- that snapshot is stale the moment anything else
    // changes the level in between.
    assertThat(SELENIUM_LOGGER.getLevel()).isEqualTo(Level.WARNING);
  }

  @Test
  void configureLoggerRestoresPreDebugLevelAndRemovesHandlerWhenTurnedOff() {
    Level preDebugLevel = SELENIUM_LOGGER.getLevel();
    List<Handler> handlersBeforeDebug = new ArrayList<>(List.of(SELENIUM_LOGGER.getHandlers()));

    System.setProperty("selenium.debug", "true");
    Debug.configureLogger();

    List<Handler> handlersWhileDebugging = new ArrayList<>(List.of(SELENIUM_LOGGER.getHandlers()));
    handlersWhileDebugging.removeAll(handlersBeforeDebug);
    assertThat(handlersWhileDebugging).hasSize(1);
    Handler installedHandler = handlersWhileDebugging.get(0);

    // No external override happens in between -- this is the plain turn-on/turn-off round trip.
    System.clearProperty("selenium.debug");
    Debug.configureLogger();

    assertThat(SELENIUM_LOGGER.getLevel()).isEqualTo(preDebugLevel);
    assertThat(SELENIUM_LOGGER.getHandlers()).doesNotContain(installedHandler);
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
    List<LogRecord> userHandlerRecords = new ArrayList<>();
    Handler userHandler =
        new Handler() {
          @Override
          public void publish(LogRecord record) {
            userHandlerRecords.add(record);
          }

          @Override
          public void flush() {}

          @Override
          public void close() {}
        };
    // Simulates a handler the caller already has attached directly to this logger (e.g. their
    // own handler at INFO) that already prints INFO-and-above records on its own.
    userHandler.setLevel(Level.INFO);
    SELENIUM_LOGGER.addHandler(userHandler);

    boolean oldUseParentHandlers = SELENIUM_LOGGER.getUseParentHandlers();
    // Isolate this check to handlers attached directly to org.openqa.selenium. Propagation to the
    // JVM's own root logger handler is a separate, legitimate print channel this test isn't
    // about, and it would otherwise be indistinguishable from a real duplicate here.
    SELENIUM_LOGGER.setUseParentHandlers(false);

    PrintStream originalErr = System.err;
    ByteArrayOutputStream capturedErr = new ByteArrayOutputStream();
    String marker = "duplicate-check-" + UUID.randomUUID();
    try {
      System.setErr(new PrintStream(capturedErr));
      System.setProperty("selenium.debug", "true");
      Debug.configureLogger();

      SELENIUM_LOGGER.log(Level.INFO, marker);
      for (Handler handler : SELENIUM_LOGGER.getHandlers()) {
        handler.flush();
      }
    } finally {
      System.setErr(originalErr);
      SELENIUM_LOGGER.setUseParentHandlers(oldUseParentHandlers);
      SELENIUM_LOGGER.removeHandler(userHandler);
    }

    // The caller's own handler must still see the record: Selenium never suppresses records for
    // handlers it doesn't own.
    assertThat(userHandlerRecords).extracting(LogRecord::getMessage).containsExactly(marker);
    // Selenium's own handler must not ALSO print it to stderr -- otherwise the exact same line
    // the caller's handler just printed would appear a second time, straight from Selenium's own
    // console handler.
    assertThat(capturedErr.toString()).doesNotContain(marker);
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
