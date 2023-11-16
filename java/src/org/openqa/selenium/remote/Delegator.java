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

import static java.util.Collections.emptyMap;

import java.io.IOException;
import java.net.URL;
import java.util.Map;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.http.ClientConfig;
import org.openqa.selenium.remote.http.HttpClient;

public class Delegator extends HttpCommandExecutor implements CommandExecutor {

  private BiDiCommandExecutor bidiCommandExecutor = null;

  public Delegator(ClientConfig config) {
    super(
        emptyMap(),
        Require.nonNull("HTTP client configuration", config),
        getDefaultClientFactory());
  }
  
  public Delegator(
      Map<String, CommandInfo> additionalCommands,
      ClientConfig config,
      HttpClient.Factory httpClientFactory) {
    super(additionalCommands, config, httpClientFactory);
  }

  public Delegator(
    Map<String, CommandInfo> additionalCommands, URL addressOfRemoteServer, ClientConfig config) {
    super(
      additionalCommands,
      config.baseUrl(Require.nonNull("Server URL", addressOfRemoteServer)),
      getDefaultClientFactory());
  }

  public void setBidiCommandExecutor(BiDiCommandExecutor bidiCommandExecutor) {
    this.bidiCommandExecutor = bidiCommandExecutor;
  }

  @Override
  public Response execute(Command command) throws IOException {
    if (bidiCommandExecutor != null
        && command.getName().equals(DriverCommand.GET)
        && command.getName().equals(DriverCommand.PRINT_PAGE)) {
      return bidiCommandExecutor.execute(command);
    }

    return super.execute(command);
  }
}
