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

package org.openqa.selenium.testing.drivers;

import com.google.common.base.Preconditions;
import com.google.common.base.Strings;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.Platform;
import org.openqa.selenium.ie.InternetExplorerDriver;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.DriverCommand;
import org.openqa.selenium.remote.RemoteWebDriver;

import java.net.MalformedURLException;
import java.net.URL;

public class SauceDriver extends RemoteWebDriver {

  private static final String SAUCE_JOB_NAME_ENV_NAME = "SAUCE_JOB_NAME";
  private static final String SELENIUM_VERSION_ENV_NAME = "SAUCE_SELENIUM_VERSION";
  private static final String SELENIUM_IEDRIVER_ENV_NAME = "SAUCE_IEDRIVER_VERSION";
  private static final String SELENIUM_CHROMEDRIVER_ENV_NAME = "SAUCE_CHROMEDRIVER_VERSION";
  private static final String SAUCE_APIKEY_ENV_NAME = "SAUCE_APIKEY";
  private static final String SAUCE_USERNAME_ENV_NAME = "SAUCE_USERNAME";
  private static final String DESIRED_BROWSER_VERSION_ENV_NAME = "SAUCE_BROWSER_VERSION";
  private static final String SAUCE_DISABLE_VIDEO_ENV_NAME = "SAUCE_DISABLE_VIDEO";
  private static final String SAUCE_BUILD_ENV_NAME = "SAUCE_BUILD_NUMBER";
  private static final String SAUCE_NATIVE_ENV_NAME = "native_events";
  private static final String SAUCE_REQUIRE_FOCUS_ENV_NAME = "REQUIRE_FOCUS";

  private static final String USE_SAUCE_ENV_NAME = "USE_SAUCE";

  // Should be one of the values listed for Platform, e.g. xp, win7, android, ...
  private static final String DESIRED_OS_ENV_NAME = "SAUCE_OS";
  // Optional to override default
  private static final String SAUCE_URL_ENV_NAME = "SAUCE_URL";
  private static final String DEFAULT_SAUCE_URL = "ondemand.saucelabs.com:80";

  public SauceDriver(Capabilities desiredCapabilities) {
    super(getSauceEndpoint(),
      munge(
        desiredCapabilities,
        getSeleniumVersion(),
        getDesiredBrowserVersion(),
        getEffectivePlatform()));
    System.out.println("Started new SauceDriver; see job at https://saucelabs.com/jobs/" + this.getSessionId());
  }

  private static String getDesiredBrowserVersion() {
    return System.getenv(DESIRED_BROWSER_VERSION_ENV_NAME);
  }

  private static String getDesiredOS() {
    return getNonNullEnv(DESIRED_OS_ENV_NAME);
  }

  private static String getSeleniumVersion() {
    return getNonNullEnv(SELENIUM_VERSION_ENV_NAME);
  }

  private static String getNonNullEnv(String propertyName) {
    String value = System.getenv(propertyName);
    Preconditions.checkNotNull(value);
    return value;
  }

  private static URL getSauceEndpoint() {
    String sauceUsername = getNonNullEnv(SAUCE_USERNAME_ENV_NAME);
    String sauceKey = getNonNullEnv(SAUCE_APIKEY_ENV_NAME);
    String sauceUrl = System.getenv(SAUCE_URL_ENV_NAME);
    if (sauceUrl == null) {
      sauceUrl = DEFAULT_SAUCE_URL;
    }

    try {
      return new URL(String.format("http://%s:%s@%s/wd/hub", sauceUsername, sauceKey, sauceUrl));
    } catch (MalformedURLException e) {
      throw new RuntimeException(e);
    }
  }

  private static Capabilities munge(Capabilities desiredCapabilities, String seleniumVersion, String browserVersion, Platform platform) {
    DesiredCapabilities mungedCapabilities = new DesiredCapabilities(desiredCapabilities);
    mungedCapabilities.setCapability("selenium-version", seleniumVersion);
    mungedCapabilities.setCapability("idle-timeout", 180);
    mungedCapabilities.setCapability("disable-popup-handler", true);
    mungedCapabilities.setCapability("public", "public");
    mungedCapabilities.setCapability("record-video", shouldRecordVideo());
    mungedCapabilities.setCapability("build", System.getenv(SAUCE_BUILD_ENV_NAME));

    String nativeEvents = System.getenv(SAUCE_NATIVE_ENV_NAME);
    if (nativeEvents != null) {
        String[] tags = {nativeEvents};
        mungedCapabilities.setCapability("tags", tags);
    }
    mungedCapabilities.setCapability("prevent-requeue", false);

    if (!Strings.isNullOrEmpty(browserVersion)) {
      mungedCapabilities.setVersion(browserVersion);
    }
    mungedCapabilities.setPlatform(platform);

    String jobName = System.getenv(SAUCE_JOB_NAME_ENV_NAME);
    if (jobName != null) {
      mungedCapabilities.setCapability("name", jobName);
    }

    if (DesiredCapabilities.internetExplorer().getBrowserName().equals(desiredCapabilities.getBrowserName())) {
      String ieDriverVersion = System.getenv(SELENIUM_IEDRIVER_ENV_NAME);
      if (ieDriverVersion != null) {
        mungedCapabilities.setCapability("iedriver-version", ieDriverVersion);
      }
      mungedCapabilities.setCapability(InternetExplorerDriver.REQUIRE_WINDOW_FOCUS, true);
    }

    if (DesiredCapabilities.chrome().getBrowserName().equals(desiredCapabilities.getBrowserName())) {
      String chromeDriverVersion = System.getenv(SELENIUM_CHROMEDRIVER_ENV_NAME);
      if (chromeDriverVersion != null) {
        System.out.println("Setting chromedriver-version capability to " + chromeDriverVersion);
        mungedCapabilities.setCapability("chromedriver-version", chromeDriverVersion);
      }
    }

    String requireFocus = System.getenv(SAUCE_REQUIRE_FOCUS_ENV_NAME);
    if (requireFocus != null) {
        mungedCapabilities.setCapability(InternetExplorerDriver.REQUIRE_WINDOW_FOCUS,
            Boolean.parseBoolean(requireFocus));
    }

    return mungedCapabilities;
  }

  public static boolean shouldUseSauce() {
    return System.getenv(USE_SAUCE_ENV_NAME) != null;
  }

  public static boolean shouldRecordVideo() {
    return ! Boolean.parseBoolean(System.getenv(SAUCE_DISABLE_VIDEO_ENV_NAME));
  }

  public static Platform getEffectivePlatform() {
    return Platform.extractFromSysProperty(getDesiredOS());
  }

  public <X> X getScreenshotAs(OutputType<X> target) {
    // Get the screenshot as base64.
    String base64 = (String) execute(DriverCommand.SCREENSHOT).getValue();
    // ... and convert it.
    return target.convertFromBase64Png(base64);
  }
}
