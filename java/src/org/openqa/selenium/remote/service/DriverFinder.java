// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

package org.openqa.selenium.remote.service;

import java.io.File;
import java.util.logging.Logger;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.manager.SeleniumManager;
import org.openqa.selenium.manager.SeleniumManagerOutput.Result;
import org.openqa.selenium.remote.NoSuchDriverException;

public class DriverFinder {

  private static final Logger LOG = Logger.getLogger(DriverFinder.class.getName());

  public static Result getResult(DriverService service, Capabilities options) {
    return getResult(service, options, false);
  }

  public static Result getResult(DriverService service, Capabilities options, boolean offline) {
    Require.nonNull("Browser options", options);
    String driverName = service.getDriverName();

    Result result = new Result(service.getExecutable());
    if (result.getDriverPath() == null) {
      result = new Result(System.getProperty(service.getDriverProperty()));
      if (result.getDriverPath() == null) {
        try {
          result = SeleniumManager.getInstance().getResult(options, offline);
        } catch (RuntimeException e) {
          throw new NoSuchDriverException(
              String.format("Unable to obtain: %s, error %s", options, e.getMessage()), e);
        }
      } else {
        LOG.fine(
            String.format(
                "Skipping Selenium Manager, path to %s found in system property: %s",
                driverName, result.getDriverPath()));
      }
    } else {
      LOG.fine(
          String.format(
              "Skipping Selenium Manager, path to %s specified in Service class: %s",
              driverName, result.getDriverPath()));
    }

    String message;
    if (result.getDriverPath() == null) {
      message = String.format("Unable to locate or obtain %s", driverName);
    } else if (!new File(result.getDriverPath()).exists()) {
      message =
          String.format("%s at location %s, does not exist", driverName, result.getDriverPath());
    } else if (!new File(result.getDriverPath()).canExecute()) {
      message =
          String.format("%s located at %s, cannot be executed", driverName, result.getDriverPath());
    } else {
      return result;
    }

    throw new NoSuchDriverException(message);
  }
}
