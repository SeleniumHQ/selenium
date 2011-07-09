/*
Copyright 2007-2011 WebDriver committers

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

import java.util.logging.Logger;

import org.openqa.grid.common.GridDocHelper;
import org.openqa.grid.common.GridRole;
import org.openqa.grid.common.RegistrationRequest;
import org.openqa.grid.common.exception.GridConfigurationException;
import org.openqa.grid.internal.utils.GridHubConfiguration;
import org.openqa.grid.internal.utils.SelfRegisteringRemote;
import org.openqa.grid.web.Hub;
import org.openqa.selenium.server.SeleniumServer;

public class GridLauncher {

  private static final Logger log = Logger.getLogger(GridLauncher.class.getName());

  public static void main(String[] args) throws Exception {

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
          e.printStackTrace();
          GridDocHelper.printHelp(e.getMessage());
        }
        break;
      case WEBDRIVER:
      case REMOTE_CONTROL:
        log.info("Launching a selenium grid node");
        try {
          RegistrationRequest c = RegistrationRequest.build(args);
          SelfRegisteringRemote remote = new SelfRegisteringRemote(c);
          remote.startRemoteServer();
          remote.startRegistrationProcess();
        } catch (GridConfigurationException e) {
          e.printStackTrace();
          GridDocHelper.printHelp(e.getMessage());
        }
        break;
      default:
        throw new RuntimeException("NI");
    }
  }

}
