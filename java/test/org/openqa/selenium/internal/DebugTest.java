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
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
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
  private boolean oldUseParentHandlers;
  private List<Handler> handlersBefore;

  @SystemStub private EnvironmentVariables environment;

  @BeforeEach
  void storeLoggingState() {
    oldDebugProperty = System.getProperty("selenium.debug");
    oldVerboseProperty = System.getProperty("selenium.webdriver.verbose");
    System.clearProperty("selenium.debug");
    System.clearProperty("selenium.webdriver.verbose");
    environment.set("SE_DEBUG", "false");
    Debug.resetForTesting();
    oldLoggerLevel = seleniumLogger().getLevel();
    oldUseParentHandlers = seleniumLogger().getUseParentHandlers();
    handlersBefore = List.of(seleniumLogger().getHandlers());
  }

  @AfterEach
  void restoreLoggingState() {
    restoreProperty("selenium.debug", oldDebugProperty);
    restoreProperty("selenium.webdriver.verbose", oldVerboseProperty);
    Debug.resetForTesting();
    seleniumLogger().setLevel(oldLoggerLevel);
    seleniumLogger().setUseParentHandlers(oldUseParentHandlers);
  }

  private static void restoreProperty(String name, String value) {
    if (value != null) {
      System.setProperty(name, value);
    } else {
      System.clearProperty(name);
    }
  }

  /** Returns the handlers added to the Selenium logger since the test started. */
  private List<Handler> addedHandlers() {
    List<Handler> added = new ArrayList<>(List.of(seleniumLogger().getHandlers()));
    added.removeAll(handlersBefore);
    return added;
  }

  /**
   * Runs {@code configure}, then logs {@code message} at {@code level}, and returns what was
   * written to stderr. Both run while stderr is captured, because {@link ConsoleHandler} binds
   * {@code System.err} when it is created.
   */
  private static String captureStderr(Runnable configure, Level level, String message) {
    PrintStream originalErr = System.err;
    ByteArrayOutputStream capturedErr = new ByteArrayOutputStream();
    try {
      System.setErr(new PrintStream(capturedErr, true, StandardCharsets.UTF_8));
      configure.run();
      seleniumLogger().log(level, message);
      for (Handler handler : seleniumLogger().getHandlers()) {
        handler.flush();
      }
    } finally {
      System.setErr(originalErr);
    }
    return capturedErr.toString(StandardCharsets.UTF_8);
  }

  private static String logAndCaptureStderr(Level level, String message) {
    return captureStderr(Debug::configureLogger, level, message);
  }

  @Test
  void isDebuggingReflectsPropertySetAfterClassLoad() {
    assertThat(Debug.isDebugging()).isFalse();

    System.setProperty("selenium.debug", "true");

    assertThat(Debug.isDebugging()).isTrue();
  }

  @Test
  void isDebuggingHonoursTheLegacyVerboseProperty() {
    System.setProperty("selenium.webdriver.verbose", "true");

    assertThat(Debug.isDebugging()).isTrue();
  }

  @Test
  void isDebuggingIgnoresValuesOtherThanTrue() {
    System.setProperty("selenium.debug", "yes");
    System.setProperty("selenium.webdriver.verbose", "1");

    assertThat(Debug.isDebugging()).isFalse();
  }

  @Test
  void isDebugAllReflectsTheSeDebugEnvironmentVariable() {
    assertThat(Debug.isDebugAll()).isFalse();

    environment.set("SE_DEBUG", "true");

    assertThat(Debug.isDebugAll()).isTrue();
  }

  @Test
  @SuppressWarnings({"deprecation", "removal"})
  void getDebugLogLevelHonoursTheLegacyVerboseProperty() {
    System.setProperty("selenium.webdriver.verbose", "true");

    assertThat(Debug.getDebugLogLevel()).isEqualTo(Level.INFO);
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
  void configureLoggerDoesNothingWhenDebuggingIsOff() {
    Level levelBefore = seleniumLogger().getLevel();

    Debug.configureLogger();

    assertThat(seleniumLogger().getLevel()).isEqualTo(levelBefore);
    assertThat(addedHandlers()).isEmpty();
  }

  @Test
  void configureLoggerRaisesSeleniumLoggerToFine() {
    System.setProperty("selenium.debug", "true");

    Debug.configureLogger();

    assertThat(seleniumLogger().getLevel()).isEqualTo(Level.FINE);
    assertThat(addedHandlers()).singleElement().extracting(Handler::getLevel).isEqualTo(Level.FINE);
  }

  @Test
  void configureLoggerHonoursTheLegacyVerboseProperty() {
    System.setProperty("selenium.webdriver.verbose", "true");

    Debug.configureLogger();

    assertThat(seleniumLogger().getLevel()).isEqualTo(Level.FINE);
    assertThat(addedHandlers()).hasSize(1);
  }

  @Test
  void seDebugConfiguresAFineHandler() {
    environment.set("SE_DEBUG", "true");

    Debug.configureLogger();

    assertThat(seleniumLogger().isLoggable(Level.FINE)).isTrue();
    assertThat(addedHandlers()).singleElement().extracting(Handler::getLevel).isEqualTo(Level.FINE);
  }

  @Test
  void configureLoggerPicksUpAPropertySetAfterAnEarlierCall() {
    Debug.configureLogger();
    assertThat(addedHandlers()).isEmpty();

    System.setProperty("selenium.debug", "true");
    Debug.configureLogger();

    assertThat(seleniumLogger().getLevel()).isEqualTo(Level.FINE);
    assertThat(addedHandlers()).hasSize(1);
  }

  @Test
  void debugLoggingStaysOnAfterThePropertyIsCleared() {
    System.setProperty("selenium.debug", "true");
    Debug.configureLogger();
    List<Handler> handlersWhileDebugging = addedHandlers();

    System.clearProperty("selenium.debug");
    Debug.configureLogger();

    assertThat(seleniumLogger().getLevel()).isEqualTo(Level.FINE);
    assertThat(addedHandlers()).isEqualTo(handlersWhileDebugging).hasSize(1);
  }

  @Test
  void debugLoggingStaysOnAfterSeDebugIsCleared() {
    environment.set("SE_DEBUG", "true");
    Debug.configureLogger();

    environment.set("SE_DEBUG", "false");
    seleniumLogger().setLevel(Level.INFO);
    Debug.configureLogger();

    assertThat(seleniumLogger().getLevel()).isEqualTo(Level.FINE);
    assertThat(addedHandlers()).hasSize(1);
  }

  @Test
  void configureLoggerIsIdempotent() {
    System.setProperty("selenium.debug", "true");

    for (int i = 0; i < 5; i++) {
      Debug.configureLogger();
    }

    assertThat(addedHandlers()).hasSize(1);
    assertThat(seleniumLogger().getLevel()).isEqualTo(Level.FINE);
  }

  @Test
  void concurrentConfigureLoggerCallsInstallExactlyOneHandler() throws Exception {
    System.setProperty("selenium.debug", "true");

    int threads = 16;
    ExecutorService pool = Executors.newFixedThreadPool(threads);
    CountDownLatch start = new CountDownLatch(1);
    try {
      List<Future<?>> calls = new ArrayList<>();
      for (int i = 0; i < threads; i++) {
        calls.add(
            pool.submit(
                () -> {
                  start.await();
                  Debug.configureLogger();
                  return null;
                }));
      }
      start.countDown();
      for (Future<?> call : calls) {
        call.get(10, TimeUnit.SECONDS);
      }
    } finally {
      pool.shutdownNow();
    }

    assertThat(addedHandlers()).hasSize(1);
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
  void fineRecordsReachTheSeleniumOwnedHandler() {
    seleniumLogger().setUseParentHandlers(false);
    System.setProperty("selenium.debug", "true");
    String marker = "fine-check-" + UUID.randomUUID();

    assertThat(logAndCaptureStderr(Level.FINE, marker)).containsOnlyOnce(marker);
  }

  @Test
  void infoRecordsAreNotDuplicatedWhenDebuggingIsEnabled() {
    List<LogRecord> userHandlerRecords = new ArrayList<>();
    Handler userHandler = recordingHandler(userHandlerRecords, Level.INFO);
    seleniumLogger().addHandler(userHandler);
    // Only look at handlers attached directly to org.openqa.selenium; the root logger's console
    // handler is a separate, legitimate print channel.
    seleniumLogger().setUseParentHandlers(false);
    System.setProperty("selenium.debug", "true");
    String marker = "duplicate-check-" + UUID.randomUUID();
    String stderr;
    try {
      stderr = logAndCaptureStderr(Level.INFO, marker);
    } finally {
      seleniumLogger().removeHandler(userHandler);
    }

    // The user's handler still gets the record; Selenium's handler does not print it again.
    assertThat(userHandlerRecords).extracting(LogRecord::getMessage).containsExactly(marker);
    assertThat(stderr).doesNotContain(marker);
  }

  @Test
  void fineRecordsAlsoReachAUserHandlerThatAcceptsFine() {
    // Documented in configureLogger(): a user FINE handler sees FINE records in addition to the
    // copy that Selenium's own handler prints.
    List<LogRecord> userHandlerRecords = new ArrayList<>();
    Handler userHandler = recordingHandler(userHandlerRecords, Level.FINE);
    seleniumLogger().addHandler(userHandler);
    seleniumLogger().setUseParentHandlers(false);
    System.setProperty("selenium.debug", "true");
    String marker = "user-fine-check-" + UUID.randomUUID();
    String stderr;
    try {
      stderr = logAndCaptureStderr(Level.FINE, marker);
    } finally {
      seleniumLogger().removeHandler(userHandler);
    }

    assertThat(userHandlerRecords).extracting(LogRecord::getMessage).containsExactly(marker);
    assertThat(stderr).containsOnlyOnce(marker);
  }

  @Test
  void configureLoggerLeavesExplicitMoreVerboseLevelsEffective() {
    for (Level level : List.of(Level.FINER, Level.FINEST, Level.ALL)) {
      seleniumLogger().setLevel(level);
      System.setProperty("selenium.debug", "true");

      Debug.configureLogger();

      assertThat(seleniumLogger().getLevel()).isEqualTo(level);
      assertThat(seleniumLogger().isLoggable(level)).isTrue();
      assertThat(addedHandlers()).singleElement().extracting(Handler::getLevel).isEqualTo(level);

      Debug.resetForTesting();
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

        Debug.resetForTesting();
      }
    } finally {
      parentLogger.setLevel(oldParentLevel);
    }
  }

  @Test
  void configureLoggerRepairsAnExternallyRemovedHandlerAndLevel() {
    System.setProperty("selenium.debug", "true");
    Debug.configureLogger();
    Handler original = addedHandlers().get(0);

    seleniumLogger().removeHandler(original);
    seleniumLogger().setLevel(Level.INFO);
    Debug.configureLogger();

    assertThat(addedHandlers()).singleElement().isNotSameAs(original);
    assertThat(seleniumLogger().isLoggable(Level.FINE)).isTrue();
  }

  @Test
  void seleniumOwnedHandlerFollowsTheLoggerToAMoreVerboseLevel() {
    seleniumLogger().setUseParentHandlers(false);
    System.setProperty("selenium.debug", "true");
    String marker = "finer-check-" + UUID.randomUUID();

    String stderr =
        captureStderr(
            () -> {
              Debug.configureLogger();
              seleniumLogger().setLevel(Level.FINER);
              Debug.configureLogger();
            },
            Level.FINER,
            marker);

    assertThat(stderr).containsOnlyOnce(marker);
  }

  private static Handler recordingHandler(List<LogRecord> records, Level level) {
    Handler handler =
        new Handler() {
          @Override
          public void publish(LogRecord record) {
            if (isLoggable(record)) {
              records.add(record);
            }
          }

          @Override
          public void flush() {}

          @Override
          public void close() {}
        };
    handler.setLevel(level);
    return handler;
  }
}
