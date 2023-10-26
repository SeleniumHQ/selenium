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

package org.openqa.selenium.grid.distributor;

import static org.assertj.core.api.Assertions.assertThat;
import static org.openqa.selenium.remote.Dialect.W3C;

import com.google.common.collect.ImmutableSet;
import java.net.URI;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.MutableCapabilities;
import org.openqa.selenium.NoSuchSessionException;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.grid.data.CreateSessionResponse;
import org.openqa.selenium.grid.data.DefaultSlotMatcher;
import org.openqa.selenium.grid.data.RequestId;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.data.SessionRequest;
import org.openqa.selenium.grid.distributor.local.LocalDistributor;
import org.openqa.selenium.grid.distributor.selector.DefaultSlotSelector;
import org.openqa.selenium.grid.node.Node;
import org.openqa.selenium.grid.node.local.LocalNode;
import org.openqa.selenium.grid.sessionmap.SessionMap;
import org.openqa.selenium.grid.sessionmap.local.LocalSessionMap;
import org.openqa.selenium.grid.sessionqueue.NewSessionQueue;
import org.openqa.selenium.grid.sessionqueue.local.LocalNewSessionQueue;
import org.openqa.selenium.grid.testing.PassthroughHttpClient;
import org.openqa.selenium.grid.testing.TestSessionFactory;
import org.openqa.selenium.grid.web.CombinedHandler;
import org.openqa.selenium.internal.Either;
import org.openqa.selenium.remote.http.HttpClient;

class DistributorTest extends DistributorTestBase {

  @Test
  void creatingANewSessionWithoutANodeEndsInFailure() {
    local =
        new LocalDistributor(
            tracer,
            bus,
            HttpClient.Factory.createDefault(),
            sessions,
            queue,
            new DefaultSlotSelector(),
            registrationSecret,
            Duration.ofMinutes(5),
            false,
            Duration.ofSeconds(5),
            newSessionThreadPoolSize,
            new DefaultSlotMatcher());
    Either<SessionNotCreatedException, CreateSessionResponse> result =
        local.newSession(createRequest(caps));
    assertThatEither(result).isLeft();
  }

  @Test
  void creatingASessionAddsItToTheSessionMap() {
    LocalSessionMap sessions = new LocalSessionMap(tracer, bus);
    NewSessionQueue queue =
        new LocalNewSessionQueue(
            tracer,
            new DefaultSlotMatcher(),
            Duration.ofSeconds(2),
            Duration.ofSeconds(2),
            registrationSecret,
            5);

    LocalNode node =
        LocalNode.builder(tracer, bus, routableUri, routableUri, registrationSecret)
            .add(
                caps,
                new TestSessionFactory(
                    (id, c) -> new Session(id, nodeUri, stereotype, c, Instant.now())))
            .build();

    local =
        new LocalDistributor(
            tracer,
            bus,
            new PassthroughHttpClient.Factory(node),
            sessions,
            queue,
            new DefaultSlotSelector(),
            registrationSecret,
            Duration.ofMinutes(5),
            false,
            Duration.ofSeconds(5),
            newSessionThreadPoolSize,
            new DefaultSlotMatcher());
    local.add(node);
    waitToHaveCapacity(local);

    MutableCapabilities sessionCaps = new MutableCapabilities(caps);
    sessionCaps.setCapability("sausages", "gravy");

    Either<SessionNotCreatedException, CreateSessionResponse> result =
        local.newSession(createRequest(sessionCaps));
    assertThatEither(result).isRight();
    Session returned = result.right().getSession();
    Session session = sessions.get(returned.getId());
    assertThat(session.getCapabilities().getCapability("sausages"))
        .isEqualTo(sessionCaps.getCapability("sausages"));
    assertThat(session.getUri()).isEqualTo(routableUri);
  }

