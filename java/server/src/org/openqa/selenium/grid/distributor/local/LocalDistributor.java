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
import org.openqa.selenium.concurrent.Regularly;
import org.openqa.selenium.events.EventBus;
import org.openqa.selenium.grid.config.Config;
import org.openqa.selenium.grid.data.CreateSessionRequest;
import org.openqa.selenium.grid.data.CreateSessionResponse;
import org.openqa.selenium.grid.data.DistributorStatus;
import org.openqa.selenium.grid.data.NewSessionErrorResponse;
import org.openqa.selenium.grid.data.NewSessionRejectedEvent;
import org.openqa.selenium.grid.data.NewSessionResponse;
import org.openqa.selenium.grid.data.NewSessionResponseEvent;
import org.openqa.selenium.grid.data.NodeAddedEvent;
import org.openqa.selenium.grid.data.NodeRejectedEvent;
import org.openqa.selenium.grid.data.NodeRemovedEvent;
import org.openqa.selenium.grid.data.NodeStatus;
import org.openqa.selenium.grid.distributor.Distributor;
import org.openqa.selenium.grid.distributor.model.Host;
import org.openqa.selenium.grid.distributor.selector.HostSelector;
import org.openqa.selenium.grid.log.LoggingOptions;
import org.openqa.selenium.grid.node.Node;
import org.openqa.selenium.grid.node.remote.RemoteNode;
import org.openqa.selenium.grid.server.BaseServerOptions;
import org.openqa.selenium.grid.server.EventBusOptions;
import org.openqa.selenium.grid.server.NetworkOptions;
import org.openqa.selenium.grid.sessionmap.SessionMap;
import org.openqa.selenium.grid.sessionmap.config.SessionMapOptions;
import org.openqa.selenium.grid.sessionqueue.SessionRequestQueue;
import org.openqa.selenium.grid.sessionqueue.local.LocalSessionRequestQueue;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.json.JsonOutput;
import org.openqa.selenium.remote.NewSessionPayload;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.tracing.AttributeKey;
import org.openqa.selenium.remote.tracing.EventAttribute;
import org.openqa.selenium.remote.tracing.EventAttributeValue;
import org.openqa.selenium.remote.tracing.Span;
import org.openqa.selenium.remote.tracing.Status;
import org.openqa.selenium.remote.tracing.Tracer;
import org.openqa.selenium.status.HasReadyState;

import java.io.IOException;
import java.io.Reader;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReadWriteLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;
import java.util.function.Supplier;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.stream.Collectors;

import static com.google.common.collect.ImmutableSet.toImmutableSet;
import static org.openqa.selenium.grid.data.NodeDrainComplete.NODE_DRAIN_COMPLETE;
import static org.openqa.selenium.grid.data.NodeStatusEvent.NODE_STATUS;
import static org.openqa.selenium.grid.data.NewSessionRequestEvent.NEW_SESSION_REQUEST;
import static org.openqa.selenium.remote.RemoteTags.CAPABILITIES;
import static org.openqa.selenium.remote.RemoteTags.CAPABILITIES_EVENT;
import static org.openqa.selenium.remote.RemoteTags.SESSION_ID;
import static org.openqa.selenium.remote.RemoteTags.SESSION_ID_EVENT;
import static org.openqa.selenium.remote.http.Contents.reader;
import static org.openqa.selenium.remote.tracing.HttpTracing.newSpanAsChildOf;
import static org.openqa.selenium.remote.tracing.Tags.EXCEPTION;

public class LocalDistributor extends Distributor {

  private static final Json JSON = new Json();
  private static final Logger LOG = Logger.getLogger("Selenium Distributor (Local)");
  private final ReadWriteLock lock = new ReentrantReadWriteLock(/* fair */ true);
  private final Set<Host> hosts = new HashSet<>();
  private final Tracer tracer;
  private final EventBus bus;
  private final HttpClient.Factory clientFactory;
  private final SessionMap sessions;
  private final Regularly hostChecker = new Regularly("distributor host checker");
  private final Map<UUID, Collection<Runnable>> allChecks = new ConcurrentHashMap<>();
  private final String registrationSecret;
  private final SessionRequestQueue sessionRequests;

