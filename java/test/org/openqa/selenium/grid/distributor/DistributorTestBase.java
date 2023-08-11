package org.openqa.selenium.grid.distributor;

import static org.openqa.selenium.grid.data.Availability.UP;
import static org.openqa.selenium.remote.Dialect.W3C;

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;
import java.io.UncheckedIOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.logging.Logger;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.events.EventBus;
import org.openqa.selenium.events.zeromq.ZeroMqEventBus;
import org.openqa.selenium.grid.data.Availability;
import org.openqa.selenium.grid.data.CreateSessionRequest;
import org.openqa.selenium.grid.data.DefaultSlotMatcher;
import org.openqa.selenium.grid.data.NodeStatus;
import org.openqa.selenium.grid.data.RequestId;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.data.SessionRequest;
import org.openqa.selenium.grid.distributor.local.LocalDistributor;
import org.openqa.selenium.grid.node.Node;
import org.openqa.selenium.grid.node.local.LocalNode;
import org.openqa.selenium.grid.security.Secret;
import org.openqa.selenium.grid.sessionmap.local.LocalSessionMap;
import org.openqa.selenium.grid.sessionqueue.NewSessionQueue;
import org.openqa.selenium.grid.sessionqueue.local.LocalNewSessionQueue;
import org.openqa.selenium.grid.testing.EitherAssert;
import org.openqa.selenium.grid.testing.TestSessionFactory;
import org.openqa.selenium.internal.Either;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.remote.Dialect;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.tracing.DefaultTestTracer;
import org.openqa.selenium.remote.tracing.Tracer;
import org.openqa.selenium.status.HasReadyState;
import org.openqa.selenium.support.ui.FluentWait;
import org.openqa.selenium.support.ui.Wait;
import org.zeromq.ZContext;

public abstract class DistributorTestBase {
  protected static final Logger LOG = Logger.getLogger("Distributor Test");
  protected static final int newSessionThreadPoolSize = Runtime.getRuntime().availableProcessors();
  protected final Secret registrationSecret = new Secret("hellim");
  protected final Wait<Object> wait =
      new FluentWait<>(new Object()).withTimeout(Duration.ofSeconds(5));
  protected Tracer tracer;
  protected EventBus bus;
  protected LocalDistributor local;
  protected Capabilities stereotype;
  protected Capabilities caps;
  protected URI nodeUri;
  protected URI routableUri;
  protected LocalSessionMap sessions;
  protected NewSessionQueue queue;

  protected static <A, B> EitherAssert<A, B> assertThatEither(Either<A, B> either) {
    return new EitherAssert<>(either);
  }

  @BeforeEach
  public void setUp() throws URISyntaxException {
    nodeUri = new URI("http://example:5678");
    routableUri = createUri();
    tracer = DefaultTestTracer.createTracer();
    bus =
        ZeroMqEventBus.create(
            new ZContext(),
            "tcp://localhost:" + PortProber.findFreePort(),
            "tcp://localhost:" + PortProber.findFreePort(),
            true,
            registrationSecret);
    sessions = new LocalSessionMap(tracer, bus);
    queue =
        new LocalNewSessionQueue(
            tracer,
            new DefaultSlotMatcher(),
            Duration.ofSeconds(2),
            Duration.ofSeconds(2),
            registrationSecret,
            5);

    stereotype = new ImmutableCapabilities("browserName", "cheese");
    caps = new ImmutableCapabilities("browserName", "cheese");
    new FluentWait<>(bus).withTimeout(Duration.ofSeconds(5)).until(HasReadyState::isReady);
  }

  @AfterEach
  public void cleanUp() {
    bus.close();
    if (local != null) {
      local.close();
    }
  }

  protected URI createUri() {
    try {
      return new URI("http://localhost:" + PortProber.findFreePort());
    } catch (URISyntaxException e) {
      throw new RuntimeException(e);
    }
  }

  protected void waitToHaveCapacity(Distributor distributor) {
    new FluentWait<>(distributor)
        .withTimeout(Duration.ofSeconds(5))
        .pollingEvery(Duration.ofMillis(100))
        .until(d -> d.getStatus().hasCapacity());
  }

  protected SessionRequest createRequest(Capabilities... allCaps) {
    return new SessionRequest(
        new RequestId(UUID.randomUUID()),
        Instant.now(),
        Set.of(W3C),
        Set.of(allCaps),
        Map.of(),
        Map.of());
  }

  protected void waitForAllNodesToMeetCondition(
      Distributor distributor, int nodeCount, Availability availability) {
    new FluentWait<>(distributor)
        .withTimeout(Duration.ofSeconds(10))
        .pollingEvery(Duration.ofMillis(100))
        .until(
            d -> {
              Set<NodeStatus> nodes = d.getStatus().getNodes();
              return nodes.size() == nodeCount
                  && nodes.stream()
                      .allMatch(
                          node -> node.getAvailability() == availability && node.hasCapacity());
            });
  }

  protected Node createNode(Capabilities stereotype, int count, int currentLoad) {
    URI uri = createUri();
    LocalNode.Builder builder = LocalNode.builder(tracer, bus, uri, uri, registrationSecret);
    for (int i = 0; i < count; i++) {
      builder.add(stereotype, new TestSessionFactory((id, caps) -> new HandledSession(uri, caps)));
    }
    builder.maximumConcurrentSessions(12);

    LocalNode node = builder.build();
    for (int i = 0; i < currentLoad; i++) {
      // Ignore the session. We're just creating load.
      node.newSession(
          new CreateSessionRequest(
              ImmutableSet.copyOf(Dialect.values()), stereotype, ImmutableMap.of()));
    }

    return node;
  }

  protected void waitForAllNodesToHaveCapacity(Distributor distributor, int nodeCount) {
    waitForAllNodesToMeetCondition(distributor, nodeCount, UP);
  }

  protected class HandledSession extends Session implements HttpHandler {

    HandledSession(URI uri, Capabilities caps) {
      super(new SessionId(UUID.randomUUID()), uri, stereotype, caps, Instant.now());
    }

    @Override
    public HttpResponse execute(HttpRequest req) throws UncheckedIOException {
      // no-op
      return new HttpResponse();
    }
  }
}
