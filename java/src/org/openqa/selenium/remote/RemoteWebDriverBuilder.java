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

package org.openqa.selenium.remote;

import com.google.common.annotations.VisibleForTesting;
import com.google.common.collect.ImmutableSet;

import org.openqa.selenium.Beta;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.Credentials;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.UsernameAndPassword;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverInfo;
import org.openqa.selenium.internal.Either;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.http.ClientConfig;
import org.openqa.selenium.remote.http.DumpHttpExchangeFilter;
import org.openqa.selenium.remote.http.Filter;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.service.DriverService;

import java.io.Closeable;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.ServiceLoader;
import java.util.Set;
import java.util.TreeMap;
import java.util.function.Function;
import java.util.function.Supplier;
import java.util.logging.Logger;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

import static java.util.logging.Level.WARNING;
import static org.openqa.selenium.internal.Debug.getDebugLogLevel;
import static org.openqa.selenium.remote.DriverCommand.QUIT;
import static org.openqa.selenium.remote.http.HttpMethod.DELETE;

/**
 * Create a new Selenium session using the W3C WebDriver protocol. This class will not generate any
 * data expected by the original JSON Wire Protocol, so will fail to create sessions as expected if
 * used against a server that only implements that protocol.
 * <p>
 * Expected usage is something like:
 * <pre>
 *   WebDriver driver = RemoteWebDriver.builder()
 *     .addAlternative(new FirefoxOptions())
 *     .addAlternative(new ChromeOptions())
 *     .addMetadata("cloud:key", "hunter2")
 *     .setCapability("proxy", new Proxy())
 *     .build();
 * </pre>
 * In this example, we ask for a session where the browser will be either Firefox or Chrome (we
 * don't care which), but where either browser will use the given {@link org.openqa.selenium.Proxy}.
 * In addition, we've added some metadata to the session, setting the "{@code cloud.key}" to be the
 * secret passphrase of our account with the cloud "Selenium as a Service" provider.
 * <p>
 * If no call to {@link #withDriverService(DriverService)} or {@link #address(URI)} is made, the
 * builder will use {@link ServiceLoader} to find all instances of {@link WebDriverInfo} and will
 * call {@link WebDriverInfo#createDriver(Capabilities)} for the first supported set of
 * capabilities.
 */
@Beta
public class RemoteWebDriverBuilder {

  private static final Logger LOG = Logger.getLogger(RemoteWebDriverBuilder.class.getName());
  private static final Set<String> ILLEGAL_METADATA_KEYS = ImmutableSet.of(
    "alwaysMatch",
    "capabilities",
    "desiredCapabilities",
    "firstMatch");
  private final List<Capabilities> requestedCapabilities = new ArrayList<>();
  private final Map<String, Object> additionalCapabilities = new TreeMap<>();
  private final Map<String, Object> metadata = new TreeMap<>();
  private Function<ClientConfig, HttpHandler> handlerFactory =
      config -> {
        HttpClient.Factory factory = HttpClient.Factory.createDefault();
        HttpClient client = factory.createClient(config);
        return client.with(
          next -> req -> {
            try {
              return client.execute(req);
            } finally {
              if (req.getMethod() == DELETE) {
                HttpSessionId.getSessionId(req.getUri()).ifPresent(id -> {
                  if (("/session/" + id).equals(req.getUri())) {
                    try {
                      client.close();
                    } catch (UncheckedIOException e) {
                      LOG.log(WARNING, "Swallowing exception while closing http client", e);
                    }
                    factory.cleanupIdleClients();
                  }
                });
              }
            }
          });
      };
  private ClientConfig clientConfig = ClientConfig.defaultConfig();
  private URI remoteHost = null;
  private DriverService driverService;
  private Credentials credentials = null;
  private boolean useCustomConfig;
  private Augmenter augmenter = new Augmenter();

  RemoteWebDriverBuilder() {
    // Access through RemoteWebDriver.builder
  }

