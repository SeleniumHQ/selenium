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

  private Debug() {
    // Utility class
  }

  public static boolean isDebugging() {
    return Boolean.getBoolean("selenium.debug") || Boolean.getBoolean("selenium.webdriver.verbose");
  }

  /**
   * @deprecated Individual log statements no longer change what severity they report at based on
   *     this switch; {@link #configureLogger()} raises the real {@code org.openqa.selenium}
   *     logger to {@link Level#FINE} instead, which is the ordinary way to see Selenium's debug
   *     output. Enable it with {@code -Dselenium.debug=true}, the {@code SE_DEBUG} environment
   *     variable, or directly via {@code Logger.getLogger("org.openqa.selenium").setLevel(Level
   *     .FINE)}. This method's own behavior is unchanged and kept only for existing call sites
   *     still comparing against it.
   */
  @Deprecated(forRemoval = true)
  public static Level getDebugLogLevel() {
    return isDebugging() ? Level.INFO : Level.FINE;
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
   * -Dselenium.webdriver.verbose=true}, {@code SE_DEBUG}) onto the real {@code
   * org.openqa.selenium} logger: raises it to {@link Level#FINE} and attaches a handler Selenium
   * owns, filtered to leave {@link Level#INFO} and above to the caller's own handlers so output
   * they already print is never duplicated. Idempotent: repeated calls while the switches are
   * unchanged do nothing. Reversible: once every switch is off, the next call removes exactly the
   * handler this method installed and restores the logger's previous level. Safe to call from
   * concurrent driver construction.
   */
  public static synchronized void configureLogger() {
    boolean shouldDebug = isDebugging() || isDebugAll();
    if (shouldDebug == loggerConfigured) {
      return;
    }

    if (shouldDebug) {
      previousLevel = SELENIUM_LOGGER.getLevel();
      SELENIUM_LOGGER.setLevel(Level.FINE);

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
      SELENIUM_LOGGER.setLevel(previousLevel);
    }

    loggerConfigured = shouldDebug;
  }
}
