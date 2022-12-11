package org.openqa.selenium.edge;

import org.openqa.selenium.remote.service.DriverFinder;

import java.io.File;

import static org.openqa.selenium.edge.EdgeDriverService.EDGE_DRIVER_EXE_PROPERTY;
public class EdgeDriverFinder extends DriverFinder {
  protected static File findExecutable() {
    return findExecutable(
      "msedgedriver",
      EDGE_DRIVER_EXE_PROPERTY,
      "https://docs.microsoft.com/en-us/microsoft-edge/webdriver-chromium/",
      "https://developer.microsoft.com/en-us/microsoft-edge/tools/webdriver/");
  }

  protected static File findExecutable(EdgeOptions options) {
    return findExecutable(
      "msedgedriver",
      EDGE_DRIVER_EXE_PROPERTY,
      "https://docs.microsoft.com/en-us/microsoft-edge/webdriver-chromium/",
      "https://developer.microsoft.com/en-us/microsoft-edge/tools/webdriver/",
      options);
  }
}
