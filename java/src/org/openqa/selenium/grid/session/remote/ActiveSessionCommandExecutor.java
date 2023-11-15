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

package org.openqa.selenium.grid.session.remote;

import java.io.IOException;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.grid.session.ActiveSession;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.Command;
import org.openqa.selenium.remote.CommandExecutor;
import org.openqa.selenium.remote.DriverCommand;
import org.openqa.selenium.remote.Response;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

class ActiveSessionCommandExecutor implements CommandExecutor {

  private final ActiveSession session;
  private boolean active;

  public ActiveSessionCommandExecutor(ActiveSession session) {
    this.session = Require.nonNull("Session", session);
  }

  @Override
  public Response execute(Command command) throws IOException {
    if (DriverCommand.NEW_SESSION.equals(command.getName())) {
      if (active) {
        throw new WebDriverException("Cannot start session twice! " + session);
      }

      active = true;

      // We already have a running session.
      Response response = new Response(session.getId());
      response.setValue(session.getCapabilities());
      return response;
    }

    // The command is about to be sent to the session, which expects it to be
    // encoded as if it has come from the downstream end, not the upstream end.
    HttpRequest request = session.getDownstreamDialect().getCommandCodec().encode(command);

    HttpResponse httpResponse = session.execute(request);

    return session.getDownstreamDialect().getResponseCodec().decode(httpResponse);
  }
}
