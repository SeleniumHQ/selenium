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

import org.openqa.selenium.events.EventBus;
import org.openqa.selenium.grid.config.Config;
import org.openqa.selenium.grid.data.RequestId;
import org.openqa.selenium.grid.log.LoggingOptions;
import org.openqa.selenium.grid.server.EventBusOptions;
import org.openqa.selenium.grid.sessionqueue.GetNewSessionResponse;
import org.openqa.selenium.grid.sessionqueue.NewSessionQueue;
import org.openqa.selenium.grid.sessionqueue.NewSessionQueuer;
import org.openqa.selenium.grid.sessionqueue.config.NewSessionQueueOptions;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.tracing.Tracer;

import java.time.Duration;
import java.util.Optional;
import java.util.logging.Logger;

public class LocalNewSessionQueuer extends NewSessionQueuer {

  private static final Logger LOG = Logger.getLogger(LocalNewSessionQueuer.class.getName());
  private final EventBus bus;
  public final NewSessionQueue sessionRequests;

  public LocalNewSessionQueuer(Tracer tracer, EventBus bus,
                               NewSessionQueue sessionRequests) {
    super(tracer);
    this.bus = Require.nonNull("Event bus", bus);
    this.sessionRequests = Require.nonNull("New Session Request Queue", sessionRequests);
  }

  public static NewSessionQueuer create(Config config) {
    Tracer tracer = new LoggingOptions(config).getTracer();
    EventBus bus = new EventBusOptions(config).getEventBus();
    Duration retryInterval = new NewSessionQueueOptions(config).getSessionRequestRetryInterval();
    NewSessionQueue sessionRequests = new LocalNewSessionQueue(tracer, bus, retryInterval);
    return new LocalNewSessionQueuer(tracer, bus, sessionRequests);
  }

  @Override
  public HttpResponse addToQueue(HttpRequest request) {
    validateSessionRequest(request);
    GetNewSessionResponse
        getNewSessionResponse = new GetNewSessionResponse(tracer, bus, sessionRequests);
    return getNewSessionResponse.add(request);
  }

  @Override
  public boolean retryAddToQueue(HttpRequest request, RequestId reqId) {
    return sessionRequests.offerFirst(request, reqId);
  }

  @Override
  public Optional<HttpRequest> remove() {
    return sessionRequests.poll();
  }

  @Override
  public int clearQueue() {
    return sessionRequests.clear();
  }

  @Override
  public boolean isReady() {
    return bus.isReady();
  }

}

