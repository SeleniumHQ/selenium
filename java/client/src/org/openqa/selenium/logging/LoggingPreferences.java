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

package org.openqa.selenium.logging;

import org.openqa.selenium.Beta;

import java.io.Serializable;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import java.util.logging.Level;

/**
 * Represents the logging preferences.
 *
 * Sample usage:
 *  DesiredCapabilities caps = DesiredCapabilities.firefox();
 *  LoggingPreferences logs = new LoggingPreferences();
 *  logs.enable(LogType.DRIVER, Level.INFO);
 *  caps.setCapability(CapabilityType.LOGGING_PREFS, logs);
 *
 *  WebDriver driver = new FirefoxDriver(caps);
 */
public class LoggingPreferences implements Serializable {

  private static final long serialVersionUID = 6708028456766320675L;

  // Mapping the {@link LogType} to {@link Level}
  private final Map<String, Level> prefs = new HashMap<>();

  /**
   * Enables logging for the given log type at the specified level and above.
   * @param logType String the logType. Can be any of {@link LogType}.
   * @param level {@link Level} the level.
   */
  public void enable(String logType, Level level) {
    prefs.put(logType, level);
  }

  /**
   * @return the set of log types for which logging has been enabled.
   */
  public Set<String> getEnabledLogTypes() {
    return new HashSet<>(prefs.keySet());
  }

  /**
   * @param logType The log type.
   * @return the {@link Level} for the given {@link LogType} if enabled.
   *     Otherwise returns {@link Level#OFF}.
   */
  public Level getLevel(String logType) {
    return prefs.get(logType) == null ? Level.OFF : prefs.get(logType);
  }

  /**
   * Adds the given logging preferences giving them precedence over existing
   * preferences.
   *
   * @param prefs The logging preferences to add.
   * @return A references to this object.
   */
  public LoggingPreferences addPreferences(LoggingPreferences prefs) {
    if (prefs == null) {
      return this;
    }
    for (String logType : prefs.getEnabledLogTypes()) {
      enable(logType, prefs.getLevel(logType));
    }
    return this;
  }

  @Override
  public int hashCode() {
    return prefs.hashCode();
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (!(o instanceof LoggingPreferences)) {
      return false;
    }

    LoggingPreferences that = (LoggingPreferences) o;

    return prefs.equals(that.prefs);
  }

  @Beta
  public Map<String, Object> toJson() {
    TreeMap<String, Object> converted = new TreeMap<>();
    for (String logType : getEnabledLogTypes()) {
      converted.put(logType, LogLevelMapping.getName(getLevel(logType)));
    }
    return converted;
  }
}
