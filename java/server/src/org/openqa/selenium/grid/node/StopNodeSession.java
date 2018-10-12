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

package org.openqa.selenium.grid.node;

import static org.openqa.selenium.remote.http.HttpMethod.DELETE;

import org.openqa.selenium.NoSuchSessionException;
import org.openqa.selenium.grid.web.CommandHandler;
import org.openqa.selenium.grid.web.UrlTemplate;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

import java.io.IOException;
import java.util.Objects;
import java.util.function.Predicate;

class StopNodeSession implements Predicate<HttpRequest>, CommandHandler {

  public static final UrlTemplate TEMPLATE = new UrlTemplate("/se/grid/node/session/{sessionId}");
  private final Node node;

  StopNodeSession(Node node) {
    this.node = Objects.requireNonNull(node);
  }

  @Override
  public boolean test(HttpRequest req) {
    return req.getMethod() == DELETE && TEMPLATE.match(req.getUri()) != null;
  }

  @Override
  public void execute(HttpRequest req, HttpResponse resp) throws IOException {
    UrlTemplate.Match match = TEMPLATE.match(req.getUri());
    if (match == null || match.getParameters().get("sessionId") == null) {
      throw new NoSuchSessionException("Session ID not found in URL: " + req.getUri());
    }

    SessionId id = new SessionId(match.getParameters().get("sessionId"));
    node.stop(id);
  }
}
