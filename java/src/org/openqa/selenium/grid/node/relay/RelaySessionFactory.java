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

package org.openqa.selenium.grid.node.relay;

import static org.openqa.selenium.remote.RemoteTags.CAPABILITIES;
import static org.openqa.selenium.remote.RemoteTags.CAPABILITIES_EVENT;
import static org.openqa.selenium.remote.tracing.AttributeKey.DOWNSTREAM_DIALECT;
import static org.openqa.selenium.remote.tracing.AttributeKey.DRIVER_RESPONSE;
import static org.openqa.selenium.remote.tracing.AttributeKey.DRIVER_URL;
import static org.openqa.selenium.remote.tracing.AttributeKey.EXCEPTION_EVENT;
import static org.openqa.selenium.remote.tracing.AttributeKey.EXCEPTION_MESSAGE;
import static org.openqa.selenium.remote.tracing.AttributeKey.LOGGER_CLASS;
import static org.openqa.selenium.remote.tracing.AttributeKey.UPSTREAM_DIALECT;
import static org.openqa.selenium.remote.tracing.EventAttribute.setValue;
import static org.openqa.selenium.remote.tracing.Tags.EXCEPTION;

import java.net.MalformedURLException;
import java.net.URI;
import java.net.URL;
import java.time.Duration;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.grid.data.CreateSessionRequest;
import org.openqa.selenium.grid.node.ActiveSession;
import org.openqa.selenium.grid.node.DefaultActiveSession;
import org.openqa.selenium.grid.node.SessionFactory;
import org.openqa.selenium.internal.Debug;
import org.openqa.selenium.internal.Either;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.Command;
import org.openqa.selenium.remote.Dialect;
import org.openqa.selenium.remote.DriverCommand;
import org.openqa.selenium.remote.ProtocolHandshake;
import org.openqa.selenium.remote.Response;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.ClientConfig;
import org.openqa.selenium.remote.http.Contents;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpMethod;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.tracing.AttributeKey;
import org.openqa.selenium.remote.tracing.EventAttributeValue;
import org.openqa.selenium.remote.tracing.Span;
import org.openqa.selenium.remote.tracing.Status;
import org.openqa.selenium.remote.tracing.Tracer;

public class RelaySessionFactory implements SessionFactory {

  private static final Logger LOG = Logger.getLogger(RelaySessionFactory.class.getName());

  private final Tracer tracer;
  private final HttpClient.Factory clientFactory;
  private final Duration sessionTimeout;
  private final URL serviceUrl;
  private final URL serviceStatusUrl;
  private final Capabilities stereotype;

  public RelaySessionFactory(
      Tracer tracer,
      HttpClient.Factory clientFactory,
      Duration sessionTimeout,
      URI serviceUri,
      URI serviceStatusUri,
      Capabilities stereotype) {
    this.tracer = Require.nonNull("Tracer", tracer);
    this.clientFactory = Require.nonNull("HTTP client", clientFactory);
    this.sessionTimeout = Require.nonNull("Session timeout", sessionTimeout);
    this.serviceUrl = createUrlFromUri(Require.nonNull("Service URL", serviceUri));
    this.serviceStatusUrl = createUrlFromUri(serviceStatusUri);
    this.stereotype = ImmutableCapabilities.copyOf(Require.nonNull("Stereotype", stereotype));
  }

  @Override
  public Capabilities getStereotype() {
    return stereotype;
  }

  @Override
  public boolean test(Capabilities capabilities) {
    // If a request reaches this point is because the basic match of W3C caps has already been done.

    // Custom matching in case a platformVersion is requested
    boolean platformVersionMatch =
        capabilities.getCapabilityNames().stream()
            .filter(name -> name.contains("platformVersion"))
            .map(
                platformVersionCapName ->
                    Objects.equals(
                        stereotype.getCapability(platformVersionCapName),
                        capabilities.getCapability(platformVersionCapName)))
            .reduce(Boolean::logicalAnd)
            .orElse(true);

    return platformVersionMatch
        && stereotype.getCapabilityNames().stream()
            .filter(name -> capabilities.asMap().containsKey(name))
            .map(
                name -> {
                  if (capabilities.getCapability(name) instanceof String) {
                    return stereotype
                        .getCapability(name)
                        .toString()
                        .equalsIgnoreCase(capabilities.getCapability(name).toString());
                  } else {
                    return capabilities.getCapability(name) == null
                        || Objects.equals(
                            stereotype.getCapability(name), capabilities.getCapability(name));
                  }
                })
            .reduce(Boolean::logicalAnd)
            .orElse(false);
  }

