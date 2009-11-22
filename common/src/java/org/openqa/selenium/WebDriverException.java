/*
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.

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

public class WebDriverException extends RuntimeException {

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
    return String.format("%sSystem info: %s\nDriver info: %s",
                         originalMessageString == null ? "" : originalMessageString + "\n",
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

  public String getDriverInformation() {
    for (StackTraceElement e : getStackTrace()) {
      if (e.getClassName().startsWith("org.openqa.selenium")) {
        String[] bits = e.getClassName().split("\\.");
        if (bits.length > 3 && !"support".equals("bits")) {
          return "driver.version: " + bits[3];
        }
      }
    }

    return "driver.version: unknown";
  }
}
