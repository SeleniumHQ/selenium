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

package org.openqa.selenium.grid.docker;

import static org.openqa.selenium.remote.http.HttpMethod.DELETE;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.docker.Container;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.web.CommandHandler;
import org.openqa.selenium.grid.web.ReverseProxyHandler;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

import java.io.IOException;
import java.net.URI;
import java.time.Duration;
import java.util.Objects;

class DockerSession extends Session implements CommandHandler {

  private final Container container;
  private final CommandHandler handler;
  private final String killUrl;

  DockerSession(
      Container container,
      SessionId id,
      URI uri,
      Capabilities capabilities,
      HttpClient client) {
    super(id, uri, capabilities);
    this.container = Objects.requireNonNull(container);

    this.handler = new ReverseProxyHandler(Objects.requireNonNull(client));
    this.killUrl = "/session/" + id;
  }

  @Override
  public void execute(HttpRequest req, HttpResponse resp) throws IOException {
    handler.execute(req, resp);

    if (req.getMethod() == DELETE && req.getUri().equals(killUrl)) {
      container.stop(Duration.ofMinutes(1));
      container.delete();
    }
  }
}
