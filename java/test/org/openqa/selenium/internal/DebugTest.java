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

  /**
   * The shared {@code org.openqa.selenium} logger whose state {@link Debug#configureLogger()}
   * manages -- deliberately not this test class's own logger, because the behavior under test lives
   * on the shared category.
   */
  private static Logger seleniumLogger() {
    return Logger.getLogger("org.openqa.selenium");
  }

  private String oldDebugProperty;
  private String oldVerboseProperty;
  private Level oldLoggerLevel;

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
    // Re-sync configureLogger's internal state/handler with the now-restored properties so a
    // handler installed by one test never leaks into the next.
    Debug.configureLogger();
    // A test may have changed the logger's level directly (simulating code other than Debug
    // touching it); put it back exactly as found so tests stay isolated regardless of what
    // configureLogger()'s own restore logic decided to do.
    seleniumLogger().setLevel(oldLoggerLevel);
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
  void configureLoggerLeavesUserHandlersAlone() {
    Handler userHandler = new ConsoleHandler();
    seleniumLogger().addHandler(userHandler);
    try {
      System.setProperty("selenium.debug", "true");
      Debug.configureLogger();
      assertThat(seleniumLogger().getHandlers()).contains(userHandler);

      System.clearProperty("selenium.debug");
      Debug.configureLogger();
      assertThat(seleniumLogger().getHandlers()).contains(userHandler);
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
  void configureLoggerDoesNotLowerAnAlreadyMoreVerboseLevel() {
    // The application already asked for MORE verbosity than the debug switch provides, e.g. to
    // see W3CHttpResponseCodec's FINER response-decoding diagnostics.
    seleniumLogger().setLevel(Level.FINER);

    System.setProperty("selenium.debug", "true");
    Debug.configureLogger();
    // Turning debug on must never make the logger LESS verbose than it already was.
    assertThat(seleniumLogger().getLevel()).isEqualTo(Level.FINER);

    System.clearProperty("selenium.debug");
    Debug.configureLogger();
    assertThat(seleniumLogger().getLevel()).isEqualTo(Level.FINER);
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
  void isHandledBySeleniumDebugHandlerReflectsActualHandlerInstallationNotLiveProperty() {
    // isHandledBySeleniumDebugHandler() exists so a caller further up the logger hierarchy (e.g.
    // Grid's root handler) can tell whether THIS handler will actually also print a given record,
    // to avoid a duplicate. That question is about the handler's real, current installation
    // state, not the live system property: a property change takes effect only once something
    // calls configureLogger() again to react to it, and the two can genuinely diverge for however
    // long that takes -- checking the live property instead would answer "yes, handled" the
    // instant the property flips, even though the handler that must actually be there to back
    // that answer hasn't been installed (or removed) yet.
    System.setProperty("selenium.debug", "true");
    Debug.configureLogger();
    assertThat(Debug.isHandledBySeleniumDebugHandler("org.openqa.selenium", Level.FINE)).isTrue();

    // The property flips off, but nothing has called configureLogger() again yet -- the handler
    // installed above is still attached and will still print a FINE record published right now.
    System.clearProperty("selenium.debug");
    assertThat(Debug.isHandledBySeleniumDebugHandler("org.openqa.selenium", Level.FINE))
        .as("the handler installed while debugging was on is still attached and still handling")
        .isTrue();

    // Only once configureLogger() actually reacts does the handler come off, and only then must
    // callers stop treating this range as already handled.
    Debug.configureLogger();
    assertThat(Debug.isHandledBySeleniumDebugHandler("org.openqa.selenium", Level.FINE)).isFalse();
  }

  @Test
  void configureLoggerRepairsAnExternallyRemovedHandlerWithoutCorruptingRestoreBookkeeping() {
    Level preDebugLevel = seleniumLogger().getLevel();
    List<Handler> handlersBeforeDebug = new ArrayList<>(List.of(seleniumLogger().getHandlers()));

    System.setProperty("selenium.debug", "true");
    Debug.configureLogger();

    List<Handler> handlersWhileDebugging = new ArrayList<>(List.of(seleniumLogger().getHandlers()));
    handlersWhileDebugging.removeAll(handlersBeforeDebug);
    assertThat(handlersWhileDebugging).hasSize(1);
    Handler installedHandler = handlersWhileDebugging.get(0);

    // Something outside Debug removes the handler directly while debugging stays on -- e.g.
    // LogManager.getLogManager().reset() or a direct removeHandler() call by unrelated code.
    seleniumLogger().removeHandler(installedHandler);
    assertThat(Debug.isHandlerCurrentlyInstalled()).isFalse();

    // The property is unchanged (still true) -- a naive fast-path keyed only on
    // shouldDebug == loggerConfigured would return early here and never repair the handler.
    Debug.configureLogger();
    assertThat(Debug.isHandlerCurrentlyInstalled())
        .as("the repair call must reinstall a handler even though the debug switch never changed")
        .isTrue();

    // Turning debug back off after the repair call must still restore the ORIGINAL pre-debug
    // level -- proving the repair call didn't re-run the level-raising bookkeeping and corrupt
    // levelRaisedByDebug/previousLevel.
    System.clearProperty("selenium.debug");
    Debug.configureLogger();
    assertThat(seleniumLogger().getLevel()).isEqualTo(preDebugLevel);
  }

  @Test
  void isHandlerCurrentlyInstalledReflectsExternalHandlerRemoval() {
    // isHandlerCurrentlyInstalled() must answer whether Debug's handler is REALLY still attached
    // to org.openqa.selenium, not just whether Debug's own bookkeeping thinks it installed one and
    // was never told otherwise. Something outside Debug entirely can remove that handler without
    // going through configureLogger() -- e.g. LogManager.getLogManager().reset() (routine in
    // embedding scenarios: Spring Boot's JavaLoggingSystem, a Log4j-JUL bridge, a container
    // shutdown hook) or a direct removeHandler() call by unrelated code -- and Debug has no way to
    // be told when that happens.
    List<Handler> handlersBeforeDebug = new ArrayList<>(List.of(seleniumLogger().getHandlers()));

    System.setProperty("selenium.debug", "true");
    Debug.configureLogger();
    assertThat(Debug.isHandlerCurrentlyInstalled()).isTrue();

    List<Handler> handlersWhileDebugging = new ArrayList<>(List.of(seleniumLogger().getHandlers()));
    handlersWhileDebugging.removeAll(handlersBeforeDebug);
    assertThat(handlersWhileDebugging).hasSize(1);
    Handler installedHandler = handlersWhileDebugging.get(0);

    // Simulates the external-actor scenario: something other than Debug removes the handler
    // directly, without ever calling configureLogger().
    seleniumLogger().removeHandler(installedHandler);

    assertThat(Debug.isHandlerCurrentlyInstalled())
        .as("the handler was removed out from under Debug's bookkeeping by something else")
        .isFalse();
  }
}
