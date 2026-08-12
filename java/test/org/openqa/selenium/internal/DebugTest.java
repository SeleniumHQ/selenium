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
import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.logging.ConsoleHandler;
import java.util.logging.ErrorManager;
import java.util.logging.Filter;
import java.util.logging.Formatter;
import java.util.logging.Handler;
import java.util.logging.Level;
import java.util.logging.LogRecord;
import java.util.logging.Logger;
import java.util.logging.SimpleFormatter;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import uk.org.webcompere.systemstubs.environment.EnvironmentVariables;
import uk.org.webcompere.systemstubs.jupiter.SystemStub;
import uk.org.webcompere.systemstubs.jupiter.SystemStubsExtension;

@Tag("UnitTests")
@ExtendWith(SystemStubsExtension.class)
class DebugTest {

  private static Logger seleniumLogger() {
    return Logger.getLogger("org.openqa.selenium");
  }

  private String oldDebugProperty;
  private String oldVerboseProperty;
  private Level oldLoggerLevel;

  @SystemStub private EnvironmentVariables environment;

  @BeforeEach
  void storeSystemProperties() {
    oldDebugProperty = System.getProperty("selenium.debug");
    oldVerboseProperty = System.getProperty("selenium.webdriver.verbose");
    oldLoggerLevel = seleniumLogger().getLevel();
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
    Debug.configureLogger();
    seleniumLogger().setLevel(oldLoggerLevel);
  }

  @Test
  void isDebuggingReflectsPropertySetAfterClassLoad() {
    assertThat(Debug.isDebugging()).isFalse();

    System.setProperty("selenium.debug", "true");

    assertThat(Debug.isDebugging()).isTrue();
  }

  @Test
  @SuppressWarnings({"deprecation", "removal"})
  void getDebugLogLevelHonoursTheLegacyVerboseProperty() {
    System.setProperty("selenium.webdriver.verbose", "true");

    assertThat(Debug.getDebugLogLevel()).isEqualTo(Level.INFO);
  }

  @Test
  void configureLoggerRaisesSeleniumLoggerToFine() {
    System.setProperty("selenium.debug", "true");

    Debug.configureLogger();

    assertThat(seleniumLogger().getLevel()).isEqualTo(Level.FINE);
  }

  @Test
  void configureLoggerDoesNotClobberALevelChangedWhileDebuggingWasOn() {
    System.setProperty("selenium.debug", "true");
    Debug.configureLogger();
    assertThat(seleniumLogger().getLevel()).isEqualTo(Level.FINE);

    // Something other than Debug changes the level while debugging is still on -- e.g. the user's
    // own logging config.
    seleniumLogger().setLevel(Level.WARNING);

    System.clearProperty("selenium.debug");
    Debug.configureLogger();

    // The externally-set WARNING must survive. Debug must not clobber it with the level that was
    // ambient before IT turned debugging on -- that snapshot is stale the moment anything else
    // changes the level in between.
    assertThat(seleniumLogger().getLevel()).isEqualTo(Level.WARNING);
  }

  @Test
  void configureLoggerRestoresPreDebugLevelAndRemovesHandlerWhenTurnedOff() {
    Level preDebugLevel = seleniumLogger().getLevel();
    List<Handler> handlersBeforeDebug = new ArrayList<>(List.of(seleniumLogger().getHandlers()));

    System.setProperty("selenium.debug", "true");
    Debug.configureLogger();

    List<Handler> handlersWhileDebugging = new ArrayList<>(List.of(seleniumLogger().getHandlers()));
    handlersWhileDebugging.removeAll(handlersBeforeDebug);
    assertThat(handlersWhileDebugging).hasSize(1);
    Handler installedHandler = handlersWhileDebugging.get(0);

    // No external override happens in between -- this is the plain turn-on/turn-off round trip.
    System.clearProperty("selenium.debug");
    Debug.configureLogger();

    assertThat(seleniumLogger().getLevel()).isEqualTo(preDebugLevel);
    assertThat(seleniumLogger().getHandlers()).doesNotContain(installedHandler);
  }

  @Test
  void configureLoggerIsIdempotent() {
    int before = seleniumLogger().getHandlers().length;
    System.setProperty("selenium.debug", "true");

    for (int i = 0; i < 5; i++) {
      Debug.configureLogger();
    }

    assertThat(seleniumLogger().getHandlers().length - before).isEqualTo(1);
  }

