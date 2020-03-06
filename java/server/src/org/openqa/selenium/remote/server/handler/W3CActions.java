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

package org.openqa.selenium.remote.server.handler;

import static org.openqa.selenium.remote.DriverCommand.ACTIONS;

import org.openqa.selenium.remote.Command;
import org.openqa.selenium.remote.CommandExecutor;
import org.openqa.selenium.remote.ErrorHandler;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.remote.Response;
import org.openqa.selenium.remote.server.Session;

import java.util.Map;

public class W3CActions extends WebDriverHandler<Void> {

  private Map<String, Object> allParameters;

  public W3CActions(Session session) {
    super(session);
  }

  @Override
  public void setJsonParameters(Map<String, Object> allParameters) throws Exception {
    super.setJsonParameters(allParameters);
    this.allParameters = allParameters;
  }

  @Override
  public Void call() throws Exception {
    RemoteWebDriver driver = (RemoteWebDriver) getUnwrappedDriver();
    CommandExecutor executor = (driver).getCommandExecutor();

    long start = System.currentTimeMillis();
    Command command = new Command(driver.getSessionId(), ACTIONS, allParameters);
    Response response = executor.execute(command);

    new ErrorHandler(true)
        .throwIfResponseFailed(response, System.currentTimeMillis() - start);

    return null;
  }
}
