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

import java.lang.management.ManagementFactory;
import java.util.logging.Level;

/**
 * Used to provide information about whether or not Selenium is running
 * under debug mode.
 */
public class Debug {

  private static boolean IS_DEBUG;
  static {
    boolean debugFlag = ManagementFactory.getRuntimeMXBean().getInputArguments().stream()
      .map(str -> str.contains("-agentlib:jdwp"))
      .reduce(Boolean::logicalOr)
      .orElse(false);
    boolean simpleProperty = Boolean.getBoolean("selenium.debug");
    boolean longerProperty = Boolean.getBoolean("selenium.webdriver.verbose");

    IS_DEBUG = debugFlag || simpleProperty || longerProperty;
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
}