  /**
   * Clears the current set of alternative browsers and instead sets the list of possible choices to
   * the arguments given to this method.
   */
  public RemoteWebDriverBuilder oneOf(Capabilities maybeThis, Capabilities... orOneOfThese) {
    Require.nonNull("Capabilities to use", maybeThis);

    if (!requestedCapabilities.isEmpty()) {
      LOG.log(getDebugLogLevel(), "Removing existing requested capabilities: " + requestedCapabilities);
      requestedCapabilities.clear();
    }

    addAlternative(maybeThis);
    for (Capabilities caps : orOneOfThese) {
      Require.nonNull("Capabilities to use", caps);
      addAlternative(caps);
    }
    return this;
  }

  /**
   * Add to the list of possible configurations that might be asked for. It is possible to ask for
   * more than one type of browser per session. For example, perhaps you have an extension that is
   * available for two different kinds of browser, and you'd like to test it).
   */
  public RemoteWebDriverBuilder addAlternative(Capabilities options) {
    Require.nonNull("Capabilities to use", options);
    requestedCapabilities.add(new ImmutableCapabilities(options));
    return this;
  }

  /**
   * Adds metadata to the outgoing new session request, which can be used by intermediary of end
   * nodes for any purpose they choose (commonly, this is used to request additional features from
   * cloud providers, such as video recordings or to set the timezone or screen size). Neither
   * parameter can be {@code null}.
   */
  public RemoteWebDriverBuilder addMetadata(String key, Object value) {
    Require.nonNull("Metadata key", key);
    Require.nonNull("Metadata value", value);

    if (ILLEGAL_METADATA_KEYS.contains(key)) {
      throw new IllegalArgumentException(String.format("Cannot add %s as metadata key", key));
    }

    Object previous = metadata.put(key, value);
    if (previous != null) {
      LOG.log(
        getDebugLogLevel(),
        String.format("Overwriting metadata %s. Previous value %s, new value %s", key, previous, value));
    }

    return this;
  }

  /**
   * Sets a capability for every single alternative when the session is created. These capabilities
   * are only set once the session is created, so this will be set on capabilities added via
   * {@link #addAlternative(Capabilities)} or {@link #oneOf(Capabilities, Capabilities...)} even
   * after this method call.
   */
  public RemoteWebDriverBuilder setCapability(String capabilityName, Object value) {
    Require.nonNull("Capability name", capabilityName);
    Require.nonNull("Capability value", value);

    Object previous = additionalCapabilities.put(capabilityName, value);
    if (previous != null) {
      LOG.log(
        getDebugLogLevel(),
        () -> String.format("Overwriting capability %s. Previous value %s, new value %s",
                            capabilityName, previous, value));
    }

    return this;
  }

  /**
   * @see #address(URI)
   */
  public RemoteWebDriverBuilder address(String uri) {
    Require.nonNull("Address", uri);
    try {
      return address(new URI(uri));
    } catch (URISyntaxException e) {
      throw new IllegalArgumentException("Unable to create URI from " + uri);
    }
  }

  /**
   * @see #address(URI)
   */
  public RemoteWebDriverBuilder address(URL url) {
    Require.nonNull("Address", url);
    try {
      return address(url.toURI());
    } catch (URISyntaxException e) {
      throw new IllegalArgumentException("Unable to create URI from " + url);
    }
  }

  /**
   * Set the URI of the remote server. If this URI is not set, then it assumed that a local running
   * remote webdriver session is needed. It is an error to call this method and also
   * {@link #withDriverService(DriverService)}.
   */
  public RemoteWebDriverBuilder address(URI uri) {
    Require.nonNull("URI", uri);

    if (driverService != null || (clientConfig.baseUri() != null && !clientConfig.baseUri().equals(uri))) {
      throw new IllegalArgumentException(
        "Attempted to set the base uri on both this builder and the http client config. " +
        "Please set in only one place. " + uri);
    }

    remoteHost = uri;

    return this;
  }

  public RemoteWebDriverBuilder authenticateAs(UsernameAndPassword usernameAndPassword) {
    Require.nonNull("User name and password", usernameAndPassword);

    this.credentials = usernameAndPassword;

    return this;
  }

