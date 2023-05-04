package org.openqa.selenium.remote.service;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.manager.SeleniumManager;
import org.openqa.selenium.os.ExecutableFinder;

import java.io.File;
import java.util.logging.Logger;

public class DriverFinder {

  private static final Logger LOG = Logger.getLogger(DriverFinder.class.getName());

  public static String getPath(DriverService service, Capabilities options) {
    Require.nonNull("Browser options", options);
    String defaultPath = new ExecutableFinder().find(service.getDriverName());
    String exePath = System.getProperty(service.getDriverProperty(), defaultPath);

    if (service.getDriverExecutable() != null) {
      // This is the case for Safari and Safari Technology Preview
      exePath = service.getDriverExecutable().getAbsolutePath();
    }

    if (exePath == null) {
      try {
        exePath = SeleniumManager.getInstance().getDriverPath(options);
      } catch (Exception e) {
        LOG.warning(String.format("Unable to obtain %s using Selenium Manager: %s",
                                  service.getDriverName(), e.getMessage()));
      }
    }

    String validPath = Require.state("The path to the driver executable", exePath).nonNull(
        "Unable to locate the %s executable; for more information on how to install drivers, " +
        "see https://www.selenium.dev/documentation/webdriver/getting_started/install_drivers/",
        service.getDriverName());

    File exe = new File(validPath);
    Require.state("The driver executable", exe).isFile();
    Require.stateCondition(exe.canExecute(), "It must be an executable file: %s", exe);
    return validPath;
  }
}
