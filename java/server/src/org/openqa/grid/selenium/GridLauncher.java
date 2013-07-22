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

import org.openqa.selenium.remote.server.log.LoggingOptions;
import org.openqa.selenium.remote.server.log.TerseFormatter;
import org.openqa.selenium.server.SeleniumServer;
import org.openqa.selenium.server.cli.RemoteControlLauncher;

import org.openqa.grid.common.CommandLineOptionHelper;
import org.openqa.grid.common.GridDocHelper;
import org.openqa.grid.common.GridRole;
import org.openqa.grid.common.RegistrationRequest;
import org.openqa.grid.common.exception.GridConfigurationException;
import org.openqa.grid.internal.utils.GridHubConfiguration;
import org.openqa.grid.internal.utils.SelfRegisteringRemote;
import org.openqa.grid.web.Hub;

import java.io.File;
import java.io.IOException;
import java.util.logging.ConsoleHandler;
import java.util.logging.FileHandler;
import java.util.logging.Handler;
import java.util.logging.Level;
import java.util.logging.Logger;

public class GridLauncher {

  private static final Logger log = Logger.getLogger(GridLauncher.class.getName());

  public static void main(String[] args) throws Exception {

    CommandLineOptionHelper helper = new CommandLineOptionHelper(args);
    if (helper.isParamPresent("-help") || helper.isParamPresent("-h")){
      String separator = "\n----------------------------------\n";
      RemoteControlLauncher.usage(separator+"To use as a standalone server"+separator);
      GridDocHelper.printHelp(separator+"To use in a grid environment :"+separator,false);
      return;
    }

    Level logLevel =
        helper.isParamPresent("-debug")
        ? Level.FINE
        : LoggingOptions.getDefaultLogLevel();
    if (logLevel == null) {
      logLevel = Level.INFO;
    }
    Logger.getLogger("").setLevel(logLevel);

    for (Handler handler : Logger.getLogger("").getHandlers()) {
      Logger.getLogger("").removeHandler(handler);
    }

    String logFilename =
        helper.isParamPresent("-log")
        ? helper.getParamValue("-log")
        : LoggingOptions.getDefaultLogOutFile();
    if (logFilename != null) {
      try {
        Handler logFile = new FileHandler(new File(logFilename).getAbsolutePath(), true);
        logFile.setFormatter(new TerseFormatter(true));
        logFile.setLevel(logLevel);
        Logger.getLogger("").addHandler(logFile);
      } catch (IOException e) {
        throw new RuntimeException(e);
      }
    } else {
      Handler console = new ConsoleHandler();
      console.setLevel(logLevel);
      Logger.getLogger("").addHandler(console);
    }

    GridRole role = GridRole.find(args);

    switch (role) {
      case NOT_GRID:
        log.info("Launching a standalone server");
        SeleniumServer.main(args);
        break;
      case HUB:
        log.info("Launching a selenium grid server");
        try {
          GridHubConfiguration c = GridHubConfiguration.build(args);
          Hub h = new Hub(c);
          h.start();
        } catch (GridConfigurationException e) {
          GridDocHelper.printHelp(e.getMessage());
          e.printStackTrace();
        }
        break;
      case NODE:
        log.info("Launching a selenium grid node");
        try {
          RegistrationRequest c = RegistrationRequest.build(args);
          SelfRegisteringRemote remote = new SelfRegisteringRemote(c);
          remote.startRemoteServer();
          remote.startRegistrationProcess();
        } catch (GridConfigurationException e) {
          GridDocHelper.printHelp(e.getMessage());
          e.printStackTrace();
        }
        break;
      default:
        throw new RuntimeException("NI");
    }
  }

}
