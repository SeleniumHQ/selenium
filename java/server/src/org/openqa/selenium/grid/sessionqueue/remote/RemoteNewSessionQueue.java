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

package org.openqa.selenium.grid.sessionqueue.remote;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.grid.config.Config;
import org.openqa.selenium.grid.data.CreateSessionResponse;
import org.openqa.selenium.grid.data.RequestId;
import org.openqa.selenium.grid.data.SessionRequestCapability;
import org.openqa.selenium.grid.log.LoggingOptions;
import org.openqa.selenium.grid.security.AddSecretFilter;
import org.openqa.selenium.grid.security.Secret;
import org.openqa.selenium.grid.security.SecretOptions;
import org.openqa.selenium.grid.server.NetworkOptions;
import org.openqa.selenium.grid.sessionqueue.NewSessionQueue;
import org.openqa.selenium.grid.data.SessionRequest;
import org.openqa.selenium.grid.sessionqueue.config.NewSessionQueueOptions;
import org.openqa.selenium.grid.web.Values;
import org.openqa.selenium.internal.Either;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.json.TypeToken;
import org.openqa.selenium.remote.http.Contents;
import org.openqa.selenium.remote.http.Filter;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.tracing.HttpTracing;
import org.openqa.selenium.remote.tracing.Tracer;

import java.io.UncheckedIOException;
import java.lang.reflect.Type;
import java.net.MalformedURLException;
import java.net.URI;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.openqa.selenium.remote.http.HttpMethod.DELETE;
import static org.openqa.selenium.remote.http.HttpMethod.GET;
import static org.openqa.selenium.remote.http.HttpMethod.POST;

public class RemoteNewSessionQueue extends NewSessionQueue {

  private static final Type QUEUE_CONTENTS_TYPE = new TypeToken<List<SessionRequestCapability>>() {}.getType();
  private static final Json JSON = new Json();
  private final HttpClient client;
  private final Filter addSecret;

  public RemoteNewSessionQueue(Tracer tracer, HttpClient client, Secret registrationSecret) {
    super(tracer, registrationSecret);
    this.client = Require.nonNull("HTTP client", client);

    Require.nonNull("Registration secret", registrationSecret);
    this.addSecret = new AddSecretFilter(registrationSecret);
  }

  public static NewSessionQueue create(Config config) {
    Tracer tracer = new LoggingOptions(config).getTracer();
    URI uri = new NewSessionQueueOptions(config).getSessionQueueUri();
    HttpClient.Factory clientFactory = new NetworkOptions(config).getHttpClientFactory(tracer);

    SecretOptions secretOptions = new SecretOptions(config);
    Secret registrationSecret = secretOptions.getRegistrationSecret();

    try {
      return new RemoteNewSessionQueue(
        tracer,
        clientFactory.createClient(uri.toURL()),
        registrationSecret);
    } catch (MalformedURLException e) {
      throw new UncheckedIOException(e);
    }
  }

  @Override
  public HttpResponse addToQueue(SessionRequest request) {
    HttpRequest upstream = new HttpRequest(POST, "/se/grid/newsessionqueue/session");
    HttpTracing.inject(tracer, tracer.getCurrentContext(), upstream);
    upstream.setContent(Contents.asJson(request));
    return client.with(addSecret).execute(upstream);
  }

  @Override
  public boolean retryAddToQueue(SessionRequest request) {
    Require.nonNull("Session request", request);

    HttpRequest upstream =
      new HttpRequest(POST, String.format("/se/grid/newsessionqueue/session/%s/retry", request.getRequestId()));
    HttpTracing.inject(tracer, tracer.getCurrentContext(), upstream);
    upstream.setContent(Contents.asJson(request));
    HttpResponse response = client.with(addSecret).execute(upstream);
    return Values.get(response, Boolean.class);
  }

  @Override
  public Optional<SessionRequest> remove(RequestId reqId) {
    HttpRequest upstream = new HttpRequest(POST, "/se/grid/newsessionqueue/session/" + reqId);
    HttpTracing.inject(tracer, tracer.getCurrentContext(), upstream);
    HttpResponse response = client.with(addSecret).execute(upstream);

    if (response.isSuccessful()) {
      // TODO: This should work cleanly with just a TypeToken of <Optional<SessionRequest>>
      String rawValue = Contents.string(response);
      if (rawValue == null || rawValue.trim().isEmpty()) {
        return Optional.empty();
      }
      return Optional.of(JSON.toType(rawValue, SessionRequest.class));
    }

    return Optional.empty();
  }

  @Override
  public Optional<SessionRequest> getNextAvailable(Set<Capabilities> stereotypes) {
    Require.nonNull("Stereotypes", stereotypes);

    HttpRequest upstream = new HttpRequest(POST, "/se/grid/newsessionqueue/session/next")
      .setContent(Contents.asJson(stereotypes));
    HttpTracing.inject(tracer, tracer.getCurrentContext(), upstream);
    HttpResponse response = client.with(addSecret).execute(upstream);

    SessionRequest value = Values.get(response, SessionRequest.class);

    return Optional.ofNullable(value);
  }

  @Override
  public void complete(RequestId reqId, Either<SessionNotCreatedException, CreateSessionResponse> result) {
    Require.nonNull("Request ID", reqId);
    Require.nonNull("Result", result);

    HttpRequest upstream;
    if (result.isRight()) {
      upstream = new HttpRequest(POST, String.format("/se/grid/newsessionqueue/session/%s/success", reqId))
        .setContent(Contents.asJson(result.right()));
    } else {
      upstream = new HttpRequest(POST, String.format("/se/grid/newsessionqueue/session/%s/failure", reqId))
        .setContent(Contents.asJson(result.left().getRawMessage()));
    }

    HttpTracing.inject(tracer, tracer.getCurrentContext(), upstream);
    client.with(addSecret).execute(upstream);
  }

  @Override
  public int clearQueue() {
    HttpRequest upstream = new HttpRequest(DELETE, "/se/grid/newsessionqueue/queue");
    HttpTracing.inject(tracer, tracer.getCurrentContext(), upstream);
    HttpResponse response = client.with(addSecret).execute(upstream);

    return Values.get(response, Integer.class);
  }

  @Override
  public List<SessionRequestCapability> getQueueContents() {
    HttpRequest upstream = new HttpRequest(GET, "/se/grid/newsessionqueue/queue");
    HttpTracing.inject(tracer, tracer.getCurrentContext(), upstream);
    HttpResponse response = client.execute(upstream);

    return Values.get(response, QUEUE_CONTENTS_TYPE);
  }

  @Override
  public boolean isReady() {
    try {
      return client.execute(new HttpRequest(GET, "/readyz")).isSuccessful();
    } catch (RuntimeException e) {
      return false;
    }
  }

}
