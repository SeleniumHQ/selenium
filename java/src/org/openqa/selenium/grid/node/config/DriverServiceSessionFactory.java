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

import static org.openqa.selenium.remote.RemoteTags.CAPABILITIES;
import static org.openqa.selenium.remote.RemoteTags.CAPABILITIES_EVENT;
import static org.openqa.selenium.remote.tracing.Tags.EXCEPTION;

import java.net.URI;
import java.net.URL;
import java.time.Duration;
import java.time.Instant;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.stream.Stream;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.MutableCapabilities;
import org.openqa.selenium.PersistentCapabilities;
import org.openqa.selenium.Platform;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.devtools.CdpEndpointFinder;
import org.openqa.selenium.grid.data.CreateSessionRequest;
import org.openqa.selenium.grid.node.ActiveSession;
import org.openqa.selenium.grid.node.DefaultActiveSession;
import org.openqa.selenium.grid.node.SessionFactory;
import org.openqa.selenium.internal.Either;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.net.HostIdentifier;
import org.openqa.selenium.net.NetworkUtils;
import org.openqa.selenium.remote.Command;
import org.openqa.selenium.remote.Dialect;
import org.openqa.selenium.remote.DriverCommand;
import org.openqa.selenium.remote.ProtocolHandshake;
import org.openqa.selenium.remote.Response;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.ClientConfig;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.service.DriverFinder;
import org.openqa.selenium.remote.service.DriverService;
import org.openqa.selenium.remote.tracing.AttributeKey;
import org.openqa.selenium.remote.tracing.AttributeMap;
import org.openqa.selenium.remote.tracing.Span;
import org.openqa.selenium.remote.tracing.Status;
import org.openqa.selenium.remote.tracing.Tracer;

public class DriverServiceSessionFactory implements SessionFactory {

  private static final Logger LOG = Logger.getLogger(DriverServiceSessionFactory.class.getName());

  private final Tracer tracer;
  private final HttpClient.Factory clientFactory;
  private final Duration sessionTimeout;
  private final Predicate<Capabilities> predicate;
  private final DriverService.Builder<?, ?> builder;
  private final Capabilities stereotype;
  private final SessionCapabilitiesMutator sessionCapabilitiesMutator;

  public DriverServiceSessionFactory(
      Tracer tracer,
      HttpClient.Factory clientFactory,
      Duration sessionTimeout,
      Capabilities stereotype,
      Predicate<Capabilities> predicate,
      DriverService.Builder<?, ?> builder) {
    this.tracer = Require.nonNull("Tracer", tracer);
    this.clientFactory = Require.nonNull("HTTP client factory", clientFactory);
    this.sessionTimeout = Require.nonNull("Session timeout", sessionTimeout);
    this.stereotype = ImmutableCapabilities.copyOf(Require.nonNull("Stereotype", stereotype));
    this.predicate = Require.nonNull("Accepted capabilities predicate", predicate);
    this.builder = Require.nonNull("Driver service builder", builder);
    this.sessionCapabilitiesMutator = new SessionCapabilitiesMutator(this.stereotype);
  }

  @Override
  public Capabilities getStereotype() {
    return stereotype;
  }

  @Override
  public boolean test(Capabilities capabilities) {
    return predicate.test(capabilities);
  }

