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

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;
import io.opentelemetry.OpenTelemetry;
import io.opentelemetry.trace.Tracer;
import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.NoSuchSessionException;
import org.openqa.selenium.events.EventBus;
import org.openqa.selenium.events.local.GuavaEventBus;
import org.openqa.selenium.grid.component.HealthCheck;
import org.openqa.selenium.grid.data.CreateSessionRequest;
import org.openqa.selenium.grid.data.CreateSessionResponse;
import org.openqa.selenium.grid.data.DistributorStatus;
import org.openqa.selenium.grid.data.NodeStatus;
import org.openqa.selenium.grid.data.NodeStatusEvent;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.data.SessionClosedEvent;
import org.openqa.selenium.grid.distributor.local.LocalDistributor;
import org.openqa.selenium.grid.distributor.remote.RemoteDistributor;
import org.openqa.selenium.grid.node.CapabilityResponseEncoder;
import org.openqa.selenium.grid.node.Node;
import org.openqa.selenium.grid.node.local.LocalNode;
import org.openqa.selenium.grid.sessionmap.local.LocalSessionMap;
import org.openqa.selenium.grid.testing.TestSessionFactory;
import org.openqa.selenium.grid.web.CombinedHandler;
import org.openqa.selenium.grid.web.RoutableHttpClientFactory;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.support.ui.FluentWait;
import org.openqa.selenium.support.ui.Wait;

import java.net.MalformedURLException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.time.Duration;
import java.util.HashSet;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;

import static com.google.common.collect.Iterables.getOnlyElement;
import static org.junit.Assert.assertEquals;
import static org.openqa.selenium.remote.Dialect.W3C;

public class AddingNodesTest {

  private static final Capabilities CAPS = new ImmutableCapabilities("cheese", "gouda");

  private Distributor distributor;
  private Tracer tracer;
  private EventBus bus;
  private HttpClient.Factory clientFactory;
  private Wait<Object> wait;
  private URL externalUrl;
  private CombinedHandler handler;

  @Before
  public void setUpDistributor() throws MalformedURLException {
    tracer = OpenTelemetry.getTracerProvider().get("default");
    bus = new GuavaEventBus();

    handler = new CombinedHandler();
    externalUrl = new URL("http://example.com");
    clientFactory = new RoutableHttpClientFactory(
        externalUrl,
        handler,
        HttpClient.Factory.createDefault());

    LocalSessionMap sessions = new LocalSessionMap(tracer, bus);
    Distributor local = new LocalDistributor(tracer, bus, clientFactory, sessions, null);
    handler.addHandler(local);
    distributor = new RemoteDistributor(tracer, clientFactory, externalUrl);

    wait = new FluentWait<>(new Object()).withTimeout(Duration.ofSeconds(2));
  }

  @Test
  public void shouldBeAbleToRegisterALocalNode() throws URISyntaxException {
    URI sessionUri = new URI("http://example:1234");
    Node node = LocalNode.builder(tracer, bus, clientFactory, externalUrl.toURI(), null)
        .add(CAPS, new TestSessionFactory((id, caps) -> new Session(id, sessionUri, caps)))
        .build();
    handler.addHandler(node);

    distributor.add(node);

    wait.until(obj -> distributor.getStatus().hasCapacity());

    DistributorStatus.NodeSummary summary = getOnlyElement(distributor.getStatus().getNodes());
    assertEquals(1, summary.getStereotypes().get(CAPS).intValue());
  }

  @Test
  public void shouldBeAbleToRegisterACustomNode() throws URISyntaxException {
    URI sessionUri = new URI("http://example:1234");
    Node node = new CustomNode(
        bus,
        UUID.randomUUID(),
        externalUrl.toURI(),
        c -> new Session(new SessionId(UUID.randomUUID()), sessionUri, c));
    handler.addHandler(node);

    distributor.add(node);

    wait.until(obj -> distributor.getStatus().hasCapacity());

    DistributorStatus.NodeSummary summary = getOnlyElement(distributor.getStatus().getNodes());
    assertEquals(1, summary.getStereotypes().get(CAPS).intValue());
  }

