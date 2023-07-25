package org.openqa.selenium.remote.service;

import java.io.File;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.manager.SeleniumManager;
import org.openqa.selenium.remote.NoSuchDriverException;

public class DriverFinder {

  public static String getPath(DriverService service, Capabilities options) {
    return getPath(service, options, false);
  }

  public static String getPath(DriverService service, Capabilities options, boolean offline) {
    Require.nonNull("Browser options", options);
    String exePath = System.getProperty(service.getDriverProperty());

    if (exePath == null) {
      try {
        exePath = SeleniumManager.getInstance().getDriverPath(options, offline);
      } catch (Exception e) {
        throw new NoSuchDriverException(String.format("Unable to obtain: %s", options), e);
      }
    }

    String message;
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
