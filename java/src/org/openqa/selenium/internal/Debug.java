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
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.logging.SimpleFormatter;
import java.util.logging.StreamHandler;

/** Used to provide information about whether Selenium is running under debug mode. */
public class Debug {

  private static final boolean IS_DEBUG;
  private static final AtomicBoolean DEBUG_WARNING_LOGGED = new AtomicBoolean(false);
  private static boolean loggerConfigured = false;
  private static Logger seleniumLogger;

  static {
    IS_DEBUG =
        Boolean.getBoolean("selenium.debug") || Boolean.getBoolean("selenium.webdriver.verbose");
  }

  private Debug() {
    // Utility class
  }

  public static boolean isDebugging() {
    return IS_DEBUG;
  }

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

  public static void configureLogger() {
    if (!isDebugAll() || loggerConfigured) {
      return;
    }

    seleniumLogger = Logger.getLogger("org.openqa.selenium");
    seleniumLogger.setLevel(Level.FINE);

    StreamHandler handler = new StreamHandler(System.err, new SimpleFormatter());
    handler.setLevel(Level.FINE);
    seleniumLogger.addHandler(handler);
    loggerConfigured = true;
  }
}