  public LocalDistributor(
      Tracer tracer,
      EventBus bus,
      HttpClient.Factory clientFactory,
      SessionMap sessions,
      SessionRequestQueue sessionRequests,
      String registrationSecret) {
    super(tracer, clientFactory);
    this.tracer = Require.nonNull("Tracer", tracer);
    this.bus = Require.nonNull("Event bus", bus);
    this.clientFactory = Require.nonNull("HTTP client factory", clientFactory);
    this.sessions = Require.nonNull("Session map", sessions);
    this.sessionRequests = Require.nonNull("New Session Request Queue", sessionRequests);
    this.registrationSecret = registrationSecret;

    bus.addListener(NODE_STATUS, event -> refresh(event.getData(NodeStatus.class)));
    bus.addListener(NODE_DRAIN_COMPLETE, event -> remove(event.getData(UUID.class)));
    bus.addListener(NEW_SESSION_REQUEST, event -> {
      CreateSessionRequest sessionRequest = this.sessionRequests.poll();
      UUID reqId = event.getData(UUID.class);
      if (sessionRequest != null) {
        try {
          CreateSessionResponse sessionResponse = newSessionFromQueue(sessionRequest);
          NewSessionResponse
              newSessionResponse =
              new NewSessionResponse(sessionResponse.getSession(),
                                     sessionResponse.getDownstreamEncodedResponse(), reqId);
          bus.fire(new NewSessionResponseEvent(newSessionResponse));
        } catch (SessionNotCreatedException e) {
          if (e.getMessage().startsWith("Unable to find provider")) {
            if (!this.sessionRequests.offerFirst(sessionRequest, reqId)) {
              bus.fire(
                  new NewSessionRejectedEvent(new NewSessionErrorResponse(e.getMessage(), reqId)));
            }
          } else {
            bus.fire(
                new NewSessionRejectedEvent(new NewSessionErrorResponse(e.getMessage(), reqId)));
          }
        }
      }
    });
  }

