package org.openqa.selenium.remote.service;

import java.io.File;
import java.util.logging.Logger;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.manager.SeleniumManager;
import org.openqa.selenium.os.ExecutableFinder;
import org.openqa.selenium.remote.NoSuchDriverException;

public class DriverFinder {

  private static final Logger LOG = Logger.getLogger(DriverFinder.class.getName());

  public static String getPath(DriverService service, Capabilities options) {
    Require.nonNull("Browser options", options);
    String exePath = System.getProperty(service.getDriverProperty());

    if (exePath == null) {
      exePath = new ExecutableFinder().find(service.getDriverName());
    }

    if (service.getDriverExecutable() != null) {
      // This is needed for Safari Technology Preview until Selenium Manager manages locating on
      // PATH
      exePath = service.getDriverExecutable().getAbsolutePath();
    }

    if (exePath == null) {
      try {
        exePath = SeleniumManager.getInstance().getDriverPath(options);
      } catch (Exception e) {
        throw new NoSuchDriverException(String.format("Unable to obtain: %s", options), e);
      }
    }

    String message = "";
    if (exePath == null) {
      message = String.format("Unable to locate or obtain %s", service.getDriverName());
    } else if (!new File(exePath).exists()) {
      message = String.format("%s located at %s, but invalid", service.getDriverName(), exePath);
    } else if (!new File(exePath).canExecute()) {
      message =
          String.format("%s located at %s, cannot be executed", service.getDriverName(), exePath);
    } else {
      return exePath;
    }

    throw new NoSuchDriverException(message);
  }
}