  @Test
  public void shouldBeAbleToRegisterNodesByListeningForEvents() throws URISyntaxException {
    URI sessionUri = new URI("http://example:1234");
    Node node = LocalNode.builder(tracer, bus, clientFactory, externalUrl.toURI(), null)
        .add(CAPS, new TestSessionFactory((id, caps) -> new Session(id, sessionUri, caps)))
        .build();
    handler.addHandler(node);

    bus.fire(new NodeStatusEvent(node.getStatus()));

    wait.until(obj -> distributor.getStatus().hasCapacity());

    DistributorStatus.NodeSummary summary = getOnlyElement(distributor.getStatus().getNodes());
    assertEquals(1, summary.getStereotypes().get(CAPS).intValue());
  }

  @Test
  public void distributorShouldUpdateStateOfExistingNodeWhenNodePublishesStateChange()
      throws URISyntaxException {
    URI sessionUri = new URI("http://example:1234");
    Node node = LocalNode.builder(tracer, bus, clientFactory, externalUrl.toURI(), null)
        .add(CAPS, new TestSessionFactory((id, caps) -> new Session(id, sessionUri, caps)))
        .build();
    handler.addHandler(node);

    bus.fire(new NodeStatusEvent(node.getStatus()));

    // Start empty
    wait.until(obj -> distributor.getStatus().hasCapacity());

    DistributorStatus.NodeSummary summary = getOnlyElement(distributor.getStatus().getNodes());
    assertEquals(1, summary.getStereotypes().get(CAPS).intValue());

    // Craft a status that makes it look like the node is busy, and post it on the bus.
    NodeStatus status = node.getStatus();
    NodeStatus crafted = new NodeStatus(
        status.getNodeId(),
        status.getUri(),
        status.getMaxSessionCount(),
        status.getStereotypes(),
        ImmutableSet.of(new NodeStatus.Active(CAPS, new SessionId(UUID.randomUUID()), CAPS)),
        null);

    bus.fire(new NodeStatusEvent(crafted));

    // We claimed the only slot is filled. Life is good.
    wait.until(obj -> !distributor.getStatus().hasCapacity());
  }

  static class CustomNode extends Node {

    private final EventBus bus;
    private final Function<Capabilities, Session> factory;
    private Session running;

    protected CustomNode(
        EventBus bus,
        UUID nodeId,
        URI uri,
        Function<Capabilities, Session> factory) {
      super(OpenTelemetry.getTracerProvider().get("default"), nodeId, uri);

      this.bus = bus;
      this.factory = Objects.requireNonNull(factory);
    }

    @Override
    public Optional<CreateSessionResponse> newSession(CreateSessionRequest sessionRequest) {
      Objects.requireNonNull(sessionRequest);

      if (running != null) {
        return Optional.empty();
      }
      Session session = factory.apply(sessionRequest.getCapabilities());
      running = session;
      return Optional.of(
          new CreateSessionResponse(
              session,
              CapabilityResponseEncoder.getEncoder(W3C).apply(session)));
    }

    @Override
    public HttpResponse executeWebDriverCommand(HttpRequest req) {
      throw new UnsupportedOperationException("executeWebDriverCommand");
    }

    @Override
    public Session getSession(SessionId id) throws NoSuchSessionException {
      if (running == null || !running.getId().equals(id)) {
        throw new NoSuchSessionException();
      }

      return running;
    }

    @Override
    public void stop(SessionId id) throws NoSuchSessionException {
      getSession(id);
      running = null;

      bus.fire(new SessionClosedEvent(id));
    }

    @Override
    protected boolean isSessionOwner(SessionId id) {
      return running != null && running.getId().equals(id);
    }

    @Override
    public boolean isSupporting(Capabilities capabilities) {
      return Objects.equals("cake", capabilities.getCapability("cheese"));
    }

    @Override
    public NodeStatus getStatus() {
      Set<NodeStatus.Active> actives = new HashSet<>();
      if (running != null) {
        actives.add(new NodeStatus.Active(CAPS, running.getId(), running.getCapabilities()));
      }

      return new NodeStatus(
          getId(),
          getUri(),
          1,
          ImmutableMap.of(CAPS, 1),
          actives,
          "cheese");
    }

    @Override
    public HealthCheck getHealthCheck() {
      return () -> new HealthCheck.Result(true, "tl;dr");
    }
  }

}
