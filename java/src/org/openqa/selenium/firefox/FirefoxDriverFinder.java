package org.openqa.selenium.firefox;

import org.openqa.selenium.remote.service.DriverFinder;

import java.io.File;

import static org.openqa.selenium.firefox.GeckoDriverService.GECKO_DRIVER_EXE_PROPERTY;
public class FirefoxDriverFinder extends DriverFinder {
  protected static File findExecutable() {
    return findExecutable(
      "geckodriver",
      GECKO_DRIVER_EXE_PROPERTY,
      "https://github.com/mozilla/geckodriver",
      "https://github.com/mozilla/geckodriver/releases");
  }

  protected static File findExecutable(FirefoxOptions options) {
    return findExecutable(
      "geckodriver",
      GECKO_DRIVER_EXE_PROPERTY,
      "https://github.com/mozilla/geckodriver",
      "https://github.com/mozilla/geckodriver/releases",
      options);
  }
}
