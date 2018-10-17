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

package org.openqa.selenium.grid.router;

import com.google.common.collect.ImmutableMap;

import org.openqa.selenium.grid.distributor.Distributor;
import org.openqa.selenium.grid.sessionmap.SessionMap;
import org.openqa.selenium.grid.web.CommandHandler;
import org.openqa.selenium.grid.web.CompoundHandler;
import org.openqa.selenium.injector.Injector;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

import java.io.IOException;
import java.util.function.Predicate;

/**
 * A simple router that is aware of the selenium-protocol.
 */
public class Router implements Predicate<HttpRequest>, CommandHandler {

  private final CompoundHandler handler;

  public Router(SessionMap sessions, Distributor distributor) {
    HandleSession activeSession = new HandleSession(sessions);

    handler = new CompoundHandler(
        Injector.builder().build(),
        ImmutableMap.of(
            activeSession, (inj, req) -> activeSession,
            sessions, (inj, req) -> sessions,
            distributor, (inj, req) -> distributor));
  }

  @Override
  public boolean test(HttpRequest req) {
    return handler.test(req);
  }

  @Override
  public void execute(HttpRequest req, HttpResponse resp) throws IOException {
    handler.execute(req, resp);
  }
}
