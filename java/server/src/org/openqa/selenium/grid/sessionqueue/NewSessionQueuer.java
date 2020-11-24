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
import static org.openqa.selenium.remote.http.Route.delete;
import static org.openqa.selenium.remote.http.Route.get;
import static org.openqa.selenium.remote.http.Route.post;
import static org.openqa.selenium.remote.tracing.Tags.EXCEPTION;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.grid.data.RequestId;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.NewSessionPayload;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.http.Routable;
import org.openqa.selenium.remote.http.Route;
import org.openqa.selenium.remote.tracing.AttributeKey;
import org.openqa.selenium.remote.tracing.EventAttribute;
import org.openqa.selenium.remote.tracing.EventAttributeValue;
import org.openqa.selenium.remote.tracing.Span;
import org.openqa.selenium.remote.tracing.Tracer;
import org.openqa.selenium.status.HasReadyState;

import java.io.IOException;
import java.io.Reader;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
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
            .to(() -> this::addToQueue),
        post("/se/grid/newsessionqueuer/session")
            .to(() -> new AddToSessionQueue(tracer, this)),
        post("/se/grid/newsessionqueuer/session/retry/{requestId}")
            .to(params -> new AddBackToSessionQueue(tracer, this, requestIdFrom(params))),
        get("/se/grid/newsessionqueuer/session/{requestId}")
            .to(params -> new RemoveFromSessionQueue(tracer, this, requestIdFrom(params))),
        delete("/se/grid/newsessionqueuer/queue")
            .to(() -> new ClearSessionQueue(tracer, this)));
  }

  private RequestId requestIdFrom(Map<String, String> params) {
    return new RequestId(UUID.fromString(params.get("requestId")));
  }

  public void validateSessionRequest(HttpRequest request) {
    try (Span span = tracer.getCurrentContext().createSpan("newsession_queuer.validate")) {
      Map<String, EventAttributeValue> attributeMap = new HashMap<>();
      try (
          Reader reader = reader(request);
          NewSessionPayload payload = NewSessionPayload.create(reader)) {
        Objects.requireNonNull(payload, "Requests to process must be set.");
        attributeMap.put("request.payload", EventAttribute.setValue(payload.toString()));

        Iterator<Capabilities> iterator = payload.stream().iterator();
        if (!iterator.hasNext()) {
          SessionNotCreatedException
              exception =
              new SessionNotCreatedException("No capabilities found");
          EXCEPTION.accept(attributeMap, exception);
          attributeMap.put(AttributeKey.EXCEPTION_MESSAGE.getKey(),
                           EventAttribute.setValue(exception.getMessage()));
          span.addEvent(AttributeKey.EXCEPTION_EVENT.getKey(), attributeMap);
          throw exception;
        }
      } catch (IOException e) {
        SessionNotCreatedException exception = new SessionNotCreatedException(e.getMessage(), e);
        EXCEPTION.accept(attributeMap, exception);
        attributeMap.put(AttributeKey.EXCEPTION_MESSAGE.getKey(),
                         EventAttribute.setValue(
                             "IOException while reading the request payload. " + exception
                                 .getMessage()));
        span.addEvent(AttributeKey.EXCEPTION_EVENT.getKey(), attributeMap);
        throw exception;
      }
    }
  }

  public abstract HttpResponse addToQueue(HttpRequest request);

  public abstract boolean retryAddToQueue(HttpRequest request, RequestId reqId);

  public abstract Optional<HttpRequest> remove(RequestId reqId);

  public abstract int clearQueue();

  @Override
  public boolean matches(HttpRequest req) {
    return routes.matches(req);
  }

  @Override
  public HttpResponse execute(HttpRequest req) {
    return routes.execute(req);
  }

}

