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

import static org.openqa.selenium.remote.http.Route.combine;
import static org.openqa.selenium.remote.http.Route.delete;
import static org.openqa.selenium.remote.http.Route.get;
import static org.openqa.selenium.remote.http.Route.options;
import static org.openqa.selenium.remote.http.Route.post;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.grid.data.CreateSessionResponse;
import org.openqa.selenium.grid.data.RequestId;
import org.openqa.selenium.grid.data.SessionRequest;
import org.openqa.selenium.grid.data.SessionRequestCapability;
import org.openqa.selenium.grid.security.RequiresSecretFilter;
import org.openqa.selenium.grid.security.Secret;
import org.openqa.selenium.internal.Either;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.http.Routable;
import org.openqa.selenium.remote.http.Route;
import org.openqa.selenium.remote.tracing.Tracer;
import org.openqa.selenium.status.HasReadyState;

public abstract class NewSessionQueue implements HasReadyState, Routable {

  protected final Tracer tracer;
  private final Route routes;

  protected NewSessionQueue(Tracer tracer, Secret registrationSecret) {
    this.tracer = Require.nonNull("Tracer", tracer);

    Require.nonNull("Registration secret", registrationSecret);
    RequiresSecretFilter requiresSecret = new RequiresSecretFilter(registrationSecret);

    routes =
        combine(
            post("/session")
                .to(
                    () ->
                        req -> {
                          SessionRequest sessionRequest =
                              new SessionRequest(
                                  new RequestId(UUID.randomUUID()), req, Instant.now());
                          return addToQueue(sessionRequest);
                        }),
            options("/session").to(() -> req -> new HttpResponse()),
            post("/se/grid/newsessionqueue/session")
                .to(() -> new AddToSessionQueue(tracer, this))
                .with(requiresSecret),
            post("/se/grid/newsessionqueue/session/{requestId}/retry")
                .to(params -> new AddBackToSessionQueue(tracer, this, requestIdFrom(params)))
                .with(requiresSecret),
            post("/se/grid/newsessionqueue/session/{requestId}/failure")
                .to(params -> new SessionNotCreated(tracer, this, requestIdFrom(params)))
                .with(requiresSecret),
            post("/se/grid/newsessionqueue/session/{requestId}/success")
                .to(params -> new SessionCreated(tracer, this, requestIdFrom(params)))
                .with(requiresSecret),
            post("/se/grid/newsessionqueue/session/{requestId}")
                .to(params -> new RemoveFromSessionQueue(tracer, this, requestIdFrom(params)))
                .with(requiresSecret),
            post("/se/grid/newsessionqueue/session/next")
                .to(() -> new GetNextMatchingRequest(tracer, this))
                .with(requiresSecret),
            get("/se/grid/newsessionqueue/queue").to(() -> new GetSessionQueue(tracer, this)),
            delete("/se/grid/newsessionqueue/queue")
                .to(() -> new ClearSessionQueue(tracer, this))
                .with(requiresSecret));
  }

  private RequestId requestIdFrom(Map<String, String> params) {
    return new RequestId(UUID.fromString(params.get("requestId")));
  }

  /**
   * A fast-path to detect if the queue is empty, returns false if there is no fast-path available.
   *
   * @return true if the queue is empty, false if it is not empty or unknown
   */
  public abstract boolean peekEmpty();

  public abstract HttpResponse addToQueue(SessionRequest request);

  public abstract boolean retryAddToQueue(SessionRequest request);

  public abstract Optional<SessionRequest> remove(RequestId reqId);

  public abstract List<SessionRequest> getNextAvailable(Map<Capabilities, Long> stereotypes);

  public abstract void complete(
      RequestId reqId, Either<SessionNotCreatedException, CreateSessionResponse> result);

  public abstract int clearQueue();

  public abstract List<SessionRequestCapability> getQueueContents();

  @Override
  public boolean matches(HttpRequest req) {
    return routes.matches(req);
  }

  @Override
  public HttpResponse execute(HttpRequest req) {
    return routes.execute(req);
  }
}
