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

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.openqa.selenium.grid.data.NewSessionRequestEvent.NEW_SESSION_REQUEST;
import static org.openqa.selenium.remote.http.Contents.utf8String;
import static org.openqa.selenium.remote.http.HttpMethod.POST;

import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.events.EventBus;
import org.openqa.selenium.events.local.GuavaEventBus;
import org.openqa.selenium.grid.sessionqueue.NewSessionQueue;
import org.openqa.selenium.remote.NewSessionPayload;
import org.openqa.selenium.remote.http.HttpMethod;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.tracing.DefaultTestTracer;
import org.openqa.selenium.remote.tracing.Tracer;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.util.Optional;
import java.util.UUID;

public class LocalNewSessionQueueTest {

  private EventBus bus;
  private ImmutableCapabilities caps;
  private NewSessionQueue sessionQueue;
  private HttpRequest expectedRequest;
  private UUID requestId;

  @Before
  public void setUp() {
    Tracer tracer = DefaultTestTracer.createTracer();
    caps = new ImmutableCapabilities("browserName", "chrome");
    bus = new GuavaEventBus();
    requestId = UUID.randomUUID();
    sessionQueue = new LocalNewSessionQueue(tracer, bus, 1);

    NewSessionPayload payload = NewSessionPayload.create(caps);
    expectedRequest = createRequest(payload, POST, "/session");
  }

  @Test
  public void shouldBeAbleToAddToEndOfQueue() {
    boolean added = sessionQueue.offerLast(expectedRequest, requestId);
    assertTrue(added);

    bus.addListener(NEW_SESSION_REQUEST, event -> {
      assertEquals(requestId, event.getData(UUID.class));
    });
  }

  @Test
  public void shouldBeAbleToRemoveFromFrontOfQueue() {
    boolean added = sessionQueue.offerLast(expectedRequest, requestId);
    assertTrue(added);

    Optional<HttpRequest> receivedRequest = sessionQueue.poll();

    assertTrue(receivedRequest.isPresent());
    assertEquals(expectedRequest, receivedRequest.get());
  }

  @Test
  public void shouldBeAbleToAddToFrontOfQueue() {
    ImmutableCapabilities chromeCaps = new ImmutableCapabilities("browserName", "chrome");
    NewSessionPayload chromePayload = NewSessionPayload.create(chromeCaps);
    HttpRequest chromeRequest = createRequest(chromePayload, POST, "/session");
    UUID chromeRequestId = UUID.randomUUID();

    ImmutableCapabilities firefoxCaps = new ImmutableCapabilities("browserName", "firefox");
    NewSessionPayload firefoxpayload = NewSessionPayload.create(firefoxCaps);
    HttpRequest firefoxRequest = createRequest(firefoxpayload, POST, "/session");
    UUID firefoxRequestId = UUID.randomUUID();

    boolean addedChromeRequest = sessionQueue.offerFirst(chromeRequest, chromeRequestId);
    assertTrue(addedChromeRequest);

    boolean addFirefoxRequest = sessionQueue.offerFirst(firefoxRequest, firefoxRequestId);
    assertTrue(addFirefoxRequest);

    Optional<HttpRequest> polledFirefoxRequest = sessionQueue.poll();
    assertTrue(polledFirefoxRequest.isPresent());
    assertEquals(firefoxRequest, polledFirefoxRequest.get());

    Optional<HttpRequest> polledChromeRequest = sessionQueue.poll();
    assertTrue(polledChromeRequest.isPresent());
    assertEquals(chromeRequest, polledChromeRequest.get());
  }

  private HttpRequest createRequest(NewSessionPayload payload, HttpMethod httpMethod, String uri) {
    StringBuilder builder = new StringBuilder();
    try {
      payload.writeTo(builder);
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }

    HttpRequest request = new HttpRequest(httpMethod, uri);
    request.setContent(utf8String(builder.toString()));

    return request;
  }
}