/*
Copyright 2011 WebDriver committers
Copyright 2011 Google Inc.

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

package org.openqa.selenium.server.browserlaunchers;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.remote.DesiredCapabilities;

import java.util.concurrent.TimeUnit;

public class BrowserOptions {
  private BrowserOptions() {
    // Utility class
  }

  public static boolean isSingleWindow(Capabilities capabilities) {
    return capabilities.is("singleWindow");
  }

  public static String getExecutablePath(Capabilities capabilities) {
    return (String) capabilities.getCapability("executablePath");
  }

  public static String getProfile(Capabilities capabilities) {
    return (String) capabilities.getCapability("profile");
  }

  public static String getCommandLineFlags(Capabilities capabilities) {
    return (String) capabilities.getCapability("commandLineFlags");
  }

  public static long getTimeoutInSeconds(Capabilities capabilities) {
    String value = (String) capabilities.getCapability("timeoutInSeconds");
    if (value == null) {
      return TimeUnit.MINUTES.toSeconds(30);
    }

    return Long.parseLong(value);
  }
}
