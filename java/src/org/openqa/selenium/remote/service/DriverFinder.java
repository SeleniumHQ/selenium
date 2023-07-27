package org.openqa.selenium.remote.service;

import java.io.File;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.manager.SeleniumManager;
import org.openqa.selenium.manager.SeleniumManagerOutput.Result;
import org.openqa.selenium.remote.NoSuchDriverException;

public class DriverFinder {

  public static Result getPath(DriverService service, Capabilities options) {
    return getPath(service, options, false);
  }

  public static Result getPath(DriverService service, Capabilities options, boolean offline) {
    Require.nonNull("Browser options", options);
    Result result = new Result(System.getProperty(service.getDriverProperty()));

    if (result.getDriverPath() == null) {
      try {
        result = SeleniumManager.getInstance().getDriverPath(options, offline);
      } catch (Exception e) {
        throw new NoSuchDriverException(String.format("Unable to obtain: %s", options), e);
      }
    }

    String message;
    if (result.getDriverPath() == null) {
      message = String.format("Unable to locate or obtain %s", service.getDriverName());
    } else if (!new File(result.getDriverPath()).exists()) {
      message =
          String.format(
              "%s located at %s, but invalid", service.getDriverName(), result.getDriverPath());
    } else if (!new File(result.getDriverPath()).canExecute()) {
      message =
          String.format(
              "%s located at %s, cannot be executed",
              service.getDriverName(), result.getDriverPath());
    } else {
      return result;
    }

    throw new NoSuchDriverException(message);
  }
}