  @Override
  public Either<WebDriverException, ActiveSession> apply(CreateSessionRequest sessionRequest) {
    Capabilities capabilities = sessionRequest.getDesiredCapabilities();
    if (!test(capabilities)) {
      return Either.left(
          new SessionNotCreatedException(
              "New session request capabilities do not " + "match the stereotype."));
    }
    capabilities = capabilities.merge(stereotype);
    LOG.info("Starting session for " + capabilities);

    try (Span span = tracer.getCurrentContext().createSpan("relay_session_factory.apply")) {

      Map<String, EventAttributeValue> attributeMap = new HashMap<>();
      CAPABILITIES.accept(span, capabilities);
      CAPABILITIES_EVENT.accept(attributeMap, capabilities);
      attributeMap.put(LOGGER_CLASS.getKey(), setValue(this.getClass().getName()));
      attributeMap.put(DRIVER_URL.getKey(), setValue(serviceUrl.toString()));

      ClientConfig clientConfig =
          ClientConfig.defaultConfig().readTimeout(sessionTimeout).baseUrl(serviceUrl);
      HttpClient client = clientFactory.createClient(clientConfig);

      Command command = new Command(null, DriverCommand.NEW_SESSION(capabilities));
      try {
        ProtocolHandshake.Result result = new ProtocolHandshake().createSession(client, command);
        Set<Dialect> downstreamDialects = sessionRequest.getDownstreamDialects();
        Dialect upstream = result.getDialect();
        Dialect downstream =
            downstreamDialects.contains(result.getDialect())
                ? result.getDialect()
                : downstreamDialects.iterator().next();

        Response response = result.createResponse();
        attributeMap.put(UPSTREAM_DIALECT.getKey(), setValue(upstream.toString()));
        attributeMap.put(DOWNSTREAM_DIALECT.getKey(), setValue(downstream.toString()));
        attributeMap.put(DRIVER_RESPONSE.getKey(), setValue(response.toString()));

        Capabilities responseCaps = new ImmutableCapabilities((Map<?, ?>) response.getValue());
        Capabilities mergedCapabilities = capabilities.merge(responseCaps);

        span.addEvent("Relay service created session", attributeMap);
        LOG.fine(String.format("Created session: %s - %s", response.getSessionId(), capabilities));
        return Either.right(
            new DefaultActiveSession(
                tracer,
                client,
                new SessionId(response.getSessionId()),
                serviceUrl,
                downstream,
                upstream,
                stereotype,
                mergedCapabilities,
                Instant.now()) {
              @Override
              public void stop() {
                // no-op
              }
            });
      } catch (Exception e) {
        span.setAttribute(AttributeKey.ERROR.getKey(), true);
        span.setStatus(Status.CANCELLED);
        EXCEPTION.accept(attributeMap, e);
        String errorMessage =
            String.format(
                "Error while creating session with the service %s. %s", serviceUrl, e.getMessage());
        attributeMap.put(EXCEPTION_MESSAGE.getKey(), setValue(errorMessage));
        span.addEvent(EXCEPTION_EVENT.getKey(), attributeMap);
        return Either.left(new SessionNotCreatedException(errorMessage));
      }
    } catch (Exception e) {
      return Either.left(new SessionNotCreatedException(e.getMessage()));
    }
  }

  public boolean isServiceUp() {
    if (serviceStatusUrl == null) {
      // If no status endpoint was configured, we assume the server is up.
      return true;
    }
    try {
      HttpClient client = clientFactory.createClient(serviceStatusUrl);
      HttpResponse response =
          client.execute(new HttpRequest(HttpMethod.GET, serviceStatusUrl.toString()));
      LOG.log(Debug.getDebugLogLevel(), () -> Contents.string(response));
      return response.getStatus() == 200;
    } catch (Exception e) {
      LOG.log(
          Level.WARNING,
          () ->
              String.format(
                  "Error checking service status %s. %s", serviceStatusUrl, e.getMessage()));
      LOG.log(Debug.getDebugLogLevel(), "Error checking service status " + serviceStatusUrl, e);
    }
    return false;
  }

  private URL createUrlFromUri(URI uri) {
    if (uri == null) {
      return null;
    }
    try {
      return uri.toURL();
    } catch (MalformedURLException e) {
      throw new RuntimeException(e.getMessage(), e);
    }
  }
}
