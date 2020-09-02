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

import static org.openqa.selenium.grid.data.NewSessionResponseEvent.NEW_SESSION_RESPONSE;
import static org.openqa.selenium.grid.data.NewSessionRejectedEvent.NEW_SESSION_REJECTED;
import static org.openqa.selenium.remote.http.Contents.asJson;
import static org.openqa.selenium.remote.http.Contents.bytes;

import com.google.common.collect.ImmutableMap;

import org.openqa.selenium.events.EventBus;

import org.openqa.selenium.grid.data.NewSessionErrorResponse;
import org.openqa.selenium.grid.data.NewSessionRequest;
import org.openqa.selenium.grid.data.NewSessionResponse;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.tracing.Tracer;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CountDownLatch;
import java.util.logging.Level;
import java.util.logging.Logger;

public class GetNewSessionResponse {

  private static final Logger LOG = Logger.getLogger(GetNewSessionResponse.class.getName());
  private final EventBus bus;
  private final Tracer tracer;
  public final NewSessionQueue sessionRequests;
  private final Map<UUID, NewSessionRequest> knownRequests = new ConcurrentHashMap<>();

  public GetNewSessionResponse(Tracer tracer, EventBus bus,
                               NewSessionQueue sessionRequests) {
    this.tracer = Require.nonNull("Tracer", tracer);
    this.bus = Require.nonNull("Event bus", bus);
    this.sessionRequests = Require.nonNull("New Session Request Queue", sessionRequests);

    this.bus.addListener(NEW_SESSION_RESPONSE, event -> {
      try {
        NewSessionResponse sessionResponse = event.getData(NewSessionResponse.class);
        this.setResponse(sessionResponse);
      } catch (Exception ignore) {
        // Ignore any exception. Do not want to block the eventbus thread.
      }
    });

    this.bus.addListener(NEW_SESSION_REJECTED, event -> {
      try {
        NewSessionErrorResponse sessionResponse = event.getData(NewSessionErrorResponse.class);
        this.setErrorResponse(sessionResponse);
      } catch (Exception ignore) {
        // Ignore any exception. Do not want to block the eventbus thread.
      }
    });
  }

  private void setResponse(NewSessionResponse sessionResponse) {
    UUID id = sessionResponse.getRequestId();
    NewSessionRequest sessionRequest = knownRequests.get(id);
    sessionRequest.setSessionResponse(
        new HttpResponse().setContent(bytes(sessionResponse.getDownstreamEncodedResponse())));
    sessionRequest.getLatch().countDown();
  }

  private void setErrorResponse(NewSessionErrorResponse sessionResponse) {
    UUID id = sessionResponse.getRequestId();
    NewSessionRequest sessionRequest = knownRequests.get(id);
    sessionRequest
        .setSessionResponse(new HttpResponse()
                                .setStatus(500)
                                .setContent(asJson(
                                    ImmutableMap.of("message", sessionResponse.getMessage()))));
    sessionRequest.getLatch().countDown();
  }

  public HttpResponse add(HttpRequest request) {
    Require.nonNull("New Session request", request);
    CountDownLatch latch = new CountDownLatch(1);
    UUID requestId = UUID.randomUUID();
    NewSessionRequest requestIdentifier = new NewSessionRequest(requestId, latch);
    knownRequests.put(requestId, requestIdentifier);

    if (!sessionRequests.offerLast(request, requestId)) {
      return new HttpResponse()
          .setStatus(500)
          .setContent(asJson(ImmutableMap.of("message",
                                             "Session request could not be created. Error while adding to the session queue.")));
    }

    try {
      latch.await();
      HttpResponse res = requestIdentifier.getSessionResponse();
      removeRequest(requestId);
      LOG.log(Level.INFO,"New session request response: {0} ", res);
      return res;
    } catch (InterruptedException e) {
      LOG.warning(e.getMessage());
      Thread.currentThread().interrupt();
      return new HttpResponse()
          .setStatus(500)
          .setContent(asJson(ImmutableMap.of("message",
                                             "Session request could not be created. Error while processing the session request.")));
    }
  }

  private void removeRequest(UUID id) {
    knownRequests.remove(id);
  }
}