  @Test
  void shouldReleaseSlotOnceSessionEnds() {
    SessionMap sessions = new LocalSessionMap(tracer, bus);
    NewSessionQueue queue =
        new LocalNewSessionQueue(
            tracer,
            new DefaultSlotMatcher(),
            Duration.ofSeconds(2),
            Duration.ofSeconds(2),
            registrationSecret,
            5);

    LocalNode node =
        LocalNode.builder(tracer, bus, routableUri, routableUri, registrationSecret)
            .add(
                caps,
                new TestSessionFactory(
                    (id, c) -> new Session(id, nodeUri, stereotype, c, Instant.now())))
            .build();

    local =
        new LocalDistributor(
            tracer,
            bus,
            new PassthroughHttpClient.Factory(node),
            sessions,
            queue,
            new DefaultSlotSelector(),
            registrationSecret,
            Duration.ofMinutes(5),
            false,
            Duration.ofSeconds(5),
            newSessionThreadPoolSize,
            new DefaultSlotMatcher());
    local.add(node);
    waitToHaveCapacity(local);

    // Use up the one slot available
    Session session;
    Either<SessionNotCreatedException, CreateSessionResponse> result =
        local.newSession(createRequest(caps));
    assertThatEither(result).isRight();
    session = result.right().getSession();
    // Make sure the session map has the session
    sessions.get(session.getId());

    Session argleBlarg = sessions.get(session.getId());

    node.stop(session.getId());
    // Now wait for the session map to say the session is gone.
    wait.until(
        obj -> {
          try {
            sessions.get(session.getId());
            return false;
          } catch (NoSuchSessionException e) {
            return true;
          }
        });

    waitToHaveCapacity(local);

    // And we should now be able to create another session.
    result = local.newSession(createRequest(caps));
    assertThatEither(result).isRight();
  }

  @Test
  void shouldNotStartASessionIfTheCapabilitiesAreNotSupported() {
    CombinedHandler handler = new CombinedHandler();

    LocalSessionMap sessions = new LocalSessionMap(tracer, bus);
    NewSessionQueue queue =
        new LocalNewSessionQueue(
            tracer,
            new DefaultSlotMatcher(),
            Duration.ofSeconds(2),
            Duration.ofSeconds(2),
            registrationSecret,
            5);
    handler.addHandler(sessions);

    Distributor distributor =
        new LocalDistributor(
            tracer,
            bus,
            new PassthroughHttpClient.Factory(handler),
            sessions,
            queue,
            new DefaultSlotSelector(),
            registrationSecret,
            Duration.ofMinutes(5),
            false,
            Duration.ofSeconds(5),
            newSessionThreadPoolSize,
            new DefaultSlotMatcher());
    handler.addHandler(distributor);

    Node node = createNode(caps, 1, 0);
    handler.addHandler(node);
    distributor.add(node);
    waitToHaveCapacity(distributor);

    Capabilities unmatched = new ImmutableCapabilities("browserName", "transit of venus");
    Either<SessionNotCreatedException, CreateSessionResponse> result =
        distributor.newSession(createRequest(unmatched));
    assertThatEither(result).isLeft();
  }

  @Test
  void attemptingToStartASessionWhichFailsMarksAsTheSlotAsAvailable() {
    SessionMap sessions = new LocalSessionMap(tracer, bus);
    NewSessionQueue queue =
        new LocalNewSessionQueue(
            tracer,
            new DefaultSlotMatcher(),
            Duration.ofSeconds(2),
            Duration.ofSeconds(2),
            registrationSecret,
            5);

    LocalNode node =
        LocalNode.builder(tracer, bus, routableUri, routableUri, registrationSecret)
            .add(
                caps,
                new TestSessionFactory(
                    (id, caps) -> {
                      throw new SessionNotCreatedException("OMG");
                    }))
            .build();

    local =
        new LocalDistributor(
            tracer,
            bus,
            new PassthroughHttpClient.Factory(node),
            sessions,
            queue,
            new DefaultSlotSelector(),
            registrationSecret,
            Duration.ofMinutes(5),
            false,
            Duration.ofSeconds(5),
            newSessionThreadPoolSize,
            new DefaultSlotMatcher());
    local.add(node);
    waitToHaveCapacity(local);

    Either<SessionNotCreatedException, CreateSessionResponse> result =
        local.newSession(createRequest(caps));
    assertThatEither(result).isLeft();

    assertThat(local.getStatus().hasCapacity()).isTrue();
  }

