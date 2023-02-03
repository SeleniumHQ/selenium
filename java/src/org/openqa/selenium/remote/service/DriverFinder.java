package org.openqa.selenium.remote.service;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.manager.SeleniumManager;
import org.openqa.selenium.os.ExecutableFinder;

import java.io.File;
import java.util.logging.Logger;

public class DriverFinder {
  private static final Logger LOG = Logger.getLogger(DriverFinder.class.getName());

  public static String getPath(DriverServiceInfo serviceInfo) {
    return getPath(serviceInfo, null);
  }

    public static String getPath(DriverServiceInfo serviceInfo, Capabilities options) {
    String exePath = serviceInfo.getDriverProperty();

    if (exePath == null && serviceInfo.getDriverExecutable() != null) {
      exePath = serviceInfo.getDriverExecutable().toString();
    } else if (exePath == null) {
      exePath = new ExecutableFinder().find(serviceInfo.getDriverName());
    }

    if (exePath == null) {
      try {
        if (options == null) {
          exePath = SeleniumManager.getInstance().getDriverPath(serviceInfo.getDriverName());
        } else {
          exePath = SeleniumManager.getInstance().getDriverPath(options);
        }
      } catch (Exception e) {
        LOG.warning(String.format("Unable to obtain %s using Selenium Manager: %s", serviceInfo.getDriverName(), e.getMessage()));
      }
    }
    if (exePath != null && exePath.isEmpty()) {
      exePath = null;
    }
    Require.state("The path to the driver executable", exePath).nonNull(
      "Unable to locate the %s executable; for more information on how to install drivers, " +
        "see https://www.selenium.dev/documentation/webdriver/getting_started/install_drivers/",
      serviceInfo.getDriverName());

    File exe = new File(exePath);
    Require.state("The driver executable", exe).isFile();
    Require.stateCondition(exe.canExecute(), "It must be an executable file: %s", exe);

    return exePath;
  }
}