  @Test
  void configureLoggerLeavesUserHandlerConfigurationAlone() throws UnsupportedEncodingException {
    Handler userHandler = new ConsoleHandler();
    Filter userFilter = record -> false;
    Formatter userFormatter = new SimpleFormatter();
    ErrorManager userErrorManager = new ErrorManager();
    userHandler.setLevel(Level.WARNING);
    userHandler.setFilter(userFilter);
    userHandler.setFormatter(userFormatter);
    userHandler.setEncoding("UTF-8");
    userHandler.setErrorManager(userErrorManager);
    seleniumLogger().addHandler(userHandler);
    try {
      System.setProperty("selenium.debug", "true");
      Debug.configureLogger();
      assertThat(seleniumLogger().getHandlers()).contains(userHandler);
      assertThat(userHandler.getLevel()).isEqualTo(Level.WARNING);
      assertThat(userHandler.getFilter()).isSameAs(userFilter);
      assertThat(userHandler.getFormatter()).isSameAs(userFormatter);
      assertThat(userHandler.getEncoding()).isEqualTo("UTF-8");
      assertThat(userHandler.getErrorManager()).isSameAs(userErrorManager);

      System.clearProperty("selenium.debug");
      Debug.configureLogger();
      assertThat(seleniumLogger().getHandlers()).contains(userHandler);
      assertThat(userHandler.getLevel()).isEqualTo(Level.WARNING);
      assertThat(userHandler.getFilter()).isSameAs(userFilter);
      assertThat(userHandler.getFormatter()).isSameAs(userFormatter);
      assertThat(userHandler.getEncoding()).isEqualTo("UTF-8");
      assertThat(userHandler.getErrorManager()).isSameAs(userErrorManager);
    } finally {
      seleniumLogger().removeHandler(userHandler);
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
    seleniumLogger().addHandler(userHandler);

    boolean oldUseParentHandlers = seleniumLogger().getUseParentHandlers();
    // Isolate this check to handlers attached directly to org.openqa.selenium. Propagation to the
    // JVM's own root logger handler is a separate, legitimate print channel this test isn't
    // about, and it would otherwise be indistinguishable from a real duplicate here.
    seleniumLogger().setUseParentHandlers(false);

    PrintStream originalErr = System.err;
    ByteArrayOutputStream capturedErr = new ByteArrayOutputStream();
    String marker = "duplicate-check-" + UUID.randomUUID();
    try {
      System.setErr(new PrintStream(capturedErr));
      System.setProperty("selenium.debug", "true");
      Debug.configureLogger();

      seleniumLogger().log(Level.INFO, marker);
      for (Handler handler : seleniumLogger().getHandlers()) {
        handler.flush();
      }
    } finally {
      System.setErr(originalErr);
      seleniumLogger().setUseParentHandlers(oldUseParentHandlers);
      seleniumLogger().removeHandler(userHandler);
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
  void fineRecordsReachTheSeleniumOwnedHandler() {
    boolean oldUseParentHandlers = seleniumLogger().getUseParentHandlers();
    PrintStream originalErr = System.err;
    ByteArrayOutputStream capturedErr = new ByteArrayOutputStream();
    String marker = "fine-check-" + UUID.randomUUID();
    try {
      seleniumLogger().setUseParentHandlers(false);
      System.setErr(new PrintStream(capturedErr));
      System.setProperty("selenium.debug", "true");
      Debug.configureLogger();

      seleniumLogger().log(Level.FINE, marker);
      for (Handler handler : seleniumLogger().getHandlers()) {
        handler.flush();
      }
    } finally {
      System.setErr(originalErr);
      seleniumLogger().setUseParentHandlers(oldUseParentHandlers);
    }

    assertThat(capturedErr.toString()).containsOnlyOnce(marker);
  }

  @Test
  void configureLoggerDoesNotRestoreALevelItNeverChanged() {
    seleniumLogger().setLevel(Level.FINER);
    System.setProperty("selenium.debug", "true");
    Debug.configureLogger(); // debug on, level untouched (already more verbose than FINE)

    // Something else deliberately drops verbosity to FINE while debugging is on.
    seleniumLogger().setLevel(Level.FINE);

    System.clearProperty("selenium.debug");
    Debug.configureLogger();

    // Debug never changed the level (it was already more verbose when debug turned on), so
    // turning debug off must not "restore" a pre-debug snapshot it never took either.
    assertThat(seleniumLogger().getLevel()).isEqualTo(Level.FINE);
  }

  @Test
  @SuppressWarnings({"deprecation", "removal"})
  void getDebugLogLevelStillReportsInfoWhileDeprecated() {
    System.setProperty("selenium.debug", "true");
    assertThat(Debug.getDebugLogLevel()).isEqualTo(Level.INFO);

    System.clearProperty("selenium.debug");
    assertThat(Debug.getDebugLogLevel()).isEqualTo(Level.FINE);
  }

  @Test
  void configureLoggerRepairRestoresHandlerAndFineLoggabilityWithoutReplacingSnapshot() {
    Level preDebugLevel = seleniumLogger().getLevel();
    List<Handler> handlersBeforeDebug = new ArrayList<>(List.of(seleniumLogger().getHandlers()));

    System.setProperty("selenium.debug", "true");
    Debug.configureLogger();

    List<Handler> handlersWhileDebugging = new ArrayList<>(List.of(seleniumLogger().getHandlers()));
    handlersWhileDebugging.removeAll(handlersBeforeDebug);
    seleniumLogger().removeHandler(handlersWhileDebugging.get(0));
    seleniumLogger().setLevel(Level.INFO);

    Debug.configureLogger();

    assertThat(Debug.isHandlerCurrentlyInstalled()).isTrue();
    assertThat(seleniumLogger().isLoggable(Level.FINE)).isTrue();

    System.clearProperty("selenium.debug");
    Debug.configureLogger();

    assertThat(seleniumLogger().getLevel()).isEqualTo(preDebugLevel);
  }

  @Test
  void configureLoggerDoesNotChangeRootLoggerForSystemPropertyDebugging() {
    Logger rootLogger = Logger.getLogger("");
    Level rootLevel = rootLogger.getLevel();
    List<Handler> rootHandlers = List.of(rootLogger.getHandlers());

    System.setProperty("selenium.debug", "true");
    Debug.configureLogger();

    assertThat(rootLogger.getLevel()).isEqualTo(rootLevel);
    assertThat(rootLogger.getHandlers()).containsExactlyElementsOf(rootHandlers);
  }

  @Test
  void seDebugConfiguresFineHandlerAndRestoresLoggerLevel() {
    environment.set("SE_DEBUG", "false");
    Debug.configureLogger();
    Level preDebugLevel = seleniumLogger().getLevel();
    List<Handler> handlersBeforeDebug = new ArrayList<>(List.of(seleniumLogger().getHandlers()));

    environment.set("SE_DEBUG", "true");
    Debug.configureLogger();

    List<Handler> handlersWhileDebugging = new ArrayList<>(List.of(seleniumLogger().getHandlers()));
    handlersWhileDebugging.removeAll(handlersBeforeDebug);
    assertThat(handlersWhileDebugging)
        .singleElement()
        .extracting(Handler::getLevel)
        .isEqualTo(Level.FINE);

    environment.set("SE_DEBUG", "false");
    Debug.configureLogger();

    assertThat(seleniumLogger().getLevel()).isEqualTo(preDebugLevel);
  }

  @Test
  void configureLoggerLeavesExplicitMoreVerboseLevelsEffective() {
    for (Level level : List.of(Level.FINER, Level.FINEST, Level.ALL)) {
      seleniumLogger().setLevel(level);
      System.setProperty("selenium.debug", "true");

      Debug.configureLogger();

      assertThat(seleniumLogger().getLevel()).isEqualTo(level);
      assertThat(seleniumLogger().isLoggable(level)).isTrue();

      System.clearProperty("selenium.debug");
      Debug.configureLogger();
    }
  }

  @Test
  void configureLoggerLeavesInheritedMoreVerboseLevelsEffective() {
    Logger parentLogger = Logger.getLogger("org.openqa");
    Level oldParentLevel = parentLogger.getLevel();
    try {
      for (Level level : List.of(Level.FINER, Level.FINEST, Level.ALL)) {
        parentLogger.setLevel(level);
        seleniumLogger().setLevel(null);
        System.setProperty("selenium.debug", "true");

        Debug.configureLogger();

        assertThat(seleniumLogger().getLevel()).isNull();
        assertThat(seleniumLogger().isLoggable(level)).isTrue();

        System.clearProperty("selenium.debug");
        Debug.configureLogger();
      }
    } finally {
      parentLogger.setLevel(oldParentLevel);
    }
  }

  @Test
  void configureLoggerRestoresMoreVerboseLevelAfterLateRepair() {
    Logger parentLogger = Logger.getLogger("org.openqa");
    Level oldParentLevel = parentLogger.getLevel();
    parentLogger.setLevel(Level.FINER);
    try {
      for (boolean inherited : List.of(false, true)) {
        seleniumLogger().setLevel(inherited ? null : Level.FINER);
        System.setProperty("selenium.debug", "true");
        Debug.configureLogger();

        seleniumLogger().setLevel(Level.INFO);
        Debug.configureLogger();

        assertThat(seleniumLogger().isLoggable(Level.FINE)).isTrue();

        System.clearProperty("selenium.debug");
        Debug.configureLogger();

        assertThat(seleniumLogger().getLevel()).isEqualTo(inherited ? null : Level.FINER);
        assertThat(seleniumLogger().isLoggable(Level.FINER)).isTrue();
      }
    } finally {
      parentLogger.setLevel(oldParentLevel);
    }
  }
}
