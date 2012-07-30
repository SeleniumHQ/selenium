/*
Copyright 2012 Software Freedom Conservancy

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

package org.openqa.selenium.logging;

import java.util.Map;
import java.util.logging.Level;

import com.google.common.collect.ImmutableMap;

public class LogLevelMapping {

  private static Map<Long, Level> levelMap;

  static {
    Level[] supportedLevels = new Level[] {
      Level.ALL,
      Level.FINE,
      Level.INFO,
      Level.WARNING,
      Level.SEVERE,
      Level.OFF
    };
    ImmutableMap.Builder<Long, Level> builder = ImmutableMap.builder();
    for (Level level : supportedLevels) {
      builder.put((long)level.intValue(), level);
    }
    levelMap = builder.build();
  }
  
  /**
   *  WebDriver log level DEBUG which is mapped to Level.FINE. 
   */
  private static final String DEBUG = "DEBUG";
  
  public static Level toLevel(long longValue) {
    return levelMap.get(longValue);
  }
  
  public static Level toLevel(String logLevelName) {
    if (logLevelName.equals(DEBUG)) {
      return Level.FINE;
    }
    return levelMap.get((long)Level.parse(logLevelName).intValue());
  }
}