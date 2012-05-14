/*
Copyright 2011 Selenium committers

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
import org.openqa.selenium.browserlaunchers.Proxies;
import org.openqa.selenium.remote.DesiredCapabilities;

import java.io.File;

public class BrowserOptions {
  private static final String OPTIONS_SET = "optionsSet";

  private BrowserOptions() {
    // Utility class
  }

  public static Capabilities newBrowserOptions() {
    DesiredCapabilities caps = new DesiredCapabilities();

    return Proxies.setProxyRequired(caps, true);
  }

  public static Capabilities newBrowserOptions(String browserConfiguration) {
    // Attempt to build the capabilities directly from the browserConfiguration
    DesiredCapabilities caps = buildFromSemiColonSeparatedOptions(browserConfiguration);

    Capabilities toReturn = Proxies.setProxyRequired(caps, true);
    return toReturn;
  }

  private static DesiredCapabilities buildFromSemiColonSeparatedOptions(
      String browserConfiguration) {
    DesiredCapabilities caps = new DesiredCapabilities();
    // "name=value;name=value"
    String[] optionsPairList = browserConfiguration.split(";");
    for (String anOptionsPairList : optionsPairList) {
      String[] option = anOptionsPairList.split("=", 2);
      if (2 == option.length) {
        String optionsName = option[0].trim();
        String optionValue = option[1].trim();
        caps.setCapability(optionsName, optionValue);
        caps.setCapability(OPTIONS_SET, true);
      }
    }

    return caps;
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

  public static boolean isTimeoutSet(Capabilities capabilities) {
    return getTimeoutInSeconds(capabilities) != 0;
  }

  public static long getTimeoutInSeconds(Capabilities capabilities) {
    Object value = capabilities.getCapability("timeoutInSeconds");

    if (value == null) {
      return 0;
    }

    if (value instanceof Long) {
      return (Long) value;
    }

    return Long.parseLong(String.valueOf(value));
  }

  public static boolean hasOptionsSet(Capabilities caps) {
    boolean options = false;

    options |= isSingleWindow(caps);
    options |= getExecutablePath(caps) != null;
    options |= caps.is(OPTIONS_SET);

    return options;
  }

  public static Capabilities setSingleWindow(Capabilities source, boolean singleWindow) {
    DesiredCapabilities toReturn = newDesiredCapabilities(source);
    toReturn.setCapability("singleWindow", singleWindow);
    return toReturn;
  }

  public static Capabilities setExecutablePath(Capabilities source, String executablePath) {
    DesiredCapabilities toReturn = newDesiredCapabilities(source);
    toReturn.setCapability("executablePath", executablePath);
    return toReturn;
  }

  private static DesiredCapabilities newDesiredCapabilities(Capabilities source) {
    if (source instanceof DesiredCapabilities) {
      return (DesiredCapabilities) source;
    }
    return new DesiredCapabilities(source);
  }

  public static File getFile(Capabilities capabilities, String key) {
    Object value = capabilities.getCapability(key);
    if (value == null) {
      return null;
    }
    if (value instanceof File) {
      return (File) value;
    }
    return new File(String.valueOf(value));
  }
}
