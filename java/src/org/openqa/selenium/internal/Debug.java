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

import java.util.Arrays;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.logging.ConsoleHandler;
import java.util.logging.Filter;
import java.util.logging.Handler;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.jspecify.annotations.Nullable;

/** Used to provide information about whether Selenium is running under debug mode. */
public class Debug {

  private static final AtomicBoolean DEBUG_WARNING_LOGGED = new AtomicBoolean(false);
  private static final Logger SELENIUM_LOGGER = Logger.getLogger("org.openqa.selenium");

  private static boolean loggerConfigured = false;
  private static @Nullable Handler installedHandler;
  private static @Nullable Level previousLevel;
  private static @Nullable Level levelSetByDebug;

  private Debug() {
    // Utility class
  }

  /** Returns whether either Selenium debug system property is currently enabled. */
  public static boolean isDebugging() {
    return Boolean.getBoolean("selenium.debug") || Boolean.getBoolean("selenium.webdriver.verbose");
  }

  /**
   * Returns the legacy level selected by the current debug system properties.
   *
   * @deprecated Log at a fixed severity and use {@link #configureLogger()} to expose debug output.
   */
  @Deprecated(forRemoval = true)
  public static Level getDebugLogLevel() {
    return isDebugging() ? Level.INFO : Level.FINE;
  }

  static synchronized boolean isHandlerCurrentlyInstalled() {
    return installedHandler != null
        && Arrays.asList(SELENIUM_LOGGER.getHandlers()).contains(installedHandler);
  }

  public static boolean isDebugAll() {
    boolean everything = Boolean.parseBoolean(System.getenv("SE_DEBUG"));
    if (everything && DEBUG_WARNING_LOGGED.compareAndSet(false, true)) {
      String warn =
          "WARNING: Environment Variable `SE_DEBUG` is set; Selenium is forcing verbose logging"
              + " which may override user-specified settings.";
      System.err.println(warn);
    }
    return everything;
  }

  private static Level effectiveLevel(Logger logger) {
    for (Logger current = logger; current != null; current = current.getParent()) {
      Level level = current.getLevel();
      if (level != null) {
        return level;
      }
    }
    return Level.INFO;
  }

  /**
   * Applies the current Selenium debug switches to the {@code org.openqa.selenium} logger. Selenium
   * owns the added handler and restores only logger state that it changed. Repeated calls also
   * repair an externally removed handler or a less-verbose logger level.
   */
  public static synchronized void configureLogger() {
    boolean shouldDebug = isDebugAll() || isDebugging();
    Handler currentHandler = installedHandler;
    boolean handlerInstalled =
        currentHandler != null
            && Arrays.asList(SELENIUM_LOGGER.getHandlers()).contains(currentHandler);
    Level currentEffectiveLevel = effectiveLevel(SELENIUM_LOGGER);
    if (shouldDebug == loggerConfigured
        && (!shouldDebug
            || (handlerInstalled
                && currentHandler != null
                && currentEffectiveLevel.intValue() <= Level.FINE.intValue()
                && currentHandler.getLevel().intValue() <= currentEffectiveLevel.intValue()))) {
      return;
    }

    if (shouldDebug) {
      if (!loggerConfigured) {
        previousLevel = SELENIUM_LOGGER.getLevel();
        levelSetByDebug = null;
      }

      if (currentEffectiveLevel.intValue() > Level.FINE.intValue()) {
        SELENIUM_LOGGER.setLevel(Level.FINE);
        levelSetByDebug = Level.FINE;
        currentEffectiveLevel = Level.FINE;
      }

      if (handlerInstalled && currentHandler != null) {
        currentHandler.setLevel(currentEffectiveLevel);
      } else {
        if (currentHandler != null) {
          SELENIUM_LOGGER.removeHandler(currentHandler);
          currentHandler.close();
        }
        Handler handler = new ConsoleHandler();
        handler.setLevel(currentEffectiveLevel);
        Filter belowInfo = record -> record.getLevel().intValue() < Level.INFO.intValue();
        handler.setFilter(belowInfo);
        SELENIUM_LOGGER.addHandler(handler);
        installedHandler = handler;
      }
    } else {
      if (currentHandler != null) {
        SELENIUM_LOGGER.removeHandler(currentHandler);
        currentHandler.close();
        installedHandler = null;
      }
      if (levelSetByDebug != null && levelSetByDebug.equals(SELENIUM_LOGGER.getLevel())) {
        SELENIUM_LOGGER.setLevel(previousLevel);
      }
      previousLevel = null;
      levelSetByDebug = null;
    }

    loggerConfigured = shouldDebug;
  }
}
