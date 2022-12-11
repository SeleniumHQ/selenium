package org.openqa.selenium.ie;

import org.openqa.selenium.remote.service.DriverFinder;

import java.io.File;

import static org.openqa.selenium.ie.InternetExplorerDriverService.IE_DRIVER_EXE_PROPERTY;
public class InternetExplorerDriverFinder extends DriverFinder {
  protected static File findExecutable() {
    return findExecutable(
      "IEDriverServer",
      IE_DRIVER_EXE_PROPERTY,
      "https://www.selenium.dev/documentation/ie_driver_server/",
      "https://www.selenium.dev/downloads/");
  }

  protected static File findExecutable(InternetExplorerOptions options) {
    return findExecutable(
      "IEDriverServer",
      IE_DRIVER_EXE_PROPERTY,
      "https://www.selenium.dev/documentation/ie_driver_server/",
      "https://www.selenium.dev/downloads/",
      options);
  }
}
