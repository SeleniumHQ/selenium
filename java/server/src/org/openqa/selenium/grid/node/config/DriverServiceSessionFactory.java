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

package org.openqa.selenium.grid.node.config;

import com.google.common.collect.ImmutableMap;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.PersistentCapabilities;
import org.openqa.selenium.chromium.ChromiumDevToolsLocator;
import org.openqa.selenium.grid.data.CreateSessionRequest;
import org.openqa.selenium.grid.node.ActiveSession;
import org.openqa.selenium.grid.node.ProtocolConvertingSession;
import org.openqa.selenium.grid.node.SessionFactory;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.Command;
import org.openqa.selenium.remote.Dialect;
import org.openqa.selenium.remote.DriverCommand;
import org.openqa.selenium.remote.ProtocolHandshake;
import org.openqa.selenium.remote.Response;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.service.DriverService;
import org.openqa.selenium.remote.tracing.Span;
import org.openqa.selenium.remote.tracing.Status;
import org.openqa.selenium.remote.tracing.Tracer;

import java.net.URI;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.function.Predicate;

import static org.openqa.selenium.remote.RemoteTags.CAPABILITIES;

public class DriverServiceSessionFactory implements SessionFactory {

  private final Tracer tracer;
  private final HttpClient.Factory clientFactory;
  private final Predicate<Capabilities> predicate;
  private final DriverService.Builder builder;

  public DriverServiceSessionFactory(
      Tracer tracer,
      HttpClient.Factory clientFactory,
      Predicate<Capabilities> predicate,
      DriverService.Builder builder) {
    this.tracer = Require.nonNull("Tracer", tracer);
    this.clientFactory = Require.nonNull("HTTP client factory", clientFactory);
    this.predicate = Require.nonNull("Accepted capabilities predicate", predicate);
    this.builder = Require.nonNull("Driver service bulder", builder);
  }

  @Override
  public boolean test(Capabilities capabilities) {
    return predicate.test(capabilities);
  }

  @Override
  public Optional<ActiveSession> apply(CreateSessionRequest sessionRequest) {
    if (sessionRequest.getDownstreamDialects().isEmpty()) {
      return Optional.empty();
    }

    if (!test(sessionRequest.getCapabilities())) {
      return Optional.empty();
    }

    try (Span span = tracer.getCurrentContext().createSpan("driver_service_factory.apply")) {
      CAPABILITIES.accept(span, sessionRequest.getCapabilities());
      DriverService service = builder.build();
      try {
        service.start();

        HttpClient client = clientFactory.createClient(service.getUrl());

        Command command = new Command(
            null,
            DriverCommand.NEW_SESSION(sessionRequest.getCapabilities()));

        ProtocolHandshake.Result result = new ProtocolHandshake().createSession(client, command);

        Set<Dialect> downstreamDialects = sessionRequest.getDownstreamDialects();
        Dialect upstream = result.getDialect();
        Dialect downstream = downstreamDialects.contains(result.getDialect()) ?
                             result.getDialect() :
                             downstreamDialects.iterator().next();

        Response response = result.createResponse();

        // TODO: This is a nasty hack. Try and make it elegant.

        Capabilities caps = new ImmutableCapabilities((Map<?, ?>) response.getValue());
        Optional<URI> reportedUri = ChromiumDevToolsLocator.getReportedUri("goog:chromeOptions", caps);
        if (reportedUri.isPresent()) {
          caps = addCdpCapability(caps, reportedUri.get());
        } else {
          reportedUri = ChromiumDevToolsLocator.getReportedUri("ms:edgeOptions", caps);
          if (reportedUri.isPresent()) {
            caps = addCdpCapability(caps, reportedUri.get());
          }
        }

        return Optional.of(
          new ProtocolConvertingSession(
            tracer,
            client,
            new SessionId(response.getSessionId()),
            service.getUrl(),
            downstream,
            upstream,
            caps) {
            @Override
            public void stop() {
              service.stop();
            }
          });
      } catch (Exception e) {
        span.setAttribute("error", true);
        span.setStatus(Status.UNKNOWN.withDescription(e.getMessage()));
        service.stop();
        return Optional.empty();
      }
    } catch (Exception e) {
      return Optional.empty();
    }
  }

  private Capabilities addCdpCapability(Capabilities caps, URI uri) {
    Object raw = caps.getCapability("se:options");
    if (!(raw instanceof Map)) {
      return new PersistentCapabilities(caps).setCapability("se:options", ImmutableMap.of("cdp", uri));
    }

    //noinspection unchecked
    Map<String, Object> current = new HashMap<>((Map<String, Object>) raw);
    current.put("cdp", uri);
    return new PersistentCapabilities(caps).setCapability("se:options", ImmutableMap.copyOf(current));
  }
}
