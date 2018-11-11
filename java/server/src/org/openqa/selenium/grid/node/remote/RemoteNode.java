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

package org.openqa.selenium.grid.node.remote;

import static java.nio.charset.StandardCharsets.UTF_8;
import static org.openqa.selenium.remote.http.HttpMethod.DELETE;
import static org.openqa.selenium.remote.http.HttpMethod.GET;
import static org.openqa.selenium.remote.http.HttpMethod.POST;

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.NoSuchSessionException;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.node.Node;
import org.openqa.selenium.grid.node.NodeStatus;
import org.openqa.selenium.grid.web.Values;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.tracing.DistributedTracer;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.net.URI;
import java.util.Collection;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;

public class RemoteNode extends Node {

  public static final Json JSON = new Json();
  private final Function<HttpRequest, HttpResponse> client;
  private final URI externalUri;
  private final Set<Capabilities> capabilities;

  public RemoteNode(
      DistributedTracer tracer,
      UUID id,
      URI externalUri,
      Collection<Capabilities> capabilities,
      HttpClient client) {
    super(tracer, id);
    this.externalUri = Objects.requireNonNull(externalUri);
    this.capabilities = ImmutableSet.copyOf(capabilities);

    Objects.requireNonNull(client);
    this.client = req -> {
      try {
        return client.execute(req);
      } catch (IOException e) {
        throw new UncheckedIOException(e);
      }
    };
  }

  @Override
  public boolean isSupporting(Capabilities capabilities) {
    return this.capabilities.stream()
        .anyMatch(caps -> caps.getCapabilityNames().stream()
            .allMatch(name -> Objects.equals(
                caps.getCapability(name),
                capabilities.getCapability(name))));

  }

  @Override
  public Optional<Session> newSession(Capabilities capabilities) {
    Objects.requireNonNull(capabilities, "Capabilities for session are not set");

    HttpRequest req = new HttpRequest(POST, "/se/grid/node/session");
    req.setContent(JSON.toJson(capabilities).getBytes(UTF_8));

    HttpResponse res = client.apply(req);

    return Optional.ofNullable(Values.get(res, Session.class));
  }

  @Override
  protected boolean isSessionOwner(SessionId id) {
    Objects.requireNonNull(id, "Session ID has not been set");

    HttpRequest req = new HttpRequest(GET, "/se/grid/node/owner/" + id);

    HttpResponse res = client.apply(req);

    return Values.get(res, Boolean.class) == Boolean.TRUE;
  }

  @Override
  public Session getSession(SessionId id) throws NoSuchSessionException {
    Objects.requireNonNull(id, "Session ID has not been set");
    HttpRequest req = new HttpRequest(GET, "/se/grid/node/session/" + id);

    HttpResponse res = client.apply(req);

    return Values.get(res, Session.class);
  }

  @Override
  public void executeWebDriverCommand(HttpRequest req, HttpResponse resp) {
    HttpResponse fromUpstream = client.apply(req);

    resp.setStatus(fromUpstream.getStatus());
    for (String name : fromUpstream.getHeaderNames()) {
      for (String value : fromUpstream.getHeaders(name)) {
        resp.addHeader(name, value);
      }
    }
    resp.setContent(fromUpstream.getContent());
  }

  @Override
  public void stop(SessionId id) throws NoSuchSessionException {
    Objects.requireNonNull(id, "Session ID has not been set");
    HttpRequest req = new HttpRequest(DELETE, "/se/grid/node/session/" + id);

    HttpResponse res = client.apply(req);

    Values.get(res, Void.class);
  }

  @Override
  public NodeStatus getStatus() {
    HttpRequest req = new HttpRequest(GET, "/status");

    HttpResponse res = client.apply(req);

    return Values.get(res, NodeStatus.class);
  }

  private Map<String, Object> toJson() {
    return ImmutableMap.of(
        "id", getId(),
        "uri", externalUri,
        "capabilities", capabilities);
  }

}
