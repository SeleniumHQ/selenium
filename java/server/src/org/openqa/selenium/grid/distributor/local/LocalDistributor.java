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

package org.openqa.selenium.grid.distributor.local;

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;
import org.openqa.selenium.Beta;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.events.EventBus;
import org.openqa.selenium.grid.config.Config;
import org.openqa.selenium.grid.data.CreateSessionRequest;
import org.openqa.selenium.grid.data.CreateSessionResponse;
import org.openqa.selenium.grid.data.DistributorStatus;
import org.openqa.selenium.grid.data.NodeRejectedEvent;
import org.openqa.selenium.grid.data.NodeStatus;
import org.openqa.selenium.grid.distributor.Distributor;
import org.openqa.selenium.grid.distributor.model.NodeSelector;
import org.openqa.selenium.grid.log.LoggingOptions;
import org.openqa.selenium.grid.node.Node;
import org.openqa.selenium.grid.server.BaseServerOptions;
import org.openqa.selenium.grid.server.EventBusOptions;
import org.openqa.selenium.grid.server.NetworkOptions;
import org.openqa.selenium.grid.sessionmap.SessionMap;
import org.openqa.selenium.grid.sessionmap.config.SessionMapOptions;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.NewSessionPayload;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.tracing.EventAttribute;
import org.openqa.selenium.remote.tracing.EventAttributeValue;
import org.openqa.selenium.remote.tracing.Span;
import org.openqa.selenium.remote.tracing.Status;
import org.openqa.selenium.remote.tracing.Tracer;
import org.openqa.selenium.status.HasReadyState;

import java.io.IOException;
import java.io.Reader;
import java.util.*;
import java.util.function.Supplier;
import java.util.logging.Logger;
import java.util.stream.Collectors;

import static org.openqa.selenium.grid.data.NodeDrainComplete.NODE_DRAIN_COMPLETE;
import static org.openqa.selenium.grid.data.NodeStatusEvent.NODE_STATUS;
import static org.openqa.selenium.remote.RemoteTags.CAPABILITIES;
import static org.openqa.selenium.remote.RemoteTags.SESSION_ID;
import static org.openqa.selenium.remote.http.Contents.reader;
import static org.openqa.selenium.remote.tracing.HttpTracing.newSpanAsChildOf;

public class LocalDistributor extends Distributor {

  private static final Logger LOG = Logger.getLogger("Selenium Distributor (Local)");
  private final Tracer tracer;
  private final EventBus bus;
  private final HttpClient.Factory clientFactory;
  private final SessionMap sessions;
  private final String registrationSecret;
  private final NodeSelector nodeSelector;

  public LocalDistributor(
      Tracer tracer,
      EventBus bus,
      HttpClient.Factory clientFactory,
      SessionMap sessions,
      String registrationSecret) {
    super(tracer, clientFactory);
    this.tracer = Require.nonNull("Tracer", tracer);
    this.bus = Require.nonNull("Event bus", bus);
    this.clientFactory = Require.nonNull("HTTP client factory", clientFactory);
    this.sessions = Require.nonNull("Session map", sessions);
    this.registrationSecret = registrationSecret;
    this.nodeSelector = new NodeSelector(this.bus);

    bus.addListener(NODE_STATUS, event -> refresh(event.getData(NodeStatus.class)));
    bus.addListener(NODE_DRAIN_COMPLETE, event -> remove(event.getData(UUID.class)));
  }

  public static Distributor create(Config config) {
    Tracer tracer = new LoggingOptions(config).getTracer();
    EventBus bus = new EventBusOptions(config).getEventBus();
    HttpClient.Factory clientFactory = new NetworkOptions(config).getHttpClientFactory(tracer);
    SessionMap sessions = new SessionMapOptions(config).getSessionMap();
    BaseServerOptions serverOptions = new BaseServerOptions(config);

    return new LocalDistributor(tracer, bus, clientFactory, sessions, serverOptions.getRegistrationSecret());
  }

  @Override
  public boolean isReady() {
    try {
      return ImmutableSet.of(bus, sessions).parallelStream()
        .map(HasReadyState::isReady)
        .reduce(true, Boolean::logicalAnd);
    } catch (RuntimeException e) {
      return false;
    }
  }

  @Override
  public CreateSessionResponse newSession(HttpRequest request)
      throws SessionNotCreatedException {

    Span span = newSpanAsChildOf(tracer, request, "distributor.new_session");
    try (
      Reader reader = reader(request);
      NewSessionPayload payload = NewSessionPayload.create(reader)) {
      Objects.requireNonNull(payload, "Requests to process must be set.");

      Iterator<Capabilities> iterator = payload.stream().iterator();

      if (!iterator.hasNext()) {
        span.addEvent("No capabilities found");
        throw new SessionNotCreatedException("No capabilities found");
      }

      Optional<Supplier<CreateSessionResponse>> selected;
      CreateSessionRequest firstRequest = new CreateSessionRequest(
          payload.getDownstreamDialects(),
          iterator.next(),
          ImmutableMap.of("span", span));

      selected = nodeSelector.selectNode(firstRequest);

      CreateSessionResponse sessionResponse = selected
          .orElseThrow(
              () -> {
                span.setAttribute("error", true);
                return new SessionNotCreatedException(
                  "Unable to find provider for session: " + payload.stream()
                    .map(Capabilities::toString)
                    .collect(Collectors.joining(", ")));
              })
          .get();

      sessions.add(sessionResponse.getSession());

      SESSION_ID.accept(span, sessionResponse.getSession().getId());
      CAPABILITIES.accept(span, sessionResponse.getSession().getCapabilities());
      span.setAttribute("session.url", sessionResponse.getSession().getUri().toString());

      return sessionResponse;
    } catch (SessionNotCreatedException e) {
      span.setAttribute("error", true);
      span.setStatus(Status.ABORTED);
      Map<String, EventAttributeValue> attributeValueMap = new HashMap<>();
      attributeValueMap.put("Error Message", EventAttribute.setValue(e.getMessage()));
      span.addEvent("Session not created", attributeValueMap);
      throw e;
    } catch (IOException e) {
      span.setAttribute("error", true);
      span.setStatus(Status.UNKNOWN);
      Map<String, EventAttributeValue> attributeValueMap = new HashMap<>();
      attributeValueMap.put("Error Message", EventAttribute.setValue(e.getMessage()));
      span.addEvent("Unknown error in LocalDistributor while creating session", attributeValueMap);
      throw new SessionNotCreatedException(e.getMessage(), e);
    } finally {
      span.close();
    }
  }

  private void refresh(NodeStatus status) {
    Require.nonNull("Node status", status);

    LOG.fine("Refreshing: " + status.getUri());

    // check registrationSecret and stop processing if it doesn't match
    if (!Objects.equals(status.getRegistrationSecret(), registrationSecret)) {
      LOG.severe(String.format("Node at %s failed to send correct registration secret. Node NOT registered.", status.getUri()));
      bus.fire(new NodeRejectedEvent(status.getUri()));
      return;
    }

    nodeSelector.refresh(status, tracer, clientFactory);
  }

  @Override
  public LocalDistributor add(Node node) {
    return add(node, node.getStatus());
  }

  private LocalDistributor add(Node node, NodeStatus status) {
    nodeSelector.addNode(node, status);
    return this;
  }

  @Override
  public void remove(UUID nodeId) {
    nodeSelector.removeNode(nodeId);
  }

  @Override
  public DistributorStatus getStatus() {
    return nodeSelector.getStatus();
  }

  @Beta
  public void refresh() {
    nodeSelector.refresh();
  }
}
