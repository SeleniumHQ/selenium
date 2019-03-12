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

package org.openqa.selenium.grid.node.local;

import static org.openqa.selenium.remote.http.HttpMethod.DELETE;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.web.CommandHandler;
import org.openqa.selenium.grid.web.Values;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.util.Objects;

class TrackedSession extends Session {

  private final SessionFactory factory;
  private final CommandHandler handler;

  TrackedSession(SessionFactory createdBy, Session session, CommandHandler handler) {
    super(session.getId(), session.getUri(), session.getCapabilities());
    this.factory = Objects.requireNonNull(createdBy);
    this.handler = Objects.requireNonNull(handler);
  }

  public CommandHandler getHandler() {
    return handler;
  }

  public Capabilities getStereotype() {
    return factory.getStereotype();
  }

  public void stop() {
    HttpResponse resp = new HttpResponse();
    try {
      handler.execute(new HttpRequest(DELETE, "/session/" + getId()), resp);

      Values.get(resp, Void.class);
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
  }
}
