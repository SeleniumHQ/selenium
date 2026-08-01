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
  private static Handler installedHandler = null;
  private static Level previousLevel = null;
  private static boolean levelRaisedByDebug = false;
  private static Level configuredLevel = null;
  private static Level levelSetByDebug = null;

  private Debug() {
    // Utility class
  }

  /**
   * Reports whether Selenium debug logging has been requested via the {@code selenium.debug} or the
   * legacy {@code selenium.webdriver.verbose} system property. Read live on every call, so a
   * property change made at runtime is reflected immediately.
   *
   * @return true when either the {@code selenium.debug} or the {@code selenium.webdriver.verbose}
   *     system property is set to {@code true}; false otherwise
   */
  public static boolean isDebugging() {
    return Boolean.getBoolean("selenium.debug") || Boolean.getBoolean("selenium.webdriver.verbose");
  }

  /**
   * Returns the log level that debug output should be reported at: {@link Level#INFO} when {@link
   * #isDebugging()} is true, {@link Level#FINE} otherwise.
   *
   * @deprecated Individual log statements no longer change what severity they report at based on
   *     this switch; {@link #configureLogger()} raises the real {@code org.openqa.selenium} logger
   *     to {@link Level#FINE} instead, which is the ordinary way to see Selenium's debug output.
   *     Enable it with {@code -Dselenium.debug=true}, the {@code SE_DEBUG} environment variable, or
   *     directly via {@code Logger.getLogger("org.openqa.selenium").setLevel(Level.FINE)}. This
   *     method's own behavior is unchanged and kept only for existing call sites still comparing
   *     against it.
   * @return {@link Level#INFO} when debugging is enabled; {@link Level#FINE} otherwise
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

  /**
   * Computes {@code logger}'s effective level: its own level if set, otherwise the first non-null
   * level found walking up its {@link Logger#getParent()} chain, falling back to {@link Level#INFO}
   * (JUL's own root default) if none is ever set. {@link Logger} has no single built-in method for
   * this, but walking the parent chain is how the JVM itself resolves it internally when deciding
   * whether a record is loggable.
   *
   * @param logger the logger to compute the effective level of
   * @return the effective level; never {@code null}
   */
  private static Level effectiveLevel(Logger logger) {
    for (Logger current = logger; current != null; current = current.getParent()) {
      Level level = current.getLevel();
      if (level != null) {
        return level;
      }
    }
    return Level.INFO;
  }

  @Nullable
  private static Level getRequestedLogLevel() {
    if (isDebugging()) {
      return Level.FINE;
    }
    if (isDebugAll()) {
      return Level.FINE;
    }
    return null;
  }

  /**
   * Reflects the current debug switches ({@code -Dselenium.debug=true}, {@code
   * -Dselenium.webdriver.verbose=true}, {@code SE_DEBUG}) onto the real {@code org.openqa.selenium}
   * logger: raises it to {@link Level#FINE} when it is currently less verbose than {@link
   * Level#FINE}; a level already at {@link Level#FINE} or more verbose is left untouched. It also
   * attaches a handler Selenium owns, filtered to leave {@link Level#INFO} and above to the
   * caller's own handlers so output they already print is never duplicated. Idempotent: repeated
   * calls while the switches are unchanged do nothing. Reversible: once every switch is off, the
   * next call removes exactly the handler this method installed and restores the logger's level to
   * what it was before debugging turned on, only when this method was the one that raised it and
   * unless something else changed the level in the meantime -- that change is left alone rather
   * than clobbered. This can't distinguish an external override that happens to also set exactly
   * {@link Level#FINE}: since JUL has no level-change listener to tell the two apart, that specific
   * case still restores the pre-debug level. Safe to call from concurrent driver construction.
   *
   * <p>Cross-binding note: the Python binding does the analogous thing at import time (the {@code
   * SE_DEBUG} block at the top of {@code py/selenium/webdriver/__init__.py}): when the {@code
   * SE_DEBUG} environment variable is set it puts the {@code selenium} logger at {@code DEBUG} and
   * attaches an unfiltered {@code StreamHandler} if the logger has none of its own. Two deliberate
   * differences here: Java only raises the level when the logger is currently less verbose than
   * {@link Level#FINE} (Python sets {@code DEBUG} unconditionally), and Java's handler is filtered
   * to records below {@link Level#INFO} so output the caller's own handlers already print is never
   * duplicated.
   */
  public static synchronized void configureLogger() {
    Level requestedLevel = getRequestedLogLevel();
    boolean shouldDebug = requestedLevel != null;
    // When shouldDebug is on and already configured, only skip if the handler this method
    // installed is still actually attached -- something outside this class (e.g. a LogManager
    // reset, or unrelated code calling removeHandler() directly) can remove it without ever
    // going through configureLogger(), and that divergence must be repaired here rather than
    // silently left until the debug switch itself changes.
    if (shouldDebug == loggerConfigured
        && (!shouldDebug
            || (isHandlerCurrentlyInstalled()
                && requestedLevel.equals(configuredLevel)
                && effectiveLevel(SELENIUM_LOGGER).intValue() <= requestedLevel.intValue()))) {
      return;
    }

    if (shouldDebug) {
      // Capture the original own level on a genuine off->on transition. A repair call must not
      // overwrite this snapshot with the level it is repairing.
      if (!loggerConfigured) {
        configuredLevel = requestedLevel;
        previousLevel = SELENIUM_LOGGER.getLevel();
        levelRaisedByDebug = false;
        levelSetByDebug = null;
      }

      if (effectiveLevel(SELENIUM_LOGGER).intValue() > requestedLevel.intValue()) {
        SELENIUM_LOGGER.setLevel(requestedLevel);
        levelSetByDebug = requestedLevel;
        levelRaisedByDebug = true;
      }

      configuredLevel = requestedLevel;
      if (isHandlerCurrentlyInstalled()) {
        installedHandler.setLevel(requestedLevel);
      } else {
        Handler handler = new ConsoleHandler();
        handler.setLevel(requestedLevel);
        Filter belowInfo = record -> record.getLevel().intValue() < Level.INFO.intValue();
        handler.setFilter(belowInfo);
        SELENIUM_LOGGER.addHandler(handler);
        installedHandler = handler;
      }
    } else {
      // installedHandler can already be null here if it was removed externally and debugging
      // turned off before any repair call ever ran -- Logger.removeHandler(null) throws NPE per
      // its javadoc, so guard against that.
      if (installedHandler != null) {
        SELENIUM_LOGGER.removeHandler(installedHandler);
        installedHandler.close();
        installedHandler = null;
      }
      // Restore only when Debug itself raised the level AND nothing else changed it since. The
      // equality guard keeps the existing "external override while debugging" protection;
      // levelRaisedByDebug additionally covers the case where Debug never touched the level at
      // all and so has nothing to restore.
      if (levelRaisedByDebug
          && levelSetByDebug != null
          && levelSetByDebug.equals(SELENIUM_LOGGER.getLevel())) {
        SELENIUM_LOGGER.setLevel(previousLevel);
      }
      levelRaisedByDebug = false;
      previousLevel = null;
      configuredLevel = null;
      levelSetByDebug = null;
    }

    loggerConfigured = shouldDebug;
  }
}
