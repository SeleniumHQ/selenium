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

package org.openqa.selenium.grid.sessionqueue;

import static org.openqa.selenium.remote.http.Contents.reader;
import static org.openqa.selenium.remote.http.Route.combine;
import static org.openqa.selenium.remote.http.Route.post;
import static org.openqa.selenium.remote.tracing.HttpTracing.newSpanAsChildOf;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.NewSessionPayload;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.http.Routable;
import org.openqa.selenium.remote.http.Route;
import org.openqa.selenium.remote.tracing.Span;
import org.openqa.selenium.remote.tracing.Tracer;
import org.openqa.selenium.status.HasReadyState;

import java.io.IOException;
import java.io.Reader;
import java.util.Iterator;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import java.util.logging.Logger;

public abstract class NewSessionQueuer implements HasReadyState, Routable {

  private static final Logger LOG = Logger.getLogger(NewSessionQueuer.class.getName());
  private final Route routes;
  protected final Tracer tracer;

  protected NewSessionQueuer(Tracer tracer) {
    this.tracer = Require.nonNull("Tracer", tracer);

    routes = combine(
        post("/session")
            .to(() -> new AddToSessionQueue(this)),
        post("/se/grid/newsessionqueuer/session")
            .to(() -> new AddToSessionQueue(this)),
        post("/se/grid/newsessionqueuer/session/retry/{requestId}")
            .to(params -> new AddBackToSessionQueue(this,
                                                    UUID.fromString(params.get("requestId")))),
        Route.get("/se/grid/newsessionqueuer/session")
            .to(() -> new RemoveFromSessionQueue(tracer, this)));
  }

  public void validateSessionRequest(HttpRequest request) {
    try (Span span = newSpanAsChildOf(tracer, request, "sessionqueue.validaterequest")) {
      try (
          Reader reader = reader(request);
          NewSessionPayload payload = NewSessionPayload.create(reader)) {
        Objects.requireNonNull(payload, "Requests to process must be set.");

        Iterator<Capabilities> iterator = payload.stream().iterator();
        if (!iterator.hasNext()) {
          throw new SessionNotCreatedException("No capabilities found");
        }
      } catch (IOException e) {
        throw new SessionNotCreatedException(e.getMessage(), e);
      }
    }
  }

  public abstract HttpResponse addToQueue(HttpRequest request);

  public abstract boolean retryAddToQueue(HttpRequest request, UUID reqId);

  public abstract Optional<HttpRequest> remove();

  @Override
  public boolean matches(HttpRequest req) {
    return routes.matches(req);
  }

  @Override
  public HttpResponse execute(HttpRequest req) {
    return routes.execute(req);
  }

}