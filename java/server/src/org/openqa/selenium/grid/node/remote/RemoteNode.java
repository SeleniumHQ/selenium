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

import static java.net.HttpURLConnection.HTTP_OK;
import static org.openqa.selenium.grid.data.Availability.DOWN;
import static org.openqa.selenium.grid.data.Availability.DRAINING;
import static org.openqa.selenium.grid.data.Availability.UP;
import static org.openqa.selenium.net.Urls.fromUri;
import static org.openqa.selenium.remote.http.Contents.asJson;
import static org.openqa.selenium.remote.http.Contents.reader;
import static org.openqa.selenium.remote.http.HttpMethod.DELETE;
import static org.openqa.selenium.remote.http.HttpMethod.GET;
import static org.openqa.selenium.remote.http.HttpMethod.POST;

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.NoSuchSessionException;
import org.openqa.selenium.RetrySessionRequestException;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.grid.data.CreateSessionRequest;
import org.openqa.selenium.grid.data.CreateSessionResponse;
import org.openqa.selenium.grid.data.NodeId;
import org.openqa.selenium.grid.data.NodeStatus;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.node.HealthCheck;
import org.openqa.selenium.grid.node.Node;
import org.openqa.selenium.grid.security.AddSecretFilter;
import org.openqa.selenium.grid.security.Secret;
import org.openqa.selenium.grid.web.Values;
import org.openqa.selenium.internal.Either;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.json.JsonInput;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.Filter;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.tracing.HttpTracing;
import org.openqa.selenium.remote.tracing.Tracer;

import java.io.IOException;
import java.io.Reader;
import java.io.UncheckedIOException;
import java.net.URI;
import java.util.Collection;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;

public class RemoteNode extends Node {

  public static final Json JSON = new Json();
  private final HttpHandler client;
  private final URI externalUri;
  private final Set<Capabilities> capabilities;
  private final HealthCheck healthCheck;
  private final Filter addSecret;

  public RemoteNode(
      Tracer tracer,
      HttpClient.Factory clientFactory,
      NodeId id,
      URI externalUri,
      Secret registrationSecret,
      Collection<Capabilities> capabilities) {
    super(tracer, id, externalUri, registrationSecret);
    this.externalUri = Require.nonNull("External URI", externalUri);
    this.capabilities = ImmutableSet.copyOf(capabilities);

    this.client = Require.nonNull("HTTP client factory", clientFactory).createClient(fromUri(externalUri));

    this.healthCheck = new RemoteCheck();

    Require.nonNull("Registration secret", registrationSecret);
    this.addSecret = new AddSecretFilter(registrationSecret);
  }