  @Override
  public Either<WebDriverException, ActiveSession> apply(CreateSessionRequest sessionRequest) {
    if (sessionRequest.getDownstreamDialects().isEmpty()) {
      return Either.left(new SessionNotCreatedException("No downstream dialects were found."));
    }

    if (!test(sessionRequest.getDesiredCapabilities())) {
      return Either.left(
          new SessionNotCreatedException(
              "New session request capabilities do not " + "match the stereotype."));
    }

    Span span = tracer.getCurrentContext().createSpan("driver_service_factory.apply");
    AttributeMap attributeMap = tracer.createAttributeMap();
    try {

      Capabilities capabilities =
          sessionCapabilitiesMutator.apply(sessionRequest.getDesiredCapabilities());

      CAPABILITIES.accept(span, capabilities);
      CAPABILITIES_EVENT.accept(attributeMap, capabilities);
      attributeMap.put(AttributeKey.LOGGER_CLASS.getKey(), this.getClass().getName());

      DriverService service = builder.build();
      DriverFinder finder = new DriverFinder(service, capabilities);
      service.setExecutable(finder.getDriverPath());
      if (finder.hasBrowserPath()) {
        capabilities = setBrowserBinary(capabilities, finder.getBrowserPath());
      }

      Optional<Platform> platformName = Optional.ofNullable(capabilities.getPlatformName());
      if (platformName.isPresent()) {
        capabilities = removeCapability(capabilities, "platformName");
      }

      Optional<String> browserVersion = Optional.ofNullable(capabilities.getBrowserVersion());
      if (browserVersion.isPresent()) {
        capabilities = removeCapability(capabilities, "browserVersion");
      }

      HttpClient client = null;
      try {
        service.start();

        URL serviceURL = service.getUrl();
        attributeMap.put(AttributeKey.DRIVER_URL.getKey(), serviceURL.toString());

        ClientConfig clientConfig =
            ClientConfig.defaultConfig().readTimeout(sessionTimeout).baseUrl(serviceURL);
        client = clientFactory.createClient(clientConfig);

        Command command = new Command(null, DriverCommand.NEW_SESSION(capabilities));

        ProtocolHandshake.Result result = new ProtocolHandshake().createSession(client, command);

        Set<Dialect> downstreamDialects = sessionRequest.getDownstreamDialects();
        Dialect upstream = result.getDialect();
        Dialect downstream =
            downstreamDialects.contains(result.getDialect())
                ? result.getDialect()
                : downstreamDialects.iterator().next();

        Response response = result.createResponse();

        attributeMap.put(AttributeKey.UPSTREAM_DIALECT.getKey(), upstream.toString());
        attributeMap.put(AttributeKey.DOWNSTREAM_DIALECT.getKey(), downstream.toString());
        attributeMap.put(AttributeKey.DRIVER_RESPONSE.getKey(), response.toString());

        Capabilities caps = new ImmutableCapabilities((Map<?, ?>) response.getValue());
        if (platformName.isPresent()) {
          caps = setInitialCapabilityValue(caps, "platformName", platformName.get());
        }

        if (caps.getBrowserVersion().isEmpty()
            && browserVersion.isPresent()
            && !browserVersion.get().isEmpty()) {
          caps = setInitialCapabilityValue(caps, "browserVersion", browserVersion.get());
        }

        caps = readDevToolsEndpointAndVersion(caps);
        caps = readVncEndpoint(capabilities, caps);
        caps = readPrefixedCaps(capabilities, caps);

        span.addEvent("Driver service created session", attributeMap);
        final HttpClient fClient = client;
        return Either.right(
            new DefaultActiveSession(
                tracer,
                client,
                new SessionId(response.getSessionId()),
                service.getUrl(),
                downstream,
                upstream,
                stereotype,
                caps,
                Instant.now()) {
              @Override
              public void stop() {
                try (fClient) {
                  service.stop();
                }
              }
            });
      } catch (Exception e) {
        span.setAttribute(AttributeKey.ERROR.getKey(), true);
        span.setStatus(Status.CANCELLED);
        EXCEPTION.accept(attributeMap, e);
        String errorMessage =
            "Error while creating session with the driver service. "
                + "Stopping driver service: "
                + e.getMessage();
        LOG.log(Level.WARNING, errorMessage, e);

        attributeMap.put(AttributeKey.EXCEPTION_MESSAGE.getKey(), errorMessage);
        span.addEvent(AttributeKey.EXCEPTION_EVENT.getKey(), attributeMap);
        try (final HttpClient fClient = client) {
          service.stop();
        }
        return Either.left(new SessionNotCreatedException(errorMessage));
      }
    } catch (Exception e) {
      span.setAttribute(AttributeKey.ERROR.getKey(), true);
      span.setStatus(Status.CANCELLED);
      EXCEPTION.accept(attributeMap, e);
      String errorMessage =
          "Error while creating session with the driver service. " + e.getMessage();
      LOG.log(Level.WARNING, errorMessage, e);

      attributeMap.put(AttributeKey.EXCEPTION_MESSAGE.getKey(), errorMessage);
      span.addEvent(AttributeKey.EXCEPTION_EVENT.getKey(), attributeMap);

      return Either.left(new SessionNotCreatedException(errorMessage));
    } finally {
      span.close();
    }
  }

