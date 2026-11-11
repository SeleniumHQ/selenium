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
import java.util.logging.Handler;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.jspecify.annotations.Nullable;

/**
 * Decides whether Selenium's Java bindings run in debug mode and exposes Selenium's diagnostic log
 * records when they do.
 *
 * <p>Debug mode is a convenience for troubleshooting. It is switched on by either of these:
 *
 * <ul>
 *   <li>the {@code selenium.debug} system property, or the legacy {@code
 *       selenium.webdriver.verbose} property, which only affect the Java bindings' {@code
 *       java.util.logging} output; or
 *   <li>the {@code SE_DEBUG} environment variable, the broader switch also used by Selenium Grid,
 *       the other language bindings and the driver services.
 * </ul>
 *
 * <p>Users who need fine-grained control should configure {@code java.util.logging} or an SLF4J
 * bridge themselves instead.
 */
public class Debug {

  private static final AtomicBoolean DEBUG_WARNING_LOGGED = new AtomicBoolean(false);
  private static final Logger SELENIUM_LOGGER = Logger.getLogger("org.openqa.selenium");
  private static final Object LOCK = new Object();
  // Kept separate so either switch can move to a more verbose level without changing the other.
  private static final Level SE_DEBUG_LEVEL = Level.FINE;
  private static final Level DEBUG_PROPERTY_LEVEL = Level.FINE;

  private static @Nullable Level enabledLevel;
  private static @Nullable Handler installedHandler;

  private Debug() {
    // Utility class
  }

  /**
   * Returns whether the {@code selenium.debug} or {@code selenium.webdriver.verbose} system
   * property is currently set to {@code true}.
   *
   * <p>The properties are read on every call, so a value set after Selenium's classes are loaded is
   * honoured.
   *
   * @return {@code true} if either debug system property is currently enabled
   */
  public static boolean isDebugging() {
    return Boolean.getBoolean("selenium.debug") || Boolean.getBoolean("selenium.webdriver.verbose");
  }

  /**
   * Returns the level that legacy call sites use for their diagnostic messages.
   *
   * @return {@link Level#INFO} while {@link #isDebugging()} is {@code true}, {@link Level#FINE}
   *     otherwise
   * @deprecated Log diagnostics at a fixed level such as {@link Level#FINE}. {@link
   *     #configureLogger()} makes those records visible when debugging is enabled.
   */
  @Deprecated(forRemoval = true)
  public static Level getDebugLogLevel() {
    return isDebugging() ? Level.INFO : Level.FINE;
  }

  /**
   * Returns whether the {@code SE_DEBUG} environment variable is set to {@code true}.
   *
   * <p>The first time this returns {@code true}, a warning is printed to {@code System.err}.
   *
   * @return {@code true} if {@code SE_DEBUG} is enabled
   */
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
   * Shows Selenium's diagnostic log records on the console if debugging is enabled.
   *
   * <p>The switches are read on every call. Once one of them has been seen, debug logging stays on
   * for the life of the JVM, even if the switch is turned off again later. While debugging is on,
   * each call makes sure that:
   *
   * <ul>
   *   <li>the {@code org.openqa.selenium} logger lets {@link Level#FINE} records through. A level
   *       that is already more verbose, set on the logger or inherited from a parent, is left as it
   *       is; and
   *   <li>one Selenium-owned console handler, which prints records below {@link Level#INFO} to
   *       {@code System.err}, is attached to that logger. It is re-attached if something removed
   *       it.
   * </ul>
   *
   * <p>Handlers added by the user, and the root logger, are never changed. Because Selenium's
   * handler prints every record below {@code INFO}, a user who has also attached a handler that
   * accepts {@code FINE} records will see those records twice. Records at {@code INFO} and above
   * are left to the handlers that already print them, such as the root logger's console handler, so
   * a user who turns off {@code useParentHandlers} on {@code org.openqa.selenium} must attach their
   * own handler to see them.
   *
   * <p>Calling this method when debugging is disabled does nothing. It is safe to call repeatedly
   * and from several threads.
   *
   * <pre>{@code
   * System.setProperty("selenium.debug", "true");
   * Debug.configureLogger(); // FINE records from org.openqa.selenium now reach System.err
   * }</pre>
   */
  public static void configureLogger() {
    synchronized (LOCK) {
      Level requested = requestedLevel();
      if (requested != null
          && (enabledLevel == null || requested.intValue() < enabledLevel.intValue())) {
        enabledLevel = requested;
      }
      if (enabledLevel != null) {
        enable(enabledLevel);
      }
    }
  }

  /** Returns the level asked for by the debug switches, or {@code null} when none is enabled. */
  private static @Nullable Level requestedLevel() {
    // SE_DEBUG is checked first because it is the broader switch.
    if (isDebugAll()) {
      return SE_DEBUG_LEVEL;
    }
    if (isDebugging()) {
      return DEBUG_PROPERTY_LEVEL;
    }
    return null;
  }

  private static void enable(Level minimum) {
    Level level = effectiveLevel(SELENIUM_LOGGER);
    if (level.intValue() > minimum.intValue()) {
      SELENIUM_LOGGER.setLevel(minimum);
      level = minimum;
    }

    Handler handler = installedHandler;
    if (handler == null || !isAttached(handler)) {
      if (handler != null) {
        handler.close();
      }
      handler = new ConsoleHandler();
      // Leave INFO and above to the existing handlers so those records are not printed twice.
      handler.setFilter(record -> record.getLevel().intValue() < Level.INFO.intValue());
      SELENIUM_LOGGER.addHandler(handler);
      installedHandler = handler;
    }
    handler.setLevel(level);
  }

  private static boolean isAttached(Handler handler) {
    return Arrays.asList(SELENIUM_LOGGER.getHandlers()).contains(handler);
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

  /** Detaches Selenium's handler and switches debug logging off again. Only for tests. */
  static void resetForTesting() {
    synchronized (LOCK) {
      Handler handler = installedHandler;
      if (handler != null) {
        SELENIUM_LOGGER.removeHandler(handler);
        handler.close();
        installedHandler = null;
      }
      enabledLevel = null;
    }
  }
}
