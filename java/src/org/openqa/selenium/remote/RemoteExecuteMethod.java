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

package org.openqa.selenium.remote;

import org.openqa.selenium.internal.Require;

import java.util.Map;

public class RemoteExecuteMethod implements ExecuteMethod {
  private final RemoteWebDriver driver;

  public RemoteExecuteMethod(RemoteWebDriver driver) {
    this.driver = Require.nonNull("Remote WebDriver", driver);
  }

  @Override
  public Object execute(String commandName, Map<String, ?> parameters) {
    Response response;

    if (parameters == null || parameters.isEmpty()) {
      response = driver.execute(commandName);
    } else {
      response = driver.execute(commandName, parameters);
    }

    return response.getValue();
  }
}
