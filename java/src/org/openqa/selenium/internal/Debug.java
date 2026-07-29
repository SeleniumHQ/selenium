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

import java.util.concurrent.atomic.AtomicBoolean;
import java.util.logging.ConsoleHandler;
import java.util.logging.Filter;
import java.util.logging.Handler;
import java.util.logging.Level;
import java.util.logging.Logger;

/** Used to provide information about whether Selenium is running under debug mode. */
public class Debug {

  private static final AtomicBoolean DEBUG_WARNING_LOGGED = new AtomicBoolean(false);
  private static final Logger SELENIUM_LOGGER = Logger.getLogger("org.openqa.selenium");

  private static boolean loggerConfigured = false;
  private static Handler installedHandler = null;
  private static Level previousLevel = null;
  private static boolean levelRaisedByDebug = false;

  private Debug() {
    // Utility class
  }

  /**
   * Reports whether Selenium debug logging has been requested via the {@code selenium.debug} or
   * the legacy {@code selenium.webdriver.verbose} system property. Read live on every call, so a
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

  /**
   * Reports whether {@link #configureLogger()}'s handler is attached to {@code
   * org.openqa.selenium} right now. Unlike {@link #isDebugging()} or {@link #isDebugAll()}, which
   * read the live system property/environment variable, this reflects the handler's actual,
   * current installation state -- the two can genuinely diverge for however long it takes some
   * caller to next invoke {@link #configureLogger()} after a switch changes, since nothing installs
   * or removes the handler except that call.
   *
   * @return true when a handler installed by {@link #configureLogger()} is currently attached
   */
  public static synchronized boolean isHandlerCurrentlyInstalled() {
    return loggerConfigured;
  }

  /**
   * Reports whether a log record from {@code loggerName} at {@code level} would already be
   * emitted by the handler {@link #configureLogger()} installs directly on {@code
   * org.openqa.selenium} -- that handler and its filter together cover exactly {@link
   * Level#FINE}- and {@link Level#CONFIG}-range records from that logger and its descendants,
   * whenever that handler is {@linkplain #isHandlerCurrentlyInstalled() currently installed}. A
   * caller further up the logger hierarchy (e.g. a handler on the root logger, which receives the
   * same record too via normal handler propagation) can use this to avoid printing it a second
   * time, without disabling propagation itself -- which would instead silently drop every {@link
   * Level#INFO}-and-above {@code org.openqa.selenium} record that caller would otherwise print.
   *
   * @param loggerName the originating logger's name; {@code null} is never covered
   * @param level the record's level
   * @return true when {@link #configureLogger()}'s own handler already covers this record
   */
  public static boolean isHandledBySeleniumDebugHandler(String loggerName, Level level) {
    if (!isHandlerCurrentlyInstalled()) {
      return false;
    }
    boolean withinSeleniumHierarchy =
        loggerName != null
            && (loggerName.equals("org.openqa.selenium")
                || loggerName.startsWith("org.openqa.selenium."));
    return withinSeleniumHierarchy
        && level.intValue() >= Level.FINE.intValue()
        && level.intValue() < Level.INFO.intValue();
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
   * <p>Cross-binding note: the Python binding does the analogous thing at import time (the
   * {@code SE_DEBUG} block at the top of {@code py/selenium/webdriver/__init__.py}): when the
   * {@code SE_DEBUG} environment variable is set it puts the {@code selenium} logger at
   * {@code DEBUG} and attaches an unfiltered {@code StreamHandler} if the logger has none of
   * its own. Two deliberate differences here: Java only raises the level when the logger is
   * currently less verbose than {@link Level#FINE} (Python sets {@code DEBUG} unconditionally),
   * and Java's handler is filtered to records below {@link Level#INFO} so output the caller's
   * own handlers already print is never duplicated.
   */
  public static synchronized void configureLogger() {
    boolean shouldDebug = isDebugging() || isDebugAll();
    if (shouldDebug == loggerConfigured) {
      return;
    }

    if (shouldDebug) {
      Level currentLevel = SELENIUM_LOGGER.getLevel();
      // Only raise the level when the logger is currently LESS verbose than FINE (higher
      // intValue). A null level inherits the parent's (default INFO), so raising applies then
      // too. An already more-verbose level (FINER, FINEST, ALL) is left alone: lowering it
      // would make records like W3CHttpResponseCodec's FINER diagnostics unloggable while
      // "debugging". This reads the logger's own level, not its effective level -- a
      // more-verbose level inherited from a parent while this logger's own level is unset is
      // still pinned to FINE, since JUL offers no way to read the effective level.
      levelRaisedByDebug = currentLevel == null || currentLevel.intValue() > Level.FINE.intValue();
      if (levelRaisedByDebug) {
        previousLevel = currentLevel;
        SELENIUM_LOGGER.setLevel(Level.FINE);
      } else {
        previousLevel = null;
      }

      Handler handler = new ConsoleHandler();
      handler.setLevel(Level.FINE);
      Filter belowInfo = record -> record.getLevel().intValue() < Level.INFO.intValue();
      handler.setFilter(belowInfo);
      SELENIUM_LOGGER.addHandler(handler);
      installedHandler = handler;
    } else {
      SELENIUM_LOGGER.removeHandler(installedHandler);
      installedHandler.close();
      installedHandler = null;
      // Restore only when Debug itself raised the level AND nothing else changed it since. The
      // FINE-equality guard keeps the existing "external override while debugging" protection;
      // levelRaisedByDebug additionally covers the case where Debug never touched the level at
      // all and so has nothing to restore.
      if (levelRaisedByDebug && Level.FINE.equals(SELENIUM_LOGGER.getLevel())) {
        SELENIUM_LOGGER.setLevel(previousLevel);
      }
      levelRaisedByDebug = false;
      previousLevel = null;
    }

    loggerConfigured = shouldDebug;
  }
}
