/*
Copyright 2011 Selenium committers
Copyright 2011 Software Freedom Conservancy

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
 */

package org.openqa.grid.selenium;

import java.io.File;
import java.io.IOException;
import java.util.logging.ConsoleHandler;
import java.util.logging.FileHandler;
import java.util.logging.Handler;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.openqa.grid.common.CommandLineOptionHelper;
import org.openqa.grid.common.GridDocHelper;
import org.openqa.grid.common.GridRole;
import org.openqa.grid.common.exception.GridConfigurationException;
import org.openqa.grid.internal.utils.GridHubConfiguration;
import org.openqa.grid.web.Hub;
import org.openqa.grid.web.HubInterface;
import org.openqa.selenium.remote.server.log.LoggingOptions;
import org.openqa.selenium.remote.server.log.TerseFormatter;
import org.openqa.selenium.server.cli.RemoteControlLauncher;

public class GridLauncher {

  private static final Logger log = Logger.getLogger(GridLauncher.class
      .getName());

  public static void main(String[] args) throws Exception {
    CommandLineOptionHelper helper = new CommandLineOptionHelper(args);
    if (isHelpMode(helper)) {
      log.finest("Help flag set on command line, don't start server.");
      return;
    }
    configureLogging(helper);
    launchServerInCorrectRole(args, getGridRole(args));
  }

  private static void launchServerInCorrectRole(String[] args, GridRole role)
      throws Exception {
    switch (role) {
    // case NOT_GRID:
    // log.info("Launching a standalone server");
    // SeleniumServer.main(args);
    // break;
    // case HUB:
    default:
      log.info("Launching a selenium grid server");
      try {
        GridHubConfiguration c = GridHubConfiguration.build(args);
        HubInterface h = new Hub(c);
        h.start();
      } catch (GridConfigurationException e) {
        GridDocHelper.printHelp(e.getMessage());
        e.printStackTrace();
      }
      break;
    // case NODE:
    // log.info("Launching a selenium grid node");
    // try {
    // RegistrationRequest c = RegistrationRequest.build(args);
    // SelfRegisteringRemote remote = new SelfRegisteringRemote(c);
    // remote.startRemoteServer();
    // remote.startRegistrationProcess();
    // } catch (GridConfigurationException e) {
    // GridDocHelper.printHelp(e.getMessage());
    // e.printStackTrace();
    // }
    // break;
    // default:
    // throw new RuntimeException("NI");
    }
  }

  private static GridRole getGridRole(String[] args) {
    GridRole role = GridRole.find(args);
    return role;
  }

  private static void configureLogging(CommandLineOptionHelper helper) {
    Level logLevel = helper.isParamPresent("-debug") ? Level.FINE
        : LoggingOptions.getDefaultLogLevel();
    if (logLevel == null) {
      logLevel = Level.INFO;
    }
    Logger.getLogger("").setLevel(logLevel);

    String logFilename = helper.isParamPresent("-log") ? helper
        .getParamValue("-log") : LoggingOptions.getDefaultLogOutFile();
    if (logFilename != null) {
      for (Handler handler : Logger.getLogger("").getHandlers()) {
        if (handler instanceof ConsoleHandler) {
          Logger.getLogger("").removeHandler(handler);
        }
      }
      try {
        Handler logFile = new FileHandler(
            new File(logFilename).getAbsolutePath(), true);
        logFile.setFormatter(new TerseFormatter(true));
        logFile.setLevel(logLevel);
        Logger.getLogger("").addHandler(logFile);
      } catch (IOException e) {
        throw new RuntimeException(e);
      }
    } else {
      boolean logLongForm = helper.isParamPresent("-logLongForm");
      for (Handler handler : Logger.getLogger("").getHandlers()) {
        if (handler instanceof ConsoleHandler) {
          handler.setLevel(logLevel);
          handler.setFormatter(new TerseFormatter(logLongForm));
        }
      }
    }
  }

  private static boolean isHelpMode(CommandLineOptionHelper helper) {
    if (helper.isParamPresent("-help") || helper.isParamPresent("-h")) {
      String separator = "\n----------------------------------\n";
      RemoteControlLauncher.usage(separator + "To use as a standalone server"
          + separator);
      GridDocHelper.printHelp(separator + "To use in a grid environment :"
          + separator, false);
      return true;
    } else {
      return false;
    }
  }

}