  private Node createBrokenNode(Capabilities stereotype) {
    URI uri = createUri();
    return LocalNode.builder(tracer, bus, uri, uri, registrationSecret)
        .add(
            stereotype,
            new TestSessionFactory(
                stereotype,
                (id, caps) -> {
                  throw new SessionNotCreatedException("Surprise!");
                }))
        .build();
  }

  @Test
  void shouldFallbackToSecondAvailableCapabilitiesIfFirstNotAvailable() {
    CombinedHandler handler = new CombinedHandler();

    Node firstNode = createNode(new ImmutableCapabilities("browserName", "not cheese"), 1, 1);
    Node secondNode = createNode(new ImmutableCapabilities("browserName", "cheese"), 1, 0);

    handler.addHandler(firstNode);
    handler.addHandler(secondNode);

    local =
        new LocalDistributor(
            tracer,
            bus,
            new PassthroughHttpClient.Factory(handler),
            sessions,
            queue,
            new DefaultSlotSelector(),
            registrationSecret,
            Duration.ofMinutes(5),
            false,
            Duration.ofSeconds(5),
            newSessionThreadPoolSize,
            new DefaultSlotMatcher());

    local.add(firstNode);
    local.add(secondNode);
    waitToHaveCapacity(local);

    SessionRequest sessionRequest =
        new SessionRequest(
            new RequestId(UUID.randomUUID()),
            Instant.now(),
            Set.of(W3C),
            // Insertion order is assumed to be preserved
            ImmutableSet.of(
                // There's no capacity for this
                new ImmutableCapabilities("browserName", "not cheese"),
                // But there is for this, so we expect this to be created.
                new ImmutableCapabilities("browserName", "cheese")),
            Map.of(),
            Map.of());

    Either<SessionNotCreatedException, CreateSessionResponse> result =
        local.newSession(sessionRequest);

    assertThat(result.isRight()).isTrue();
    Capabilities seen = result.right().getSession().getCapabilities();
    assertThat(seen.getBrowserName()).isEqualTo("cheese");
  }

  @Test
  void shouldFallbackToSecondAvailableCapabilitiesIfFirstThrowsOnCreation() {
    CombinedHandler handler = new CombinedHandler();
    Node brokenNode = createBrokenNode(new ImmutableCapabilities("browserName", "not cheese"));
    Node node = createNode(new ImmutableCapabilities("browserName", "cheese"), 1, 0);
    handler.addHandler(brokenNode);
    handler.addHandler(node);
    local =
        new LocalDistributor(
            tracer,
            bus,
            new PassthroughHttpClient.Factory(handler),
            sessions,
            queue,
            new DefaultSlotSelector(),
            registrationSecret,
            Duration.ofMinutes(5),
            false,
            Duration.ofSeconds(5),
            newSessionThreadPoolSize,
            new DefaultSlotMatcher());
    local.add(brokenNode);
    local.add(node);
    waitForAllNodesToHaveCapacity(local, 2);

    SessionRequest sessionRequest =
        new SessionRequest(
            new RequestId(UUID.randomUUID()),
            Instant.now(),
            Set.of(W3C),
            // Insertion order is assumed to be preserved
            ImmutableSet.of(
                // There's no capacity for this
                new ImmutableCapabilities("browserName", "not cheese"),
                // But there is for this, so we expect this to be created.
                new ImmutableCapabilities("browserName", "cheese")),
            Map.of(),
            Map.of());

    Either<SessionNotCreatedException, CreateSessionResponse> result =
        local.newSession(sessionRequest);

    assertThat(result.isRight()).isTrue();
    Capabilities seen = result.right().getSession().getCapabilities();
    assertThat(seen.getBrowserName()).isEqualTo("cheese");
  }
}
