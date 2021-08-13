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

import com.google.common.collect.ImmutableSet;

import org.openqa.selenium.grid.distributor.Distributor;
import org.openqa.selenium.grid.sessionmap.SessionMap;
import org.openqa.selenium.grid.sessionqueue.NewSessionQueue;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.http.Routable;
import org.openqa.selenium.remote.tracing.SpanDecorator;
import org.openqa.selenium.remote.tracing.Tracer;
import org.openqa.selenium.status.HasReadyState;

import static org.openqa.selenium.remote.http.Route.combine;
import static org.openqa.selenium.remote.http.Route.get;
import static org.openqa.selenium.remote.http.Route.matching;

/**
 * A simple router that is aware of the selenium-protocol.
 */
public class Router implements HasReadyState, Routable {

  private final Routable routes;
  private final SessionMap sessions;
  private final Distributor distributor;
  private final NewSessionQueue queue;

  public Router(
    Tracer tracer,
    HttpClient.Factory clientFactory,
    SessionMap sessions,
    NewSessionQueue queue,
    Distributor distributor) {
    Require.nonNull("Tracer to use", tracer);
    Require.nonNull("HTTP client factory", clientFactory);

    this.sessions = Require.nonNull("Session map", sessions);
    this.queue = Require.nonNull("New Session Request Queue", queue);
    this.distributor = Require.nonNull("Distributor", distributor);

    HandleSession sessionHandler = new HandleSession(tracer, clientFactory, sessions);

    routes =
      combine(
        get("/status").to(() -> new GridStatusHandler(tracer, distributor)),
        sessions.with(new SpanDecorator(tracer, req -> "session_map")),
        queue.with(new SpanDecorator(tracer, req -> "session_queue")),
        distributor.with(new SpanDecorator(tracer, req -> "distributor")),
        matching(req -> req.getUri().startsWith("/session/"))
          .to(() -> sessionHandler));
  }

  @Override
  public boolean isReady() {
    try {
      return ImmutableSet.of(distributor, sessions, queue).parallelStream()
        .map(HasReadyState::isReady)
        .reduce(true, Boolean::logicalAnd);
    } catch (RuntimeException e) {
      return false;
    }
  }

  @Override
  public boolean matches(HttpRequest req) {
    return routes.matches(req);
  }

  @Override
  public HttpResponse execute(HttpRequest req) {
    return routes.execute(req);
  }
}
