/*
Copyright 2010 Selenium committers

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package org.openqa.selenium.android.library;

import java.util.logging.Level;

public class Logger {
  private static final java.util.logging.Logger logger;

  static {
    logger = java.util.logging.Logger.getLogger("AndroidWebDriver");
    logger.setLevel(Level.WARNING);
  }

  /**
   * Sets the logging level for this logger.
   * @param level
   */
  public static void setLevel(Level level) {
    logger.setLevel(level);
  }

  public static void log(Level value, String className, String methodName, String message) {
    logger.logp(value, className, methodName, message);
  }
  
  public static void setDebugMode(boolean enabled) {
    setLevel(Level.FINE);
  }

  public static java.util.logging.Logger getLogger() {
    return logger;
  }
}
