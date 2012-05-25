/*
Copyright 2007-2009 Selenium committers

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

package org.openqa.selenium;

import org.openqa.selenium.internal.BuildInfo;

public class WebDriverException extends RuntimeException {

  private String sessionId;

  public WebDriverException() {
    super();
  }

  public WebDriverException(String message) {
    super(message);
  }

  public WebDriverException(Throwable cause) {
    super(cause);
  }

  public WebDriverException(String message, Throwable cause) {
    super(message, cause);
  }

  @Override
  public String getMessage() {
    return createMessage(super.getMessage());
  }

  private String createMessage(String originalMessageString) {
    String supportMessage = getSupportUrl() == null ?
        "" : "For documentation on this error, please visit: " + getSupportUrl() + "\n";

    return String.format("%s%s%s\nSystem info: %s\nDriver info: %s",
        originalMessageString == null ? "" : originalMessageString + "\n",
        supportMessage,
        getBuildInformation(),
        getSystemInformation(),
        getDriverInformation());
  }

  public String getSystemInformation() {
    return String.format("os.name: '%s', os.arch: '%s', os.version: '%s', java.version: '%s'",
        System.getProperty("os.name"),
        System.getProperty("os.arch"),
        System.getProperty("os.version"),
        System.getProperty("java.version"));
  }

  public String getSupportUrl() {
    return null;
  }

  public BuildInfo getBuildInformation() {
    return new BuildInfo();
  }

  public String getDriverInformation() {
    String driverInformation = "driver.version: " + getDriverName(getStackTrace());
    if (sessionId != null) {
      driverInformation += "\nSession ID: " + sessionId;
    }
    return driverInformation;
  }

  public void setSessionId(String sessionId) {
    this.sessionId = sessionId;
  }

  public static String getDriverName(StackTraceElement[] stackTraceElements) {
    String driverName = "unknown";
    for (StackTraceElement e : stackTraceElements) {
      if (e.getClassName().endsWith("Driver")) {
        String[] bits = e.getClassName().split("\\.");
        driverName = bits[bits.length - 1];
      }
    }

    return driverName;
  }
}
