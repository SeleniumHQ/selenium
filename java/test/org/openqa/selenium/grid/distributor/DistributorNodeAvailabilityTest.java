package org.openqa.selenium.grid.distributor;

import static org.assertj.core.api.Assertions.assertThat;
import static org.openqa.selenium.grid.data.Availability.DOWN;
import static org.openqa.selenium.grid.data.Availability.UP;

import java.net.MalformedURLException;
import java.net.URI;
import java.net.URL;
import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.MutableCapabilities;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.grid.data.Availability;
import org.openqa.selenium.grid.data.CreateSessionResponse;
import org.openqa.selenium.grid.data.DefaultSlotMatcher;
import org.openqa.selenium.grid.data.DistributorStatus;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.distributor.local.LocalDistributor;
import org.openqa.selenium.grid.distributor.remote.RemoteDistributor;
import org.openqa.selenium.grid.distributor.selector.DefaultSlotSelector;
import org.openqa.selenium.grid.node.HealthCheck;
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

public class DistributorNodeAvailabilityTest extends DistributorTestBase {

  @Test
  void registeringTheSameNodeMultipleTimesOnlyCountsTheFirstTime() {
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
    local.add(node);

    DistributorStatus status = local.getStatus();

    assertThat(status.getNodes().size()).isEqualTo(1);
  }

  @Test
  void shouldBeAbleToRemoveANode() throws MalformedURLException {
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
    Distributor distributor =
        new RemoteDistributor(
            tracer,
            new PassthroughHttpClient.Factory(local),
            new URL("http://does.not.exist"),
            registrationSecret);
    distributor.add(node);
    distributor.remove(node.getId());

    Either<SessionNotCreatedException, CreateSessionResponse> result =
        local.newSession(createRequest(caps));
    assertThatEither(result).isLeft();
  }

  @Test
  void shouldIncludeHostsThatAreUpInHostList() {
    CombinedHandler handler = new CombinedHandler();

    SessionMap sessions = new LocalSessionMap(tracer, bus);
    NewSessionQueue queue =
        new LocalNewSessionQueue(
            tracer,
            new DefaultSlotMatcher(),
            Duration.ofSeconds(2),
            Duration.ofSeconds(2),
            registrationSecret,
            5);
    handler.addHandler(sessions);

    URI uri = createUri();
    Node alwaysDown =
        LocalNode.builder(tracer, bus, uri, uri, registrationSecret)
            .add(
                caps,
                new TestSessionFactory(
                    (id, c) -> new Session(id, uri, stereotype, c, Instant.now())))
            .advanced()
            .healthCheck(() -> new HealthCheck.Result(DOWN, "Boo!"))
            .build();
    handler.addHandler(alwaysDown);

    local =
        new LocalDistributor(
            tracer,
            bus,
            new PassthroughHttpClient.Factory(handler),
            sessions,
            queue,
            new DefaultSlotSelector(),
            registrationSecret,
            Duration.ofSeconds(1),
            false,
            Duration.ofSeconds(5),
            newSessionThreadPoolSize,
            new DefaultSlotMatcher());
    handler.addHandler(local);
    local.add(alwaysDown);
    waitForAllNodesToMeetCondition(local, 1, DOWN);

    // Should be unable to create a session because the node is down.
    Either<SessionNotCreatedException, CreateSessionResponse> result =
        local.newSession(createRequest(caps));
    assertThatEither(result).isLeft();

    Node alwaysUp =
        LocalNode.builder(tracer, bus, uri, uri, registrationSecret)
            .add(
                caps,
                new TestSessionFactory(
                    (id, c) -> new Session(id, uri, stereotype, c, Instant.now())))
            .advanced()
            .healthCheck(() -> new HealthCheck.Result(UP, "Yay!"))
            .build();
    handler.addHandler(alwaysUp);

    local.add(alwaysUp);
    waitToHaveCapacity(local);

    result = local.newSession(createRequest(caps));
    assertThatEither(result).isRight();
  }

  @Test
  void shouldNotRemoveNodeWhoseHealthCheckPassesBeforeThreshold() throws InterruptedException {
    CombinedHandler handler = new CombinedHandler();

    AtomicInteger count = new AtomicInteger(0);
    CountDownLatch latch = new CountDownLatch(1);

    SessionMap sessions = new LocalSessionMap(tracer, bus);
    handler.addHandler(sessions);
    NewSessionQueue queue =
        new LocalNewSessionQueue(
            tracer,
            new DefaultSlotMatcher(),
            Duration.ofSeconds(2),
            Duration.ofSeconds(2),
            registrationSecret,
            5);

    URI uri = createUri();
    Node node =
        LocalNode.builder(tracer, bus, uri, uri, registrationSecret)
            .add(
                caps,
                new TestSessionFactory(
                    (id, caps) -> new Session(id, uri, stereotype, caps, Instant.now())))
            .advanced()
            .healthCheck(
                () -> {
                  if (count.get() <= 4) {
                    count.incrementAndGet();
                    return new HealthCheck.Result(DOWN, "Down");
                  }
                  latch.countDown();
                  return new HealthCheck.Result(UP, "Up");
                })
            .build();
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
            Duration.ofSeconds(1),
            false,
            Duration.ofSeconds(5),
            newSessionThreadPoolSize,
            new DefaultSlotMatcher());
    handler.addHandler(local);
    local.add(node);

    latch.await(60, TimeUnit.SECONDS);

    waitToHaveCapacity(local);

    Either<SessionNotCreatedException, CreateSessionResponse> result =
        local.newSession(createRequest(caps));
    assertThatEither(result).isRight();
  }

  @Test
  void shouldReturnNodesThatWereDownToPoolOfNodesOnceTheyMarkTheirHealthCheckPasses() {
    CombinedHandler handler = new CombinedHandler();

    SessionMap sessions = new LocalSessionMap(tracer, bus);
    handler.addHandler(sessions);
    AtomicReference<Availability> isUp = new AtomicReference<>(DOWN);
    NewSessionQueue queue =
        new LocalNewSessionQueue(
            tracer,
            new DefaultSlotMatcher(),
            Duration.ofSeconds(2),
            Duration.ofSeconds(2),
            registrationSecret,
            5);

    URI uri = createUri();
    Node node =
        LocalNode.builder(tracer, bus, uri, uri, registrationSecret)
            .add(
                caps,
                new TestSessionFactory(
                    (id, caps) -> new Session(id, uri, stereotype, caps, Instant.now())))
            .advanced()
            .healthCheck(() -> new HealthCheck.Result(isUp.get(), "TL;DR"))
            .build();
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
            Duration.ofSeconds(1),
            false,
            Duration.ofSeconds(5),
            newSessionThreadPoolSize,
            new DefaultSlotMatcher());
    handler.addHandler(local);
    local.add(node);
    waitForAllNodesToMeetCondition(local, 1, DOWN);

    // Should be unable to create a session because the node is down.
    Either<SessionNotCreatedException, CreateSessionResponse> result =
        local.newSession(createRequest(caps));
    assertThatEither(result).isLeft();

    // Mark the node as being up
    isUp.set(UP);
    // Kick the machinery to ensure that everything is fine.
    local.refresh();

    // Because the node is now up and running, we should now be able to create a session
    result = local.newSession(createRequest(caps));
    assertThatEither(result).isRight();
  }

  @Test
  void shouldBeAbleToAddANodeAndCreateASession() {
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
    Session session = result.right().getSession();
    assertThat(session.getCapabilities().getCapability("sausages"))
        .isEqualTo(sessionCaps.getCapability("sausages"));
    assertThat(session.getUri()).isEqualTo(routableUri);
  }
}
