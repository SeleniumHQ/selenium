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

package org.openqa.selenium.chromium;

import com.google.common.collect.ImmutableMap;
import java.util.Map;
import java.util.logging.Level;

/**
 * <a
 * href="https://source.chromium.org/chromium/chromium/src/+/master:chrome/test/chromedriver/logging.cc">
 * Log levels</a> defined by ChromeDriver
 */
public enum ChromiumDriverLogLevel {
  ALL,
  INFO,
  DEBUG,
  WARNING,
  SEVERE,
  OFF;

  private static final Map<Level, ChromiumDriverLogLevel> logLevelToChromeLevelMap =
      new ImmutableMap.Builder<Level, ChromiumDriverLogLevel>()
          .put(Level.ALL, ALL)
          .put(Level.FINEST, DEBUG)
          .put(Level.FINER, DEBUG)
          .put(Level.FINE, DEBUG)
          .put(Level.INFO, INFO)
          .put(Level.WARNING, WARNING)
          .put(Level.SEVERE, SEVERE)
          .put(Level.OFF, OFF)
          .build();

  @Override
  public String toString() {
    return super.toString().toLowerCase();
  }

  public static ChromiumDriverLogLevel fromString(String text) {
    if (text != null) {
      for (ChromiumDriverLogLevel b : ChromiumDriverLogLevel.values()) {
        if (text.equalsIgnoreCase(b.toString())) {
          return b;
        }
      }
    }
    return null;
  }

  public static ChromiumDriverLogLevel fromLevel(Level level) {
    return logLevelToChromeLevelMap.getOrDefault(level, ALL);
  }
}