  /**
   * Allows precise control of the {@link ClientConfig} to use with remote
   * instances. If {@link ClientConfig#baseUri(URI)} has been called, then
   * that will be used as the base URI for the session.
   */
  public RemoteWebDriverBuilder config(ClientConfig config) {
    Require.nonNull("HTTP client config", config);

    if (config.baseUri() != null) {
      if (remoteHost != null || driverService != null) {
        throw new IllegalArgumentException("Base URI has already been set. Cannot also set it via client config");
      }
    }

    this.clientConfig = config;
    this.useCustomConfig = true;

    return this;
  }

  /**
   * Use the given {@link DriverService} to set up the webdriver instance. It is an error to set
   * both this and also call {@link #address(URI)}.
   */
  public RemoteWebDriverBuilder withDriverService(DriverService service) {
    Require.nonNull("Driver service", service);

    if (clientConfig.baseUri() != null || remoteHost != null) {
      throw new IllegalArgumentException("Base URI has already been set. Cannot also set driver service.");
    }

    this.driverService = service;

    return this;
  }

  @VisibleForTesting
  RemoteWebDriverBuilder connectingWith(Function<ClientConfig, HttpHandler> handlerFactory) {
    Require.nonNull("Handler factory", handlerFactory);
    this.handlerFactory = handlerFactory;
    return this;
  }

  /**
   * @param augmenter The {@link Augmenter} to use when creating the {@link WebDriver} instance.
   */
  public RemoteWebDriverBuilder augmentUsing(Augmenter augmenter) {
    Require.nonNull("Augmenter", augmenter);
    this.augmenter = augmenter;
    return this;
  }

  @VisibleForTesting
  WebDriver getLocalDriver() {
    if (remoteHost != null || clientConfig.baseUri() != null || driverService != null) {
      return null;
    }

    Set<WebDriverInfo> infos = StreamSupport.stream(
         ServiceLoader.load(WebDriverInfo.class).spliterator(),
         false)
         .filter(WebDriverInfo::isAvailable)
         .collect(Collectors.toSet());

    Capabilities additional = new ImmutableCapabilities(additionalCapabilities);
    Optional<Supplier<WebDriver>> first = requestedCapabilities.stream()
      .map(caps -> caps.merge(additional))
      .flatMap(caps ->
        infos.stream()
          .filter(WebDriverInfo::isAvailable)
          .filter(info -> info.isSupporting(caps))
          .map(info -> (Supplier<WebDriver>) () -> info.createDriver(caps)
            .orElseThrow(() -> new SessionNotCreatedException("Unable to create session with " + caps))))
      .findFirst();

    if (!first.isPresent()) {
      throw new SessionNotCreatedException("Unable to find matching driver for capabilities");
    }

    WebDriver localDriver = first.get().get();

    if (localDriver != null && this.useCustomConfig) {
      localDriver.quit();
      throw new IllegalArgumentException("ClientConfig instances do not work for Local Drivers");
    }

    return localDriver;
  }

  /**
   * Actually create a new WebDriver session. The returned webdriver is not guaranteed to be a
   * {@link RemoteWebDriver}.
   */
  public WebDriver build() {
    if (requestedCapabilities.isEmpty() && additionalCapabilities.isEmpty()) {
      throw new SessionNotCreatedException("One set of browser options must be specified");
    }

    Set<String> clobberedCapabilities = getClobberedCapabilities();
    if (!clobberedCapabilities.isEmpty()) {
      throw new IllegalArgumentException(String.format(
        "Unable to create session. Additional capabilities %s overwrite capabilities in requested options",
        clobberedCapabilities));
    }

    WebDriver driver = getLocalDriver();
    if (driver == null) {
      driver = getRemoteDriver();
    }

    return augmenter.augment(driver);
  }

