/*
Copyright 2011 Selenium committers
Copyright 2011 Software Freedom Conservancy

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

package org.openqa.selenium.testing.drivers;

import java.net.MalformedURLException;
import java.net.URL;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.Platform;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;

import com.google.common.base.Preconditions;
import com.google.common.base.Strings;
import com.google.common.base.Throwables;

public class SauceDriver extends RemoteWebDriver {
  private static final String SAUCE_JOB_NAME_ENV_NAME = "SAUCE_JOB_NAME";
  private static final String SELENIUM_VERSION_ENV_NAME = "SAUCE_SELENIUM_VERSION";
  private static final String SELENIUM_IEDRIVER_ENV_NAME = "SAUCE_IEDRIVER_VERSION";
  private static final String SAUCE_APIKEY_ENV_NAME = "SAUCE_APIKEY";
  private static final String SAUCE_USERNAME_ENV_NAME = "SAUCE_USERNAME";
  private static final String DESIRED_BROWSER_VERSION_ENV_NAME = "SAUCE_BROWSER_VERSION";
  
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
      Throwables.propagate(e);
    }
    throw new IllegalStateException("Should have returned or thrown");
  }

  private static Capabilities munge(Capabilities desiredCapabilities, String seleniumVersion, String browserVersion, Platform platform) {
    DesiredCapabilities mungedCapabilities = new DesiredCapabilities(desiredCapabilities);
    mungedCapabilities.setCapability("selenium-version", seleniumVersion);
    mungedCapabilities.setCapability("idle-timeout", 180);
    mungedCapabilities.setCapability("disable-popup-handler", true);
    
    mungedCapabilities.setCapability("prevent-requeue", true);
    
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
        mungedCapabilities.setCapability("iedriver-version", System.getenv(SELENIUM_IEDRIVER_ENV_NAME));
      }
    }
    mungedCapabilities.setCapability("public", true);
    return mungedCapabilities;
  }

  public static boolean shouldUseSauce() {
    return System.getenv(USE_SAUCE_ENV_NAME) != null;
  }

  public static Platform getEffectivePlatform() {
    return Platform.extractFromSysProperty(getDesiredOS());
  }
}
