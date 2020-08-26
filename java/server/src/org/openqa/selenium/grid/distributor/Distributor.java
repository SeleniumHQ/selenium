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
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.grid.data.CreateSessionRequest;
import org.openqa.selenium.grid.data.CreateSessionResponse;
import org.openqa.selenium.grid.data.DistributorStatus;
import org.openqa.selenium.grid.data.NodeId;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.distributor.model.Host;
import org.openqa.selenium.grid.distributor.selector.HostSelector;
import org.openqa.selenium.grid.node.Node;
import org.openqa.selenium.grid.sessionmap.SessionMap;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.NewSessionPayload;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.http.Routable;
import org.openqa.selenium.remote.http.Route;
import org.openqa.selenium.remote.tracing.AttributeKey;
import org.openqa.selenium.remote.tracing.EventAttribute;
import org.openqa.selenium.remote.tracing.EventAttributeValue;
import org.openqa.selenium.remote.tracing.Span;
import org.openqa.selenium.remote.tracing.SpanDecorator;
import org.openqa.selenium.remote.tracing.Status;
import org.openqa.selenium.remote.tracing.Tracer;
import org.openqa.selenium.status.HasReadyState;

import java.io.IOException;
import java.io.Reader;
import java.io.UncheckedIOException;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReadWriteLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;
import java.util.function.Predicate;
import java.util.function.Supplier;
import java.util.stream.Collectors;

import static com.google.common.collect.ImmutableSet.toImmutableSet;
import static org.openqa.selenium.grid.data.Availability.UP;
import static org.openqa.selenium.remote.RemoteTags.CAPABILITIES;
import static org.openqa.selenium.remote.RemoteTags.CAPABILITIES_EVENT;
import static org.openqa.selenium.remote.RemoteTags.SESSION_ID;
import static org.openqa.selenium.remote.RemoteTags.SESSION_ID_EVENT;
import static org.openqa.selenium.remote.http.Contents.bytes;
import static org.openqa.selenium.remote.http.Contents.reader;
import static org.openqa.selenium.remote.http.Route.delete;
import static org.openqa.selenium.remote.http.Route.get;
import static org.openqa.selenium.remote.http.Route.post;
import static org.openqa.selenium.remote.tracing.HttpTracing.newSpanAsChildOf;
import static org.openqa.selenium.remote.tracing.Tags.EXCEPTION;

/**
 * Responsible for being the central place where the {@link Node}s on which {@link Session}s run
 * are determined.
 * <p>
 * This class responds to the following URLs:
 * <table summary="HTTP commands the Distributor understands">
 * <tr>
 *   <th>Verb</th>
 *   <th>URL Template</th>
 *   <th>Meaning</th>
 * </tr>
 * <tr>
 *   <td>POST</td>
 *   <td>/session</td>
 *   <td>This is exactly the same as the New Session command from the WebDriver spec.</td>
 * </tr>
 * <tr>
 *   <td>POST</td>
 *   <td>/se/grid/distributor/node</td>
 *   <td>Adds a new {@link Node} to this distributor. Please read the javadocs for {@link Node} for
 *     how the Node should be serialized.</td>
 * </tr>
 * <tr>
 *   <td>DELETE</td>
 *   <td>/se/grid/distributor/node/{nodeId}</td>
 *   <td>Remove the {@link Node} identified by {@code nodeId} from this distributor. It is expected
 *     that any sessions running on the Node are allowed to complete: this simply means that no new
 *     sessions will be scheduled on this Node.</td>
 * </tr>
 * </table>
 */
public abstract class Distributor implements HasReadyState, Predicate<HttpRequest>, Routable {

  private final Route routes;
  protected final Tracer tracer;
  private final HostSelector hostSelector;
  private final SessionMap sessions;
  private final ReadWriteLock lock = new ReentrantReadWriteLock(true);

  protected Distributor(
    Tracer tracer,
    HttpClient.Factory httpClientFactory,
    HostSelector hostSelector,
    SessionMap sessions) {
    this.tracer = Require.nonNull("Tracer", tracer);
    Require.nonNull("HTTP client factory", httpClientFactory);
    this.hostSelector = Require.nonNull("Host selector", hostSelector);
    this.sessions = Require.nonNull("Session map", sessions);

    Json json = new Json();
    routes = Route.combine(
      post("/session").to(() -> req -> {
        CreateSessionResponse sessionResponse = newSession(req);
        return new HttpResponse().setContent(bytes(sessionResponse.getDownstreamEncodedResponse()));
      }),
      post("/se/grid/distributor/session")
          .to(() -> new CreateSession(this)),
      post("/se/grid/distributor/node")
          .to(() -> new AddNode(tracer, this, json, httpClientFactory)),
      post("/se/grid/distributor/node/{nodeId}/drain")
          .to((Map<String, String> params) -> new DrainNode(this, new NodeId(UUID.fromString(params.get("nodeId"))))),
      delete("/se/grid/distributor/node/{nodeId}")
          .to(params -> new RemoveNode(this, new NodeId(UUID.fromString(params.get("nodeId"))))),
      get("/se/grid/distributor/status")
          .to(() -> new GetDistributorStatus(this))
          .with(new SpanDecorator(tracer, req -> "distributor.status")));
  }

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
        // Find a host that supports the capabilities present in the new session
        ImmutableSet<Host> availableHosts = getModel().stream()
          .filter(host -> UP.equals(host.getHostStatus()))
          .collect(toImmutableSet());
        Optional<Host> selectedHost = hostSelector.selectHost(firstRequest.getCapabilities(), availableHosts);
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

  public abstract Distributor add(Node node);

  public abstract boolean drain(NodeId nodeId);

  public abstract void remove(NodeId nodeId);

  public abstract DistributorStatus getStatus();

  protected abstract Set<Host> getModel();

  @Override
  public boolean test(HttpRequest httpRequest) {
    return matches(httpRequest);
  }

  @Override
  public boolean matches(HttpRequest req) {
    return routes.matches(req);
  }

  @Override
  public HttpResponse execute(HttpRequest req) throws UncheckedIOException {
    return routes.execute(req);
  }
}
