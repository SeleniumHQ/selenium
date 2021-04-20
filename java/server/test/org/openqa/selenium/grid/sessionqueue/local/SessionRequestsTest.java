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

import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.events.EventBus;
import org.openqa.selenium.events.local.GuavaEventBus;
import org.openqa.selenium.grid.data.NewSessionRejectedEvent;
import org.openqa.selenium.grid.data.NewSessionRequestEvent;
import org.openqa.selenium.grid.data.RequestId;
import org.openqa.selenium.grid.sessionqueue.SessionRequest;
import org.openqa.selenium.remote.tracing.DefaultTestTracer;
import org.openqa.selenium.remote.tracing.Tracer;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.openqa.selenium.remote.Dialect.W3C;

public class SessionRequestsTest {

  private EventBus bus;
  private SessionRequests sessionQueue;
  private SessionRequest expectedSessionRequest;
  private Capabilities expectedCaps;

  @Before
  public void setUp() {
    Tracer tracer = DefaultTestTracer.createTracer();
    expectedCaps = new ImmutableCapabilities("browserName", "chrome");
    bus = new GuavaEventBus();
    sessionQueue = new SessionRequests(
        tracer,
        bus,
        Duration.ofSeconds(30),
        Duration.ofSeconds(30));

    expectedSessionRequest = createRequest(expectedCaps);
  }

  @Test
  public void shouldBeAbleToAddToEndOfQueue() throws InterruptedException {
    AtomicBoolean result = new AtomicBoolean(false);
    CountDownLatch latch = new CountDownLatch(1);

    bus.addListener(NewSessionRequestEvent.listener(reqId -> {
      result.set(expectedSessionRequest.getRequestId().equals(reqId));
      latch.countDown();
    }));

    boolean added = sessionQueue.offerLast(expectedSessionRequest);
    assertTrue(added);

    latch.await(5, TimeUnit.SECONDS);

    assertThat(latch.getCount()).isEqualTo(0);
    assertTrue(result.get());
  }

  @Test
  public void shouldBeAbleToRemoveFromFrontOfQueue() {
    boolean added = sessionQueue.offerLast(expectedSessionRequest);
    assertTrue(added);

    Optional<SessionRequest> receivedRequest = sessionQueue.remove(expectedSessionRequest.getRequestId());

    assertTrue(receivedRequest.isPresent());
    assertEquals(Set.of(expectedCaps), receivedRequest.get().getDesiredCapabilities());
  }

  @Test
  public void shouldBeAbleToRemoveFromEmptyQueue() {
    Optional<SessionRequest> receivedRequest = sessionQueue.remove(expectedSessionRequest.getRequestId());
    assertFalse(receivedRequest.isPresent());
  }

  @Test
  public void shouldBeAbleToRemoveRequest() {
    ImmutableCapabilities chromeCaps = new ImmutableCapabilities("browserName", "chrome");
    SessionRequest chromeRequest = createRequest(chromeCaps);

    ImmutableCapabilities firefoxCaps = new ImmutableCapabilities("browserName", "firefox");
    SessionRequest firefoxRequest = createRequest(firefoxCaps);

    boolean addedChromeRequest = sessionQueue.offerFirst(chromeRequest);
    assertTrue(addedChromeRequest);

    boolean addFirefoxRequest = sessionQueue.offerFirst(firefoxRequest);
    assertTrue(addFirefoxRequest);

    Optional<SessionRequest> polledChromeRequest = sessionQueue.remove(chromeRequest.getRequestId());
    assertTrue(polledChromeRequest.isPresent());
    assertEquals(Set.of(chromeCaps), polledChromeRequest.get().getDesiredCapabilities());

    Optional<SessionRequest> polledFirefoxRequest = sessionQueue.remove(firefoxRequest.getRequestId());
    assertTrue(polledFirefoxRequest.isPresent());
    assertEquals(Set.of(firefoxCaps), polledFirefoxRequest.get().getDesiredCapabilities());
  }