  @Override
  public boolean isReady() {
    try {
      return client.execute(new HttpRequest(GET, "/readyz")).isSuccessful();
    } catch (Exception e) {
      return false;
    }
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
  public Either<WebDriverException, CreateSessionResponse> newSession(
    CreateSessionRequest sessionRequest) {
    Require.nonNull("Capabilities for session", sessionRequest);

    HttpRequest req = new HttpRequest(POST, "/se/grid/node/session");
    HttpTracing.inject(tracer, tracer.getCurrentContext(), req);
    req.setContent(asJson(sessionRequest));

    HttpResponse httpResponse = client.with(addSecret).execute(req);

    Optional<Map<String, Object>> maybeResponse =
      Optional.ofNullable(Values.get(httpResponse, Map.class));

    if (maybeResponse.isPresent()) {
      Map<String, Object> response = maybeResponse.get();

      if (response.containsKey("sessionResponse")) {
        String rawResponse = JSON.toJson(response.get("sessionResponse"));
        CreateSessionResponse sessionResponse = JSON.toType(rawResponse, CreateSessionResponse.class);
        return Either.right(sessionResponse);
      } else {
        String rawException = JSON.toJson(response.get("exception"));
        Map<String, Object> exception = JSON.toType(rawException, Map.class);
        String errorType = (String) exception.get("error");
        String errorMessage = (String) exception.get("message");

        if (RetrySessionRequestException.class.getName().contentEquals(errorType)) {
          return Either.left(new RetrySessionRequestException(errorMessage));
        } else {
          return Either.left(new SessionNotCreatedException(errorMessage));
        }
      }
    }

    return Either.left(new SessionNotCreatedException("Error while mapping response from Node"));
  }

  @Override
  public boolean isSessionOwner(SessionId id) {
    Require.nonNull("Session ID", id);

    HttpRequest req = new HttpRequest(GET, "/se/grid/node/owner/" + id);
    HttpTracing.inject(tracer, tracer.getCurrentContext(), req);

    HttpResponse res = client.with(addSecret).execute(req);

    return Boolean.TRUE.equals(Values.get(res, Boolean.class));
  }

  @Override
  public Session getSession(SessionId id) throws NoSuchSessionException {
    Require.nonNull("Session ID", id);

    HttpRequest req = new HttpRequest(GET, "/se/grid/node/session/" + id);
    HttpTracing.inject(tracer, tracer.getCurrentContext(), req);

    HttpResponse res = client.with(addSecret).execute(req);

    return Values.get(res, Session.class);
  }

  @Override
  public HttpResponse executeWebDriverCommand(HttpRequest req) {
    return client.execute(req);
  }

  @Override
  public HttpResponse uploadFile(HttpRequest req, SessionId id) {
    return client.execute(req);
  }

  @Override
  public void stop(SessionId id) throws NoSuchSessionException {
    Require.nonNull("Session ID", id);
    HttpRequest req = new HttpRequest(DELETE, "/se/grid/node/session/" + id);
    HttpTracing.inject(tracer, tracer.getCurrentContext(), req);

    HttpResponse res = client.with(addSecret).execute(req);

    Values.get(res, Void.class);
  }

  @Override
  public NodeStatus getStatus() {
    HttpRequest req = new HttpRequest(GET, "/status");
    HttpTracing.inject(tracer, tracer.getCurrentContext(), req);

    HttpResponse res = client.execute(req);

    try (Reader reader = reader(res);
         JsonInput in = JSON.newInput(reader)) {
      in.beginObject();

      // Skip everything until we find "value"
      while (in.hasNext()) {
        if ("value".equals(in.nextName())) {
          in.beginObject();

          while (in.hasNext()) {
            if ("node".equals(in.nextName())) {
              return in.read(NodeStatus.class);
            } else {
              in.skipValue();
            }
          }

          in.endObject();
        } else {
          in.skipValue();
        }
      }
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }

    throw new IllegalStateException("Unable to read status");
  }

  @Override
  public HealthCheck getHealthCheck() {
    return healthCheck;
  }

  @Override
  public void drain() {
    HttpRequest req = new HttpRequest(POST, "/se/grid/node/drain");
    HttpTracing.inject(tracer, tracer.getCurrentContext(), req);

    HttpResponse res = client.with(addSecret).execute(req);

    if(res.getStatus() == HTTP_OK) {
      draining = true;
    }
  }

  private Map<String, Object> toJson() {
    return ImmutableMap.of(
        "id", getId(),
        "uri", externalUri,
        "capabilities", capabilities);
  }

  private class RemoteCheck implements HealthCheck {
    @Override
    public Result check() {
      try {
        NodeStatus status = getStatus();

        switch (status.getAvailability()) {
          case DOWN:
            return new Result(DOWN, externalUri + " is down");

          case DRAINING:
            return new Result(DRAINING, externalUri + " is draining");

          case UP:
            return new Result(UP, externalUri + " is ok");

          default:
            throw new IllegalStateException("Unknown node availability: " + status.getAvailability());
        }
      } catch (RuntimeException e) {
        return new Result(
            DOWN,
            "Unable to determine node status: " + e.getMessage());
      }
    }
  }
}
