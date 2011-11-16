package org.openqa.selenium;

import java.net.MalformedURLException;
import java.net.URL;

import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;

import com.google.common.base.Preconditions;
import com.google.common.base.Throwables;

public class SauceDriver extends RemoteWebDriver {
  private static final String SELENIUM_VERSION_ENV_NAME = "SELENIUM_VERSION";
  private static final String SAUCE_APIKEY_ENV_NAME = "SAUCE_APIKEY";
  private static final String SAUCE_USERNAME_ENV_NAME = "SAUCE_USERNAME";

  public SauceDriver(DesiredCapabilities desiredCapabilities) {
    super(getSauceEndpoint(), munge(desiredCapabilities, getSeleniumVersion()));
  }

  private static String getSeleniumVersion() {
    String seleniumVersion = System.getenv(SELENIUM_VERSION_ENV_NAME);
    Preconditions.checkNotNull(seleniumVersion);
    return seleniumVersion;
  }

  private static URL getSauceEndpoint() {
    String sauceUsername = System.getenv(SAUCE_USERNAME_ENV_NAME);
    String sauceKey = System.getenv(SAUCE_APIKEY_ENV_NAME);
    Preconditions.checkNotNull(sauceUsername);
    Preconditions.checkNotNull(sauceKey);

    try {
      return new URL(String.format("http://%s:%s@ondemand.saucelabs.com:80/wd/hub", sauceUsername, sauceKey));
    } catch (MalformedURLException e) {
      Throwables.propagate(e);
    }
    throw new IllegalStateException("Should have returned or thrown");
  }

  private static Capabilities munge(DesiredCapabilities desiredCapabilities, String seleniumVersion) {
    DesiredCapabilities mungedCapabilities = new DesiredCapabilities(desiredCapabilities);
    mungedCapabilities.setCapability("selenium.version", seleniumVersion);
    return mungedCapabilities;
  }
}
