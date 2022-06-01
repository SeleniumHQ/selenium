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

package org.openqa.selenium.remote;

/**
 * Commonly seen remote webdriver capabilities.
 */
public interface CapabilityType {

  /**
   * @deprecated Use {@link CapabilityType#PLATFORM_NAME}
   */
  @Deprecated
  String PLATFORM = "platform";
  /**
   * @deprecated Non W3C compliant
   */
  @Deprecated
  String SUPPORTS_JAVASCRIPT = "javascriptEnabled";
  /**
   * @deprecated Non W3C compliant
   */
  @Deprecated
  String TAKES_SCREENSHOT = "takesScreenshot";
  /**
   * @deprecated Use {@link CapabilityType#BROWSER_VERSION}
   */
  @Deprecated
  String VERSION = "version";
  /**
   * @deprecated Use {@link CapabilityType#UNHANDLED_PROMPT_BEHAVIOUR}
   */
  @Deprecated
  String SUPPORTS_ALERTS = "handlesAlerts";
  /**
   * @deprecated Non W3C compliant
   */
  @Deprecated
  String SUPPORTS_SQL_DATABASE = "databaseEnabled";
  /**
   * @deprecated Non W3C compliant
   */
  @Deprecated
  String SUPPORTS_LOCATION_CONTEXT = "locationContextEnabled";
  /**
   * @deprecated Non W3C compliant
   */
  @Deprecated
  String SUPPORTS_APPLICATION_CACHE = "applicationCacheEnabled";
  /**
   * @deprecated Non W3C compliant
   */
  @Deprecated
  String SUPPORTS_NETWORK_CONNECTION = "networkConnectionEnabled";
  /**
   * @deprecated Non W3C compliant
   */
  @Deprecated
  String SUPPORTS_WEB_STORAGE = "webStorageEnabled";
  /**
   * @deprecated Non W3C compliant
   */
  @Deprecated
  String ROTATABLE = "rotatable";
  /**
   * @deprecated Non W3C compliant
   */
  @Deprecated
  String APPLICATION_NAME = "applicationName";
  /**
   * @deprecated Use {@link CapabilityType#ACCEPT_INSECURE_CERTS}
   */
  @Deprecated
  String ACCEPT_SSL_CERTS = "acceptSslCerts";
  /**
   * @deprecated Non W3C compliant
   */
  @Deprecated
  String HAS_NATIVE_EVENTS = "nativeEvents";
  /**
   * @deprecated Use {@link CapabilityType#UNHANDLED_PROMPT_BEHAVIOUR}
   */
  @Deprecated
  String UNEXPECTED_ALERT_BEHAVIOUR = "unexpectedAlertBehaviour";
  /**
   * @deprecated Non W3C compliant
   */
  @Deprecated
  String ELEMENT_SCROLL_BEHAVIOR = "elementScrollBehavior";
  /**
   * @deprecated Non W3C compliant
   */
  @Deprecated
  String HAS_TOUCHSCREEN = "hasTouchScreen";
  /**
   * @deprecated Non W3C compliant
   */
  @Deprecated
  String OVERLAPPING_CHECK_DISABLED = "overlappingCheckDisabled";

  /**
   * @deprecated Non W3C compliant
   * Use {@link org.openqa.selenium.chrome.ChromeOptions#LOGGING_PREFS} or
   * Use {@link org.openqa.selenium.edge.EdgeOptions#LOGGING_PREFS}
   */
  @Deprecated
  String LOGGING_PREFS = "loggingPrefs";

  /**
   * @deprecated Non W3C compliant
   */
  @Deprecated
  String ENABLE_PROFILING_CAPABILITY = "webdriver.logging.profiler.enabled";


  String BROWSER_NAME = "browserName";
  String PLATFORM_NAME = "platformName";
  String BROWSER_VERSION = "browserVersion";
  String ACCEPT_INSECURE_CERTS = "acceptInsecureCerts";
  String PAGE_LOAD_STRATEGY = "pageLoadStrategy";
  String PROXY = "proxy";
  String SET_WINDOW_RECT = "setWindowRect";
  String TIMEOUTS = "timeouts";
  String STRICT_FILE_INTERACTABILITY = "strictFileInteractability";
  String UNHANDLED_PROMPT_BEHAVIOUR = "unhandledPromptBehavior";


  /**
   * @deprecated Non W3C compliant
   */
  @Deprecated
  interface ForSeleniumServer {

    /**
     * @deprecated Non W3C compliant
     */
    @Deprecated
    String AVOIDING_PROXY = "avoidProxy";
    /**
     * @deprecated Non W3C compliant
     */
    @Deprecated
    String ONLY_PROXYING_SELENIUM_TRAFFIC = "onlyProxySeleniumTraffic";
    /**
     * @deprecated Non W3C compliant
     */
    @Deprecated
    String PROXYING_EVERYTHING = "proxyEverything";
    /**
     * @deprecated Non W3C compliant
     */
    @Deprecated
    String PROXY_PAC = "proxy_pac";
    /**
     * @deprecated Non W3C compliant
     */
    @Deprecated
    String ENSURING_CLEAN_SESSION = "ensureCleanSession";
  }
}
