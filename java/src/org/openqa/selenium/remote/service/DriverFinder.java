package org.openqa.selenium.remote.service;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.manager.SeleniumManager;
import org.openqa.selenium.os.ExecutableFinder;

import java.io.File;
import java.util.logging.Logger;

public class DriverFinder {
  private static final Logger LOG = Logger.getLogger(DriverFinder.class.getName());

  public static String getPath(Capabilities options, String driverName, String driverProperty) {
    return getPath(options, driverName, driverProperty, null);
  }

  public static String getPath(Capabilities options, String driverName, String driverProperty, String defaultPath) {
    String exePath = new ExecutableFinder().find(driverName);
    if (exePath == null) {
      exePath = System.getProperty(driverProperty, defaultPath);
    }
    if (exePath == null && defaultPath == null) {
      try {
        exePath = SeleniumManager.getInstance().getDriverPath(options);
      } catch (Exception e) {
        LOG.warning(String.format("Unable to obtain %s using Selenium Manager: %s", driverName, e.getMessage()));
      }
    }
    if (exePath != null && exePath.isEmpty()) {
      exePath = null;
    }
    Require.state("The path to the driver executable", exePath).nonNull(
      "Unable to locate the %s executable; for more information on how to install drivers, " +
        "see https://www.selenium.dev/documentation/webdriver/getting_started/install_drivers/",
      driverName);

    File exe = new File(exePath);
    Require.state("The driver executable", exe).isFile();
    Require.stateCondition(exe.canExecute(), "It must be an executable file: %s", exe);

    return exePath;
  }
}