  private Capabilities readDevToolsEndpointAndVersion(Capabilities caps) {
    class DevToolsInfo {
      public final URI cdpEndpoint;
      public final String version;

      public DevToolsInfo(URI cdpEndpoint, String version) {
        this.cdpEndpoint = cdpEndpoint;
        this.version = version;
      }
    }

    Function<Capabilities, Optional<DevToolsInfo>> chrome =
        c ->
            CdpEndpointFinder.getReportedUri("goog:chromeOptions", c)
                .map(uri -> new DevToolsInfo(uri, c.getBrowserVersion()));

    Function<Capabilities, Optional<DevToolsInfo>> edge =
        c ->
            CdpEndpointFinder.getReportedUri("ms:edgeOptions", c)
                .map(uri -> new DevToolsInfo(uri, c.getBrowserVersion()));

    Function<Capabilities, Optional<DevToolsInfo>> firefox =
        c ->
            CdpEndpointFinder.getReportedUri("moz:debuggerAddress", c)
                .map(uri -> new DevToolsInfo(uri, "85.0"));

    Optional<DevToolsInfo> maybeInfo =
        Stream.of(chrome, edge, firefox)
            .map(finder -> finder.apply(caps))
            .filter(Optional::isPresent)
            .map(Optional::get)
            .findFirst();

    if (maybeInfo.isPresent()) {
      DevToolsInfo info = maybeInfo.get();
      return new PersistentCapabilities(caps)
          .setCapability("se:cdp", info.cdpEndpoint)
          .setCapability("se:cdpVersion", info.version);
    }
    return caps;
  }

  private Capabilities readVncEndpoint(Capabilities requestedCaps, Capabilities returnedCaps) {
    String seVncEnabledCap = "se:vncEnabled";
    String seNoVncPortCap = "se:noVncPort";
    String seVncEnabled = String.valueOf(requestedCaps.getCapability(seVncEnabledCap));
    boolean vncLocalAddressSet = requestedCaps.getCapabilityNames().contains("se:vncLocalAddress");
    if (Boolean.parseBoolean(seVncEnabled) && !vncLocalAddressSet) {
      String seNoVncPort = String.valueOf(requestedCaps.getCapability(seNoVncPortCap));
      String vncLocalAddress = String.format("ws://%s:%s", getHost(), seNoVncPort);
      returnedCaps =
          new PersistentCapabilities(returnedCaps)
              .setCapability("se:vncLocalAddress", vncLocalAddress)
              .setCapability(seVncEnabledCap, true);
    }
    return returnedCaps;
  }

  private Capabilities readPrefixedCaps(Capabilities requestedCaps, Capabilities returnedCaps) {

    PersistentCapabilities returnPrefixedCaps = new PersistentCapabilities(returnedCaps);

    Map<String, Object> requestedCapsMap = requestedCaps.asMap();
    Map<String, Object> returnedCapsMap = returnedCaps.asMap();

    for (Map.Entry<String, Object> entry : requestedCapsMap.entrySet()) {
      String key = entry.getKey();
      Object value = entry.getValue();
      if (key.startsWith("se:") && !returnedCapsMap.containsKey(key)) {
        returnPrefixedCaps = returnPrefixedCaps.setCapability(key, value);
      }
    }

    return returnPrefixedCaps;
  }

  // We remove a capability before sending the caps to the driver because some drivers will
  // reject session requests when they cannot parse the specific capabilities (like platform or
  // browser version).
  private Capabilities removeCapability(Capabilities caps, String capability) {
    MutableCapabilities removableCaps = new MutableCapabilities(new HashMap<>(caps.asMap()));
    removableCaps.setCapability(capability, (String) null);
    return new PersistentCapabilities(removableCaps);
  }

  private Capabilities setInitialCapabilityValue(Capabilities caps, String key, Object value) {
    return new PersistentCapabilities(caps).setCapability(key, value);
  }

  private String getHost() {
    try {
      return new NetworkUtils().getNonLoopbackAddressOfThisMachine();
    } catch (WebDriverException e) {
      return HostIdentifier.getHostName();
    }
  }

  private Capabilities setBrowserBinary(Capabilities options, String browserPath) {
    List<String> vendorOptionsCapabilities =
        Arrays.asList("moz:firefoxOptions", "goog:chromeOptions", "ms:edgeOptions");
    for (String vendorOptionsCapability : vendorOptionsCapabilities) {
      if (options.asMap().containsKey(vendorOptionsCapability)) {
        try {
          @SuppressWarnings("unchecked")
          Map<String, Object> vendorOptions =
              (Map<String, Object>) options.getCapability(vendorOptionsCapability);
          vendorOptions.put("binary", browserPath);
          MutableCapabilities toReturn = new MutableCapabilities(options);
          toReturn.setCapability(vendorOptionsCapability, vendorOptions);
          toReturn.setCapability("browserVersion", (String) null);
          return new PersistentCapabilities(toReturn);
        } catch (Exception e) {
          LOG.log(
              Level.WARNING,
              String.format(
                  "Exception while setting the browser binary path. Options: %s", options),
              e);
        }
      }
    }
    return options;
  }
}