  private WebDriver getRemoteDriver() {
    startDriverServiceIfNecessary();

    ClientConfig driverClientConfig = clientConfig;
    URI baseUri = getBaseUri();
    if (baseUri != null) {
      driverClientConfig = driverClientConfig.baseUri(baseUri);
    }
    if (credentials != null) {
      driverClientConfig = driverClientConfig.authenticateAs(credentials);
    }

    HttpHandler client = handlerFactory.apply(driverClientConfig);
    HttpHandler handler = Require.nonNull("Http handler", client)
      .with(new CloseHttpClientFilter(client)
        .andThen(new AddWebDriverSpecHeaders())
        .andThen(new ErrorFilter())
        .andThen(new DumpHttpExchangeFilter()));

    Either<SessionNotCreatedException, ProtocolHandshake.Result> result;
    try {
      result = new ProtocolHandshake().createSession(handler, getPayload());
    } catch (IOException e) {
      throw new SessionNotCreatedException("Unable to create new remote session.", e);
    }

    if (result.isRight()) {
      CommandExecutor executor = result.map(res -> createExecutor(handler, res));
      return new RemoteWebDriver(executor, new ImmutableCapabilities());
    } else {
      throw result.left();
    }
  }

  private URI getBaseUri() {
    if (remoteHost != null) {
      return remoteHost;
    }

    if (driverService != null && driverService.isRunning()) {
      try {
        return driverService.getUrl().toURI();
      } catch (URISyntaxException e) {
        throw new IllegalStateException("Unable to get driver service URI", e);
      }
    }

    return clientConfig.baseUri();
  }

  private DriverService startDriverServiceIfNecessary() {
    if (driverService == null) {
      return null;
    }

    try {
      driverService.start();
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }

    return driverService;
  }

  private CommandExecutor createExecutor(HttpHandler handler, ProtocolHandshake.Result result) {
    Dialect dialect = result.getDialect();
    Function<Command, HttpRequest> commandEncoder = dialect.getCommandCodec()::encode;
    Function<HttpResponse, Response> responseDecoder = dialect.getResponseCodec()::decode;

    Response newSessionResponse = result.createResponse();
    String id = newSessionResponse.getSessionId();

    CommandExecutor baseExecutor = cmd -> commandEncoder.andThen(handler::execute).andThen(responseDecoder).apply(cmd);

    CommandExecutor handleNewSession = cmd -> {
      if (DriverCommand.NEW_SESSION.equals(cmd.getName())) {
        return newSessionResponse;
      }
      return baseExecutor.execute(cmd);
    };

    CommandExecutor addSessionId = cmd -> {
      Response res = handleNewSession.execute(cmd);
      if (res.getSessionId() == null) {
        res.setSessionId(id);
      }
      return res;
    };

    CommandExecutor stopService = cmd -> {
      try {
        return addSessionId.execute(cmd);
      } finally {
        if (driverService != null && QUIT.equals(cmd.getName())) {
          try {
            driverService.stop();
          } catch (Exception e) {
            // Fall through.
          }
        }
      }
    };

    return stopService;
  }

  private Set<String> getClobberedCapabilities() {
    Set<String> names = additionalCapabilities.keySet();
    return requestedCapabilities.stream()
      .map(Capabilities::getCapabilityNames)
      .flatMap(Collection::stream)
      .filter(names::contains)
      .collect(Collectors.toSet());
  }

  private NewSessionPayload getPayload() {
    Map<String, Object> roughPayload = new TreeMap<>(metadata);

    Map<String, Object> w3cCaps = new TreeMap<>();
    w3cCaps.put("alwaysMatch", additionalCapabilities);
    if (!requestedCapabilities.isEmpty()) {
      w3cCaps.put("firstMatch", requestedCapabilities);
    }
    roughPayload.put("capabilities", w3cCaps);
    return NewSessionPayload.create(roughPayload);
  }

  private static class CloseHttpClientFilter implements Filter {

    private final HttpHandler client;

    CloseHttpClientFilter(HttpHandler client) {
      this.client = Require.nonNull("Http client", client);
    }

    @Override
    public HttpHandler apply(HttpHandler next) {
      return req -> {
        try {
          return next.execute(req);
        } finally {
          if (req.getMethod() == DELETE && client instanceof Closeable) {
            HttpSessionId.getSessionId(req.getUri()).ifPresent(id -> {
              if (("/session/" + id).equals(req.getUri())) {
                try {
                  ((Closeable) client).close();
                } catch (IOException e) {
                  LOG.log(WARNING, "Exception swallowed while closing http client", e);
                }
              }
            });
          }
        }
      };
    }
  }
}
