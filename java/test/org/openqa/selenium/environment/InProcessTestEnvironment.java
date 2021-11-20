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

package org.openqa.selenium.environment;

import org.openqa.selenium.environment.webserver.AppServer;
import org.openqa.selenium.environment.webserver.NettyAppServer;
import org.openqa.selenium.netty.server.PortAlreadyInUseException;

import java.util.logging.Logger;

public class InProcessTestEnvironment implements TestEnvironment {
  private static final Logger log = Logger.getLogger(InProcessTestEnvironment.class.getName());

  private AppServer appServer;

  public InProcessTestEnvironment() {
    int maxRetries = 5;
    for (int retry = 1; retry <= maxRetries; retry++) {
      try {
        AppServer server = new NettyAppServer();
        server.start();
        this.appServer = server;
        break;
      }
      catch (PortAlreadyInUseException portAlreadyInUse) {
        if (retry == maxRetries) {
          throw portAlreadyInUse;
        }
        log.warning(String.format("Failed to start app server: %s (try %s out of %s), retrying...",
                                  portAlreadyInUse.getMessage(), retry, maxRetries));
      }
    }
  }

  @Override
  public AppServer getAppServer() {
    return appServer;
  }

  @Override
  public void stop() {
    appServer.stop();
  }

  public static void main(String[] args) {
    new InProcessTestEnvironment();
  }
}
