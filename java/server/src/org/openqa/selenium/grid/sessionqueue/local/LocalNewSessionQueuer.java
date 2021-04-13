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

package org.openqa.selenium.grid.sessionqueue.local;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.events.EventBus;
import org.openqa.selenium.grid.config.Config;
import org.openqa.selenium.grid.data.RequestId;
import org.openqa.selenium.grid.log.LoggingOptions;
import org.openqa.selenium.grid.security.Secret;
import org.openqa.selenium.grid.security.SecretOptions;
import org.openqa.selenium.grid.server.EventBusOptions;
import org.openqa.selenium.grid.sessionqueue.GetNewSessionResponse;
import org.openqa.selenium.grid.sessionqueue.NewSessionQueue;
import org.openqa.selenium.grid.sessionqueue.NewSessionQueuer;
import org.openqa.selenium.grid.sessionqueue.SessionRequest;
import org.openqa.selenium.grid.sessionqueue.config.NewSessionQueueOptions;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.NewSessionPayload;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.tracing.AttributeKey;
import org.openqa.selenium.remote.tracing.EventAttribute;
import org.openqa.selenium.remote.tracing.EventAttributeValue;
import org.openqa.selenium.remote.tracing.Span;
import org.openqa.selenium.remote.tracing.Tracer;

import java.io.IOException;
import java.io.Reader;
import java.time.Duration;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;

import static org.openqa.selenium.remote.http.Contents.reader;
import static org.openqa.selenium.remote.tracing.Tags.EXCEPTION;

public class LocalNewSessionQueuer extends NewSessionQueuer {

  public final NewSessionQueue sessionRequests;
  private final EventBus bus;
  private final GetNewSessionResponse getNewSessionResponse;

  public LocalNewSessionQueuer(
    Tracer tracer,
    EventBus bus,
    NewSessionQueue sessionRequests,
    Secret registrationSecret) {
    super(tracer, registrationSecret);
    this.bus = Require.nonNull("Event bus", bus);
    this.sessionRequests = Require.nonNull("New Session Request Queue", sessionRequests);

    this.getNewSessionResponse  = new GetNewSessionResponse(bus, sessionRequests);
  }

  public static NewSessionQueuer create(Config config) {
    Tracer tracer = new LoggingOptions(config).getTracer();
    EventBus bus = new EventBusOptions(config).getEventBus();
    Duration retryInterval = new NewSessionQueueOptions(config).getSessionRequestRetryInterval();
    Duration requestTimeout = new NewSessionQueueOptions(config).getSessionRequestTimeout();
    NewSessionQueue sessionRequests = new LocalNewSessionQueue(
      tracer,
      bus,
      retryInterval,
      requestTimeout);

    SecretOptions secretOptions = new SecretOptions(config);
    Secret registrationSecret = secretOptions.getRegistrationSecret();

    return new LocalNewSessionQueuer(tracer, bus, sessionRequests, registrationSecret);
  }

  @Override
  public HttpResponse addToQueue(SessionRequest request) {
    validateSessionRequest(request);
    return getNewSessionResponse.add(request);
  }

  @Override
  public boolean retryAddToQueue(SessionRequest request) {
    return sessionRequests.offerFirst(request);
  }

  @Override
  public Optional<SessionRequest> remove(RequestId id) {
    return sessionRequests.remove(id);
  }

  @Override
  public int clearQueue() {
    return sessionRequests.clear();
  }

  @Override
  public List<Set<Capabilities>> getQueueContents() {
    return sessionRequests.getQueuedRequests();
  }

  @Override
  public boolean isReady() {
    return bus.isReady();
  }

  private void validateSessionRequest(SessionRequest request) {
    try (Span span = tracer.getCurrentContext().createSpan("newsession_queuer.validate")) {
      Map<String, EventAttributeValue> attributeMap = new HashMap<>();

      if (request.getDesiredCapabilities().isEmpty()) {
        SessionNotCreatedException exception =
          new SessionNotCreatedException("No capabilities found");
        EXCEPTION.accept(attributeMap, exception);
        attributeMap.put(
          AttributeKey.EXCEPTION_MESSAGE.getKey(), EventAttribute.setValue(exception.getMessage()));
        span.addEvent(AttributeKey.EXCEPTION_EVENT.getKey(), attributeMap);
        throw exception;
      }
    }
  }
}

