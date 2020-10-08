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

import com.google.common.collect.ImmutableMap;
import org.openqa.selenium.events.EventBus;
import org.openqa.selenium.grid.data.NewSessionErrorResponse;
import org.openqa.selenium.grid.data.NewSessionRejectedEvent;
import org.openqa.selenium.grid.data.NewSessionRequest;
import org.openqa.selenium.grid.data.NewSessionResponse;
import org.openqa.selenium.grid.data.NewSessionResponseEvent;
import org.openqa.selenium.grid.data.RequestId;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.tracing.Tracer;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CountDownLatch;
import java.util.logging.Level;
import java.util.logging.Logger;

import static java.net.HttpURLConnection.HTTP_INTERNAL_ERROR;
import static org.openqa.selenium.remote.http.Contents.asJson;
import static org.openqa.selenium.remote.http.Contents.bytes;

public class GetNewSessionResponse {

  private static final Logger LOG = Logger.getLogger(GetNewSessionResponse.class.getName());
  private final EventBus bus;
  private final Tracer tracer;
  private final NewSessionQueue sessionRequests;
  private final Map<RequestId, NewSessionRequest> knownRequests = new ConcurrentHashMap<>();

  public GetNewSessionResponse(Tracer tracer, EventBus bus,
                               NewSessionQueue sessionRequests) {
    this.tracer = Require.nonNull("Tracer", tracer);
    this.bus = Require.nonNull("Event bus", bus);
    this.sessionRequests = Require.nonNull("New Session Request Queue", sessionRequests);

    this.bus.addListener(NewSessionResponseEvent.listener(sessionResponse -> {
      try {
        this.setResponse(sessionResponse);
      } catch (Exception ignore) {
        // Ignore any exception. Do not want to block the eventbus thread.
      }
    }));

    this.bus.addListener(NewSessionRejectedEvent.listener(sessionResponse -> {
      try {
        this.setErrorResponse(sessionResponse);
      } catch (Exception ignore) {
        // Ignore any exception. Do not want to block the eventbus thread.
      }
    }));
  }

  private void setResponse(NewSessionResponse sessionResponse) {
    // Each thread will get its own CountDownLatch and it is stored in the Map using request id as the key.
    // EventBus thread will retrieve the same request and set it's response and unblock waiting request thread.
    RequestId id = sessionResponse.getRequestId();
    Optional<NewSessionRequest> sessionRequest = Optional.ofNullable(knownRequests.get(id));

    if (sessionRequest.isPresent()) {
      NewSessionRequest request = sessionRequest.get();
      request.setSessionResponse(
          new HttpResponse().setContent(bytes(sessionResponse.getDownstreamEncodedResponse())));
      request.getLatch().countDown();
    }
  }

  private void setErrorResponse(NewSessionErrorResponse sessionResponse) {
    RequestId id = sessionResponse.getRequestId();
    Optional<NewSessionRequest> sessionRequest = Optional.ofNullable(knownRequests.get(id));

    // There could be a situation where the session request in the queue is scheduled for retry.
    // Meanwhile the request queue is cleared.
    // This will fire a error response event and remove the request id from the knownRequests map.
    // Another error response event will be fired by the Distributor when the request is retried.
    // Since a response is already provided for the request, the event listener should not take any action.

    if (sessionRequest.isPresent()) {
      NewSessionRequest request = sessionRequest.get();
      request
          .setSessionResponse(new HttpResponse()
                                  .setStatus(HTTP_INTERNAL_ERROR)
                                  .setContent(asJson(
                                      ImmutableMap.of("message", sessionResponse.getMessage()))));
      request.getLatch().countDown();
    }
  }

  public HttpResponse add(HttpRequest request) {
    Require.nonNull("New Session request", request);

    CountDownLatch latch = new CountDownLatch(1);
    UUID uuid = UUID.randomUUID();
    RequestId requestId = new RequestId(uuid);
    NewSessionRequest requestIdentifier = new NewSessionRequest(requestId, latch);
    knownRequests.put(requestId, requestIdentifier);

    if (!sessionRequests.offerLast(request, requestId)) {
      return new HttpResponse()
          .setStatus(HTTP_INTERNAL_ERROR)
          .setContent(asJson(ImmutableMap.of("message",
                                             "Session request could not be created. Error while adding to the session queue.")));
    }

    try {
      // Block until response is received.
      // This will not wait indefinitely due to request timeout handled by the LocalDistributor.
      latch.await();
      HttpResponse res = requestIdentifier.getSessionResponse();
      return res;
    } catch (InterruptedException e) {
      LOG.log(Level.WARNING, "The thread waiting for new session response interrupted. {0}",
              e.getMessage());
      Thread.currentThread().interrupt();

      return new HttpResponse()
          .setStatus(HTTP_INTERNAL_ERROR)
          .setContent(asJson(ImmutableMap.of("message",
                                             "Session request could not be created. Error while processing the session request.")));
    } finally {
      removeRequest(requestId);
    }
  }

  private void removeRequest(RequestId id) {
    knownRequests.remove(id);
  }
}