  public static Distributor create(Config config) {
    Tracer tracer = new LoggingOptions(config).getTracer();
    EventBus bus = new EventBusOptions(config).getEventBus();
    HttpClient.Factory clientFactory = new NetworkOptions(config).getHttpClientFactory(tracer);
    SessionMap sessions = new SessionMapOptions(config).getSessionMap();
    SessionRequestQueue sessionRequests = LocalSessionRequestQueue.create(config);
    BaseServerOptions serverOptions = new BaseServerOptions(config);

    return new LocalDistributor(tracer, bus, clientFactory, sessions, sessionRequests, serverOptions.getRegistrationSecret());
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

  public CreateSessionResponse newSessionFromQueue(CreateSessionRequest request)
  {
    Span span = tracer.getCurrentContext().createSpan("distributor.new_session");
    Map<String, EventAttributeValue> attributeMap = new HashMap<>();

    try {
      Optional<Supplier<CreateSessionResponse>> selected;
      boolean hasCapabilities;
      Lock writeLock = this.lock.writeLock();
      writeLock.lock();
      try {
        HostSelector hostSelector = new HostSelector();
        hasCapabilities = hostSelector.supportsCapability(request.getCapabilities(), this.hosts);
        if (!hasCapabilities) {
          throw new SessionNotCreatedException(
              "No host supports the capabilities required: " + request.getCapabilities()
                  .toString());
        }
        // Find a host that supports the capabilities present in the new session
        Optional<Host>
            selectedHost =
            hostSelector.selectHost(request.getCapabilities(), this.hosts);
        // Reserve some space for this session
        selected = selectedHost.map(host -> host.reserve(request));
      } finally {
        writeLock.unlock();
      }

      CreateSessionResponse sessionResponse = selected
          .orElseThrow(
              () -> {
                throw new SessionNotCreatedException(
                    "Unable to find provider for session: " + request.getCapabilities().toString());
              })
          .get();

      sessions.add(sessionResponse.getSession());

      SessionId sessionId = sessionResponse.getSession().getId();
      Capabilities caps = sessionResponse.getSession().getCapabilities();
      String sessionUri = sessionResponse.getSession().getUri().toString();
      SESSION_ID.accept(span, sessionId);
      CAPABILITIES.accept(span, caps);
      SESSION_ID_EVENT.accept(attributeMap, sessionId);
      CAPABILITIES_EVENT.accept(attributeMap, caps);
      span.setAttribute(AttributeKey.SESSION_URI.getKey(), sessionUri);
      attributeMap.put(AttributeKey.SESSION_URI.getKey(), EventAttribute.setValue(sessionUri));

      span.addEvent("Session created by the distributor", attributeMap);
      return sessionResponse;
    } catch (SessionNotCreatedException e) {
      span.setAttribute("error", true);
      span.setStatus(Status.ABORTED);

      EXCEPTION.accept(attributeMap, e);
      attributeMap.put(AttributeKey.EXCEPTION_MESSAGE.getKey(),
                       EventAttribute.setValue("Unable to create session: " + e.getMessage()));
      span.addEvent(AttributeKey.EXCEPTION_EVENT.getKey(), attributeMap);
      throw e;
    } finally {
      span.close();
    }
  }

  @Override
  public CreateSessionResponse newSession(HttpRequest request)
      throws SessionNotCreatedException {

    Span span = newSpanAsChildOf(tracer, request, "distributor.new_session");
    Map<String, EventAttributeValue> attributeMap = new HashMap<>();
    try (
      Reader reader = reader(request);
      NewSessionPayload payload = NewSessionPayload.create(reader)) {
      Objects.requireNonNull(payload, "Requests to process must be set.");

      attributeMap.put(AttributeKey.LOGGER_CLASS.getKey(),
                       EventAttribute.setValue(getClass().getName()));

      Iterator<Capabilities> iterator = payload.stream().iterator();
      attributeMap.put("request.payload", EventAttribute.setValue(payload.toString()));

      if (!iterator.hasNext()) {
        SessionNotCreatedException exception = new SessionNotCreatedException("No capabilities found");
        EXCEPTION.accept(attributeMap, exception);
        attributeMap.put(AttributeKey.EXCEPTION_MESSAGE.getKey(),
                         EventAttribute.setValue("Unable to create session. No capabilities found: "
                                                 + exception.getMessage()));
        span.addEvent(AttributeKey.EXCEPTION_EVENT.getKey(), attributeMap);
        throw exception;
      }

      Optional<Supplier<CreateSessionResponse>> selected;
      CreateSessionRequest firstRequest = new CreateSessionRequest(
          payload.getDownstreamDialects(),
          iterator.next(),
          ImmutableMap.of("span", span));

      Lock writeLock = this.lock.writeLock();
      writeLock.lock();
      try {
        HostSelector hostSelector = new HostSelector();
        // Find a host that supports the capabilities present in the new session
        Optional<Host> selectedHost = hostSelector.selectHost(firstRequest.getCapabilities(), this.hosts);
        // Reserve some space for this session
        selected = selectedHost.map(host -> host.reserve(firstRequest));
      } finally {
        writeLock.unlock();
      }

      CreateSessionResponse sessionResponse = selected
          .orElseThrow(
              () -> {
                span.setAttribute("error", true);
                SessionNotCreatedException
                    exception =
                    new SessionNotCreatedException(
                        "Unable to find provider for session: " + payload.stream()
                            .map(Capabilities::toString).collect(Collectors.joining(", ")));
                EXCEPTION.accept(attributeMap, exception);
                attributeMap.put(AttributeKey.EXCEPTION_MESSAGE.getKey(),
                                 EventAttribute.setValue(
                                     "Unable to find provider for session: "
                                     + exception.getMessage()));
                span.addEvent(AttributeKey.EXCEPTION_EVENT.getKey(), attributeMap);
                return exception;
              })
          .get();

      sessions.add(sessionResponse.getSession());

      SessionId sessionId = sessionResponse.getSession().getId();
      Capabilities caps = sessionResponse.getSession().getCapabilities();
      String sessionUri = sessionResponse.getSession().getUri().toString();
      SESSION_ID.accept(span, sessionId);
      CAPABILITIES.accept(span, caps);
      SESSION_ID_EVENT.accept(attributeMap, sessionId);
      CAPABILITIES_EVENT.accept(attributeMap, caps);
      span.setAttribute(AttributeKey.SESSION_URI.getKey(), sessionUri);
      attributeMap.put(AttributeKey.SESSION_URI.getKey(), EventAttribute.setValue(sessionUri));

      span.addEvent("Session created by the distributor", attributeMap);
      return sessionResponse;
    } catch (SessionNotCreatedException e) {
      span.setAttribute("error", true);
      span.setStatus(Status.ABORTED);

      EXCEPTION.accept(attributeMap, e);
      attributeMap.put(AttributeKey.EXCEPTION_MESSAGE.getKey(),
                       EventAttribute.setValue("Unable to create session: " + e.getMessage()));
      span.addEvent(AttributeKey.EXCEPTION_EVENT.getKey(), attributeMap);

      throw e;
    } catch (IOException e) {
      span.setAttribute("error", true);
      span.setStatus(Status.UNKNOWN);

      EXCEPTION.accept(attributeMap, e);
      attributeMap.put(AttributeKey.EXCEPTION_MESSAGE.getKey(),
                       EventAttribute.setValue("Unknown error in LocalDistributor while creating session: " + e.getMessage()));
      span.addEvent(AttributeKey.EXCEPTION_EVENT.getKey(), attributeMap);

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

    // Iterate over the available nodes to find a match.
    Lock writeLock = lock.writeLock();
    writeLock.lock();
    try {
      Optional<Host> existingByNodeId = hosts.stream()
          .filter(host -> host.getId().equals(status.getNodeId()))
          .findFirst();

      if (existingByNodeId.isPresent()) {
        // Modify the state
        LOG.fine("Modifying existing state");
        existingByNodeId.get().update(status);
      } else {
        Optional<Host> existingByUri = hosts.stream()
          .filter(host -> host.asSummary().getUri().equals(status.getUri()))
          .findFirst();
        // There is a URI match, probably means a node was restarted. We need to remove
        // the previous one so we add the new request.
        existingByUri.ifPresent(host -> {
          LOG.fine("Removing old node, a new one is registering with the same URI");
          remove(host.getId());
        });

        // Add a new host.
        LOG.info("Creating a new remote node for " + status.getUri());
        Node node = new RemoteNode(
            tracer,
            clientFactory,
            status.getNodeId(),
            status.getUri(),
            status.getStereotypes().keySet());
        add(node, status);
      }
    } finally {
      writeLock.unlock();
    }
  }

  @Override
  public LocalDistributor add(Node node) {
    return add(node, node.getStatus());
  }

  private LocalDistributor add(Node node, NodeStatus status) {
    StringBuilder sb = new StringBuilder();

    Lock writeLock = this.lock.writeLock();
    writeLock.lock();
    try (JsonOutput out = JSON.newOutput(sb)) {
      out.setPrettyPrint(false).write(node);

      Host host = new Host(bus, node);
      host.update(status);

      LOG.fine("Adding host: " + host.asSummary());
      hosts.add(host);

      LOG.info(String.format("Added node %s.", node.getId()));
      host.runHealthCheck();

      Runnable runnable = host::runHealthCheck;
      Collection<Runnable> nodeRunnables = allChecks.getOrDefault(node.getId(), new ArrayList<>());
      nodeRunnables.add(runnable);
      allChecks.put(node.getId(), nodeRunnables);
      hostChecker.submit(runnable, Duration.ofMinutes(5), Duration.ofSeconds(30));
    } catch (Throwable t) {
      LOG.log(Level.WARNING, "Unable to process host", t);
    } finally {
      writeLock.unlock();
      bus.fire(new NodeAddedEvent(node.getId()));
    }

    return this;
  }

  @Override
  public void remove(UUID nodeId) {
    Lock writeLock = lock.writeLock();
    writeLock.lock();
    try {
      hosts.removeIf(host -> nodeId.equals(host.getId()));
      allChecks.getOrDefault(nodeId, new ArrayList<>()).forEach(hostChecker::remove);
    } finally {
      writeLock.unlock();
      bus.fire(new NodeRemovedEvent(nodeId));
    }
  }

  @Override
  public DistributorStatus getStatus() {
    Lock readLock = this.lock.readLock();
    readLock.lock();
    try {
      ImmutableSet<DistributorStatus.NodeSummary> summaries = this.hosts.stream()
          .map(Host::asSummary)
          .collect(toImmutableSet());

      return new DistributorStatus(summaries);
    } finally {
      readLock.unlock();
    }
  }

  @Beta
  public void refresh() {
    Lock writeLock = lock.writeLock();
    writeLock.lock();
    try {
      hosts.forEach(Host::runHealthCheck);
    } finally {
      writeLock.unlock();
    }
  }
}