  @Test
  public void shouldBeAbleToAddToFrontOfQueue() {
    ImmutableCapabilities chromeCaps = new ImmutableCapabilities("browserName", "chrome");
    SessionRequest chromeRequest = createRequest(chromeCaps);

    ImmutableCapabilities firefoxCaps = new ImmutableCapabilities("browserName", "firefox");
    SessionRequest firefoxRequest = createRequest(firefoxCaps);

    boolean addedChromeRequest = sessionQueue.offerFirst(chromeRequest);
    assertTrue(addedChromeRequest);

    boolean addFirefoxRequest = sessionQueue.offerFirst(firefoxRequest);
    assertTrue(addFirefoxRequest);

    Optional<SessionRequest> polledFirefoxRequest = sessionQueue.remove(firefoxRequest.getRequestId());
    assertTrue(polledFirefoxRequest.isPresent());
    assertEquals(firefoxRequest, polledFirefoxRequest.get());

    Optional<SessionRequest> polledChromeRequest = sessionQueue.remove(chromeRequest.getRequestId());
    assertTrue(polledChromeRequest.isPresent());
    assertEquals(chromeRequest, polledChromeRequest.get());
  }

  @Test
  public void shouldBeClearAPopulatedQueue() {
    sessionQueue.offerLast(createRequest(new ImmutableCapabilities("browserName", "brie")));
    sessionQueue.offerLast(createRequest(new ImmutableCapabilities("browserName", "cheddar")));

    int count = sessionQueue.clear();
    assertEquals(count, 2);
  }

  @Test
  public void shouldBeClearAEmptyQueue() {
    int count = sessionQueue.clear();
    assertEquals(count, 0);
  }

  @Test
  public void shouldBeAbleToGetQueueSize() {
    boolean added = sessionQueue.offerLast(expectedSessionRequest);
    assertTrue(added);

    int size = sessionQueue.getQueueSize();
    assertEquals(1, size);
  }

  @Test
  public void shouldBeAbleToGetQueueContents() {
    ImmutableCapabilities chromeCaps = new ImmutableCapabilities(
      "browserName", "chrome",
      "platform", "mac",
      "version", "87");
    SessionRequest chromeRequest = createRequest(chromeCaps);
    boolean addedChromeRequest = sessionQueue.offerLast(chromeRequest);
    assertTrue(addedChromeRequest);

    ImmutableCapabilities firefoxCaps = new ImmutableCapabilities(
      "browserName", "firefox",
      "platform", "windows",
      "version", "84");
    SessionRequest firefoxRequest = createRequest(firefoxCaps);
    boolean addFirefoxRequest = sessionQueue.offerLast(firefoxRequest);
    assertTrue(addFirefoxRequest);

    List<Set<Capabilities>> response = sessionQueue.getQueuedRequests();
    assertThat(response).isNotNull();

    assertEquals(2, response.size());

    assertEquals(Set.of(chromeCaps), response.get(0));
    assertEquals(Set.of(firefoxCaps), response.get(1));
  }

  @Test(timeout = 15000)
  public void shouldBeAbleToRemoveRequestsOnTimeout() throws InterruptedException {
    SessionRequests localSessionQueue = new SessionRequests(
      DefaultTestTracer.createTracer(),
      bus,
      Duration.ofSeconds(30),
      Duration.ofSeconds(1));

    CountDownLatch latch = new CountDownLatch(1);

    bus.addListener(NewSessionRejectedEvent.listener(reqId -> latch.countDown()));

    boolean added = localSessionQueue.offerLast(expectedSessionRequest);
    assertTrue(added);

    boolean requestExpired = latch.await(10, TimeUnit.SECONDS);

    assertThat(requestExpired).isTrue();
    assertThat(localSessionQueue.getQueueSize()).isZero();
  }

  private SessionRequest createRequest(Capabilities caps) {
    return new SessionRequest(
      new RequestId(UUID.randomUUID()),
      Instant.now(),
      Set.of(W3C),
      Set.of(caps));
  }
}
