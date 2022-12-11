package org.openqa.selenium.chrome;

import org.openqa.selenium.remote.service.DriverFinder;

import java.io.File;

import static org.openqa.selenium.chrome.ChromeDriverService.CHROME_DRIVER_EXE_PROPERTY;
public class ChromeDriverFinder extends DriverFinder {
  protected static File findExecutable() {
    return findExecutable(
      "chromedriver",
      CHROME_DRIVER_EXE_PROPERTY,
      "https://chromedriver.chromium.org/",
      "https://chromedriver.chromium.org/downloads");
  }

  protected static File findExecutable(ChromeOptions options) {
    return findExecutable(
      "chromedriver",
      CHROME_DRIVER_EXE_PROPERTY,
      "https://chromedriver.chromium.org/",
      "https://chromedriver.chromium.org/downloads",
      options);
  }
}
