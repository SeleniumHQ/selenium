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


import java.io.File;
import java.util.logging.Level;

public class LoggingOptions {

  /**
   * useful for situations where Selenium is being invoked programatically and the outside container
   * wants to own logging
   */
  private boolean dontTouchLogging;
  private boolean captureLogsOnQuit;
  private String logOutFileName = getDefaultLogOutFile();

  public boolean dontTouchLogging() {
    return dontTouchLogging;
  }

  public void setDontTouchLogging(boolean newValue) {
    this.dontTouchLogging = newValue;
  }

  public int shortTermMemoryLoggerCapacity() {
    return 30;
  }

  public boolean isCaptureOfLogsOnQuitEnabled() {
    return captureLogsOnQuit;
  }

  public void setCaptureLogsOnQuit(boolean captureLogs) {
    this.captureLogsOnQuit = captureLogs;
  }

  public File getLogOutFile() {
    return (null == logOutFileName) ? null : new File(logOutFileName);
  }

  public void setLogOutFileName(String newLogOutFileName) {
    logOutFileName = newLogOutFileName;
  }

  public String getLogOutFileName() {
    return logOutFileName;
  }

  public void setLogOutFile(File newLogOutFile) {
    logOutFileName = (null == newLogOutFile) ? null : newLogOutFile.getAbsolutePath();
  }

  public static String getDefaultLogOutFile() {
    final String logOutFileProperty;

    logOutFileProperty = System.getProperty("selenium.LOGGER");
    if (null == logOutFileProperty) {
      return null;
    }
    return new File(logOutFileProperty).getAbsolutePath();
  }

  public static Level getDefaultLogLevel() {
    final String logLevelProperty = System.getProperty("selenium.LOGGER.level");
    if (null == logLevelProperty) {
      return null;
    }
    return Level.parse(logLevelProperty);
  }
}
