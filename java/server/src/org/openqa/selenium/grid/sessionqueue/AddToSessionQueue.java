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

import static org.openqa.selenium.remote.http.Contents.asJson;
import static org.openqa.selenium.remote.http.Contents.bytes;

import com.google.common.collect.ImmutableMap;

import org.openqa.selenium.events.EventBus;
import org.openqa.selenium.grid.data.CreateSessionRequest;

import static org.openqa.selenium.grid.data.NewSessionResponseEvent.NEW_SESSION_RESPONSE;

import org.openqa.selenium.grid.data.CreateSessionResponse;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.tracing.Tracer;

import java.util.concurrent.CountDownLatch;
import java.util.logging.Logger;

class AddToSessionQueue {

  private static final Logger LOG = Logger.getLogger(SessionRequestQueuer.class.getName());
  private final EventBus bus;
  private final Tracer tracer;
  public final SessionRequestQueue sessionRequests;
  private HttpResponse response;
  private final CountDownLatch latch = new CountDownLatch(1);

  AddToSessionQueue(Tracer tracer, EventBus bus,
                    SessionRequestQueue sessionRequests) {
    this.tracer = Require.nonNull("Tracer", tracer);
    this.bus = Require.nonNull("Event bus", bus);
    this.sessionRequests = Require.nonNull("New Session Request Queue", sessionRequests);

    this.bus.addListener(NEW_SESSION_RESPONSE, event -> {
      response = new HttpResponse();
      CreateSessionResponse sessionResponse = event.getData(CreateSessionResponse.class);
      LOG.info("Listener picked the response up"+ sessionResponse.getSession().getId().toString());
      response.setContent(bytes(sessionResponse.getDownstreamEncodedResponse()));
      latch.countDown();
    });
  }

  public HttpResponse add(CreateSessionRequest sessionRequest) {
    if (!sessionRequests.offer(sessionRequest)) {
      return new HttpResponse()
          .setContent(asJson(ImmutableMap.of("message",
                                             "Session request could not be created. Error while adding to the session queue.")));
    }

    try {
      latch.await();
    } catch (InterruptedException e) {
      LOG.warning(e.getMessage());
      return new HttpResponse().setStatus(500)
          .setContent(asJson(ImmutableMap.of("message",
                                             "Session request could not be created. Error while processing the session request.")));
    }

    LOG.info("New session request response" + response.toString());
    return response;
  }
}
