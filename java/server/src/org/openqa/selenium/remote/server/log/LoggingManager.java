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

package org.openqa.selenium.remote.server.log;

import org.openqa.selenium.grid.log.TerseFormatter;

import java.util.logging.ConsoleHandler;
import java.util.logging.Formatter;
import java.util.logging.Handler;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.logging.SimpleFormatter;

/**
 * Configure logging to Selenium taste.
 */
public class LoggingManager {

  private static PerSessionLogHandler perSessionLogHandler =
    new PerSessionLogHandler(4000, new TerseFormatter(), false);

  public static synchronized void configureLogging(boolean debugMode) {
    final Logger currentLogger;

    currentLogger = Logger.getLogger("");
    overrideSimpleFormatterWithTerseOneForConsoleHandler(currentLogger, debugMode);
    if (debugMode) {
      currentLogger.setLevel(Level.FINE);
    }
  }

  /**
   * Provides a PerSessionLogHandler
   */
  public static synchronized PerSessionLogHandler perSessionLogHandler() {
    return perSessionLogHandler;
  }

  public static void overrideSimpleFormatterWithTerseOneForConsoleHandler(
    Logger logger,
    boolean debugMode) {
    for (Handler handler : logger.getHandlers()) {
      if (handler instanceof ConsoleHandler) {
        final Formatter formatter;

        formatter = handler.getFormatter();
        if (formatter instanceof SimpleFormatter) {
          final StdOutHandler stdOutHandler;
          final Level originalLevel;

          /*
           * DGF - Nobody likes the SimpleFormatter; surely they wanted our terse formatter instead.
           */
          originalLevel = handler.getLevel();
          handler.setFormatter(new TerseFormatter());
          handler.setLevel(Level.WARNING);

          /*
           * Furthermore, we all want DEBUG/INFO on stdout and WARN/ERROR on stderr
           */
          stdOutHandler = new StdOutHandler();
          stdOutHandler.setFormatter(new TerseFormatter());
          stdOutHandler.setFilter(new MaxLevelFilter(Level.INFO));
          stdOutHandler.setLevel(originalLevel);
          logger.addHandler(stdOutHandler);
          if (debugMode) {
            if (originalLevel.intValue() > Level.FINE.intValue()) {
              stdOutHandler.setLevel(Level.FINE);
            }
          }
        }
      }
    }
  }
}
