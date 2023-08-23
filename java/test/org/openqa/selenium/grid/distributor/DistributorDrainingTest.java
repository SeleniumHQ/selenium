package org.openqa.selenium.grid.distributor;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.Duration;
import java.time.Instant;
import java.util.Set;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.grid.data.CreateSessionResponse;
import org.openqa.selenium.grid.data.DefaultSlotMatcher;
import org.openqa.selenium.grid.data.NodeDrainComplete;
import org.openqa.selenium.grid.data.NodeStatus;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.distributor.local.LocalDistributor;
import org.openqa.selenium.grid.distributor.selector.DefaultSlotSelector;
import org.openqa.selenium.grid.node.local.LocalNode;
import org.openqa.selenium.grid.sessionmap.SessionMap;
import org.openqa.selenium.grid.sessionmap.local.LocalSessionMap;
import org.openqa.selenium.grid.sessionqueue.NewSessionQueue;
import org.openqa.selenium.grid.sessionqueue.local.LocalNewSessionQueue;
import org.openqa.selenium.grid.testing.PassthroughHttpClient;
import org.openqa.selenium.grid.testing.TestSessionFactory;
import org.openqa.selenium.internal.Either;
import org.openqa.selenium.support.ui.FluentWait;

public class DistributorDrainingTest extends DistributorTestBase {
  @Test
  void drainedNodeDoesNotShutDownIfNotEmpty() throws InterruptedException {
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

    CountDownLatch latch = new CountDownLatch(1);
    bus.addListener(NodeDrainComplete.listener(ignored -> latch.countDown()));

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

    Either<SessionNotCreatedException, CreateSessionResponse> session =
        local.newSession(createRequest(caps));
    assertThatEither(session).isRight();

    local.drain(node.getId());

    latch.await(5, TimeUnit.SECONDS);

    assertThat(latch.getCount()).isEqualTo(1);

    assertThat(local.getStatus().getNodes().size()).isEqualTo(1);
  }

  @Test
  void drainedNodeShutsDownAfterSessionsFinish() throws InterruptedException {
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
            .add(
                caps,
                new TestSessionFactory(
                    (id, c) -> new Session(id, nodeUri, stereotype, c, Instant.now())))
            .maximumConcurrentSessions(5)
            .build();

    CountDownLatch latch = new CountDownLatch(1);
    bus.addListener(NodeDrainComplete.listener(ignored -> latch.countDown()));

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

    Either<SessionNotCreatedException, CreateSessionResponse> firstResponse =
        local.newSession(createRequest(caps));

    Either<SessionNotCreatedException, CreateSessionResponse> secondResponse =
        local.newSession(createRequest(caps));

    local.drain(node.getId());

    assertThat(local.getStatus().getNodes().size()).isEqualTo(1);

    node.stop(firstResponse.right().getSession().getId());
    node.stop(secondResponse.right().getSession().getId());

    latch.await(5, TimeUnit.SECONDS);

    waitTillNodesAreRemoved(local);

    assertThat(latch.getCount()).isZero();
    assertThat(local.getStatus().getNodes()).isEmpty();
  }

  private void waitTillNodesAreRemoved(Distributor distributor) {
    new FluentWait<>(distributor)
        .withTimeout(Duration.ofSeconds(60))
        .pollingEvery(Duration.ofMillis(100))
        .until(
            d -> {
              Set<NodeStatus> nodes = d.getStatus().getNodes();
              return nodes.size() == 0;
            });
  }

  @Test
  void testDrainedNodeShutsDownOnceEmpty() throws InterruptedException {
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

    CountDownLatch latch = new CountDownLatch(1);
    bus.addListener(NodeDrainComplete.listener(ignored -> latch.countDown()));

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

    local.drain(node.getId());

    latch.await(5, TimeUnit.SECONDS);

    assertThat(latch.getCount()).isZero();

    assertThat(local.getStatus().getNodes()).isEmpty();

    Either<SessionNotCreatedException, CreateSessionResponse> result =
        local.newSession(createRequest(caps));
    assertThatEither(result).isLeft();
  }

  @Test
  void drainingNodeDoesNotAcceptNewSessions() {
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
    local.drain(node.getId());

    assertTrue(node.isDraining());

    Either<SessionNotCreatedException, CreateSessionResponse> result =
        local.newSession(createRequest(caps));
    assertThatEither(result).isLeft();
  }
}
