/*
 * Copyright 2006 ThoughtWorks, Inc.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */
package org.openqa.selenium.server.browserlaunchers;

import org.apache.commons.logging.Log;
import org.openqa.jetty.log.LogFactory;
import org.openqa.selenium.server.BrowserConfigurationOptions;
import org.openqa.selenium.server.RemoteControlConfiguration;

import java.lang.reflect.Constructor;
import java.lang.reflect.InvocationTargetException;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Returns BrowserLaunchers based on simple strings given by the user
 *
 * @author danielf
 */
public class BrowserLauncherFactory {

  private static Log LOGGER = LogFactory.getLog(BrowserLauncherFactory.class);

  private static final Pattern CUSTOM_PATTERN = Pattern.compile("^\\*?custom( .*)?$");

  private static final Map<String, Class<? extends BrowserLauncher>> supportedBrowsers =
      new HashMap<String, Class<? extends BrowserLauncher>>();

  static {
    supportedBrowsers.put("firefoxproxy", FirefoxCustomProfileLauncher.class);
    supportedBrowsers.put("firefox", FirefoxLauncher.class);
    supportedBrowsers.put("chrome", FirefoxChromeLauncher.class);
    supportedBrowsers.put("firefoxchrome", FirefoxChromeLauncher.class);
    supportedBrowsers.put("firefox2", Firefox2Launcher.class);
    supportedBrowsers.put("firefox3", Firefox3Launcher.class);
    supportedBrowsers.put("iexploreproxy", InternetExplorerCustomProxyLauncher.class);
    supportedBrowsers.put("safari", SafariLauncher.class);
    supportedBrowsers.put("safariproxy", SafariCustomProfileLauncher.class);
    supportedBrowsers.put("iehta", HTABrowserLauncher.class);
    supportedBrowsers.put("iexplore", InternetExplorerLauncher.class);
    supportedBrowsers.put("opera", OperaCustomProfileLauncher.class);
    supportedBrowsers.put("piiexplore", ProxyInjectionInternetExplorerCustomProxyLauncher.class);
    supportedBrowsers.put("pifirefox", ProxyInjectionFirefoxCustomProfileLauncher.class);
    // DGF pisafari isn't working yet
    //supportedBrowsers.put("pisafari", ProxyInjectionSafariCustomProfileLauncher.class);
    supportedBrowsers.put("konqueror", KonquerorLauncher.class);
    supportedBrowsers.put("mock", MockBrowserLauncher.class);
    supportedBrowsers.put("googlechrome", GoogleChromeLauncher.class);
  }

  public BrowserLauncherFactory() {
  }

  /**
   * Returns the browser given by the specified browser string
   *
   * @param browser        a browser string like "*firefox"
   * @param sessionId      the sessionId to launch
   * @param browserOptions TODO
   * @return the BrowserLauncher ready to launch
   */
  public BrowserLauncher getBrowserLauncher(String browser, String sessionId, RemoteControlConfiguration configuration, BrowserConfigurationOptions browserOptions) {
    if (browser == null) {
      throw new IllegalArgumentException("browser may not be null");
    }
    String executablePath = null;
    if (browserOptions.hasOptions()) {
      executablePath = browserOptions.getExecutablePath();
    } else {
      configuration.copySettingsIntoBrowserOptions(browserOptions);
    }

    for (String key : supportedBrowsers.keySet()) {
      final BrowserStringParser.Result result;
      result = new BrowserStringParser().parseBrowserStartCommand(key, browser);
      if (result.match()) {
        if (executablePath == null) {
          executablePath = result.customLauncher();
          browserOptions.setExecutablePath(executablePath);
        }
        LOGGER.debug("Requested browser string '" + browser + "' matches *" + key + " ");
        return createBrowserLauncher(supportedBrowsers.get(key), executablePath, sessionId,
            configuration, browserOptions);
      }
    }

    LOGGER.debug("Requested browser string '" + browser
                 + "' does not match any known browser, treating it as a custom browser...");
    Matcher CustomMatcher = CUSTOM_PATTERN.matcher(browser);
    if (CustomMatcher.find()) {
      String browserStartCommand = CustomMatcher.group(1);
      if (browserStartCommand == null) {
        throw new RuntimeException(
            "You must specify the path to an executable when using *custom!\n\n");
      }
      browserStartCommand = browserStartCommand.substring(1);
      return new CustomBrowserLauncher(browserStartCommand, sessionId, configuration,
          browserOptions);
    }
    throw browserNotSupported(browser);
  }


  public static Map<String, Class<? extends BrowserLauncher>> getSupportedLaunchers() {
    return supportedBrowsers;
  }

  public static void addBrowserLauncher(String browser, Class<? extends BrowserLauncher> clazz) {
    supportedBrowsers.put(browser, clazz);
  }

  private RuntimeException browserNotSupported(String browser) {
    StringBuffer errorMessage = new StringBuffer("Browser not supported: " + browser);
    errorMessage.append('\n');
    if (!browser.startsWith("*")) {
      errorMessage.append("(Did you forget to add a *?)\n");
    }
    errorMessage.append('\n');
    errorMessage.append("Supported browsers include:\n");
    for (String name : supportedBrowsers.keySet()) {
      errorMessage.append("  *").append(name).append('\n');
    }
    errorMessage.append("  *custom\n");
    return new RuntimeException(errorMessage.toString());
  }

  private BrowserLauncher createBrowserLauncher(Class<? extends BrowserLauncher> c, String browserStartCommand,
                                                String sessionId, RemoteControlConfiguration configuration, BrowserConfigurationOptions browserOptions) {
    try {
      try {
        final BrowserLauncher browserLauncher;
        final Constructor<? extends BrowserLauncher> ctor;
        ctor = c.getConstructor(BrowserConfigurationOptions.class, RemoteControlConfiguration.class,
            String.class, String.class);
        browserLauncher =
            ctor.newInstance(browserOptions, configuration, sessionId, browserStartCommand);

        return browserLauncher;
      } catch (InvocationTargetException e) {
        throw e.getTargetException();
      }
    } catch (Throwable e) {
      throw new RuntimeException(e);
    }
  }
}
