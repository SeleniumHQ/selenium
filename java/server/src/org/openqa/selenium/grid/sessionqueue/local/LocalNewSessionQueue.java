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
import org.openqa.selenium.grid.jmx.JMXHelper;
import org.openqa.selenium.grid.jmx.ManagedAttribute;
import org.openqa.selenium.grid.jmx.ManagedService;
import org.openqa.selenium.grid.log.LoggingOptions;
import org.openqa.selenium.grid.security.Secret;
import org.openqa.selenium.grid.security.SecretOptions;
import org.openqa.selenium.grid.server.EventBusOptions;
import org.openqa.selenium.grid.sessionqueue.NewSessionQueue;
import org.openqa.selenium.grid.sessionqueue.SessionRequest;
import org.openqa.selenium.grid.sessionqueue.config.SessionRequestOptions;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.tracing.AttributeKey;
import org.openqa.selenium.remote.tracing.EventAttribute;
import org.openqa.selenium.remote.tracing.EventAttributeValue;
import org.openqa.selenium.remote.tracing.Span;
import org.openqa.selenium.remote.tracing.Tracer;

import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import static org.openqa.selenium.remote.tracing.Tags.EXCEPTION;

@ManagedService(objectName = "org.seleniumhq.grid:type=SessionQueue,name=LocalSessionQueue",
  description = "New session queue")
public class LocalNewSessionQueue extends NewSessionQueue {

  public final SessionRequests sessionRequests;
  private final EventBus bus;
  private final GetNewSessionResponse getNewSessionResponse;

  public LocalNewSessionQueue(
    Tracer tracer,
    EventBus bus,
    Duration retryInterval,
    Duration requestTimeout,
    Secret registrationSecret) {
    super(tracer, registrationSecret);
    this.bus = Require.nonNull("Event bus", bus);

    this.sessionRequests = new SessionRequests(
      tracer,
      bus,
      Require.nonNull("Retry interval", retryInterval),
      Require.nonNull("Request timeout", requestTimeout));

    this.getNewSessionResponse  = new GetNewSessionResponse(bus, sessionRequests);

    new JMXHelper().register(this);
  }

  public static NewSessionQueue create(Config config) {
    Tracer tracer = new LoggingOptions(config).getTracer();
    EventBus bus = new EventBusOptions(config).getEventBus();
    Duration retryInterval = new SessionRequestOptions(config).getSessionRequestRetryInterval();
    Duration requestTimeout = new SessionRequestOptions(config).getSessionRequestTimeout();

    SecretOptions secretOptions = new SecretOptions(config);
    Secret registrationSecret = secretOptions.getRegistrationSecret();

    return new LocalNewSessionQueue(tracer, bus, retryInterval, requestTimeout, registrationSecret);
  }

  @Override
  public HttpResponse addToQueue(SessionRequest request) {
    validateSessionRequest(request);
    return getNewSessionResponse.add(request);
  }

  @Override
  public boolean offerLast(SessionRequest request) {
    Require.nonNull("Session request", request);
    return sessionRequests.offerLast(request);
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

  @ManagedAttribute(name = "NewSessionQueueSize")
  public int getQueueSize() {
    return sessionRequests.getQueueSize();
  }

  private void validateSessionRequest(SessionRequest request) {
    try (Span span = tracer.getCurrentContext().createSpan("newsession_queue.validate")) {
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

