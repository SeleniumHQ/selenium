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

import static com.google.common.net.MediaType.JSON_UTF_8;
import static org.openqa.selenium.remote.HttpSessionId.getSessionId;
import static org.openqa.selenium.remote.http.Contents.utf8String;
import static org.openqa.selenium.remote.http.HttpMethod.POST;

import com.google.common.annotations.VisibleForTesting;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;

import org.openqa.selenium.Beta;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.json.JsonOutput;
import org.openqa.selenium.remote.codec.w3c.W3CHttpCommandCodec;
import org.openqa.selenium.remote.codec.w3c.W3CHttpResponseCodec;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.service.DriverService;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.ServiceLoader;
import java.util.Set;
import java.util.TreeMap;
import java.util.concurrent.atomic.AtomicReference;
import java.util.function.Consumer;
import java.util.function.Supplier;
import java.util.stream.StreamSupport;

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
 * If no call to {@link #withDriverService(DriverService)} or {@link #url(URL)} is made, the builder
 * will use {@link ServiceLoader} to find all instances of {@link DriverService.Builder} and will
 * call {@link DriverService.Builder#score(Capabilities)} for each alternative until a new session
 * can be created.
 */
@Beta
public class RemoteWebDriverBuilder {

  private final static Set<String> ILLEGAL_METADATA_KEYS = ImmutableSet.of(
      "alwaysMatch",
      "capabilities",
      "firstMatch");
  private final static AcceptedW3CCapabilityKeys OK_KEYS = new AcceptedW3CCapabilityKeys();
  private final List<Map<String, Object>> options = new ArrayList<>();
  private final Map<String, Object> metadata = new TreeMap<>();
  private final Map<String, Object> additionalCapabilities = new TreeMap<>();
  private URL remoteHost;
  private DriverService service;

  RemoteWebDriverBuilder() {
    // Access through RemoteWebDriver.builder
  }

  /**
   * Clears the current set of alternative browsers and instead sets the list of possible choices to
   * the arguments given to this method.
   */
  public RemoteWebDriverBuilder oneOf(Capabilities maybeThis, Capabilities... orOneOfThese) {
    options.clear();
    addAlternative(maybeThis);
    for (Capabilities anOrOneOfThese : orOneOfThese) {
      addAlternative(anOrOneOfThese);
    }
    return this;
  }

  /**
   * Add to the list of possible configurations that might be asked for. It is possible to ask for
   * more than one type of browser per session. For example, perhaps you have an extension that is
   * available for two different kinds of browser, and you'd like to test it).
   */
  public RemoteWebDriverBuilder addAlternative(Capabilities options) {
    Map<String, Object> serialized = validate(Objects.requireNonNull(options));
    this.options.add(serialized);
    return this;
  }

  /**
   * Adds metadata to the outgoing new session request, which can be used by intermediary of end
   * nodes for any purpose they choose (commonly, this is used to request additional features from
   * cloud providers, such as video recordings or to set the timezone or screen size). Neither
   * parameter can be {@code null}.
   */
  public RemoteWebDriverBuilder addMetadata(String key, Object value) {
    if (ILLEGAL_METADATA_KEYS.contains(key)) {
      throw new IllegalArgumentException(key + " is a reserved key");
    }
    metadata.put(Objects.requireNonNull(key), Objects.requireNonNull(value));
    return this;
  }

  /**
   * Sets a capability for every single alternative when the session is created. These capabilities
   * are only set once the session is created, so this will be set on capabilities added via
   * {@link #addAlternative(Capabilities)} or {@link #oneOf(Capabilities, Capabilities...)} even
   * after this method call.
   */
  public RemoteWebDriverBuilder setCapability(String capabilityName, String value) {
    if (!OK_KEYS.test(capabilityName)) {
      throw new IllegalArgumentException("Capability is not valid");
    }
    if (value == null) {
      throw new IllegalArgumentException("Null values are not allowed");
    }

    additionalCapabilities.put(capabilityName, value);
    return this;
  }

  /**
   * @see #url(URL)
   */
  public RemoteWebDriverBuilder url(String url) {
    try {
      return url(new URL(url));
    } catch (MalformedURLException e) {
      throw new UncheckedIOException(e);
    }
  }

  /**
   * Set the URL of the remote server. If this URL is not set, then it assumed that a local running
   * remote webdriver session is needed. It is an error to call this method and also
   * {@link #withDriverService(DriverService)}.
   */
  public RemoteWebDriverBuilder url(URL url) {
    this.remoteHost = Objects.requireNonNull(url);
    validateDriverServiceAndUrlConstraint();
    return this;
  }

  /**
   * Use the given {@link DriverService} to set up the webdriver instance. It is an error to set
   * both this and also call {@link #url(URL)}.
   */
  public RemoteWebDriverBuilder withDriverService(DriverService service) {
    this.service = Objects.requireNonNull(service);
    validateDriverServiceAndUrlConstraint();
    return this;
  }

  /**
   * Actually create a new WebDriver session. The returned webdriver is not guaranteed to be a
   * {@link RemoteWebDriver}.
   */
  public WebDriver build() {
    if (options.isEmpty() && additionalCapabilities.isEmpty()) {
      throw new SessionNotCreatedException("Refusing to create session without any capabilities");
    }

    Plan plan = getPlan();

    CommandExecutor executor;
    if (plan.isUsingDriverService()) {
      AtomicReference<DriverService> serviceRef = new AtomicReference<>();

      executor = new SpecCompliantExecutor(
          () -> {
            if (serviceRef.get() != null && serviceRef.get().isRunning()) {
              throw new SessionNotCreatedException(
                  "Attempt to start the underlying service more than once");
            }
            try {
              DriverService service = plan.getDriverService();
              serviceRef.set(service);
              service.start();
              return service.getUrl();
            } catch (IOException e) {
              throw new SessionNotCreatedException(e.getMessage(), e);
            }
          },
          plan::writePayload,
          () -> serviceRef.get().stop());
    } else {
      executor = new SpecCompliantExecutor(() -> remoteHost, plan::writePayload, () -> {});
    }

    return new RemoteWebDriver(executor, new ImmutableCapabilities());
  }

  private Map<String, Object> validate(Capabilities options) {
    return options.asMap().entrySet().stream()
        // Ensure that the keys are ok
        .peek(
            entry -> {
              if (!OK_KEYS.test(entry.getKey())) {
                throw new IllegalArgumentException(
                    "Capability key is not a valid w3c key: " + entry.getKey());
              }
            })
        // And remove null values, as these are ignored.
        .filter(entry -> entry.getValue() != null)
        .collect(ImmutableMap.toImmutableMap(Map.Entry::getKey, Map.Entry::getValue));
  }

  @VisibleForTesting
  Plan getPlan() {
    return new Plan();
  }

  private void validateDriverServiceAndUrlConstraint() {
    if (remoteHost != null && service != null) {
      throw new IllegalArgumentException(
          "You may only set one of the remote url or the driver service to use.");
    }
  }

  @VisibleForTesting
  class Plan {

    private Plan() {
      // Not for public consumption
    }

    boolean isUsingDriverService() {
      return remoteHost == null;
    }

    @VisibleForTesting
    URL getRemoteHost() {
      return remoteHost;
    }

    DriverService getDriverService() {
      if (service != null) {
        return service;
      }

      ServiceLoader<DriverService.Builder> allLoaders =
          ServiceLoader.load(DriverService.Builder.class);

      // We need to extract each of the capabilities from the payload.
      return options
          .stream()
          .map(HashMap::new) // Make a copy so we don't alter the original values
          .peek(map -> map.putAll(additionalCapabilities))
          .map(ImmutableCapabilities::new)
          .map(
              caps ->
                  StreamSupport.stream(allLoaders.spliterator(), true)
                      .filter(builder -> builder.score(caps) > 0)
                      .findFirst()
                      .orElse(null))
          .filter(Objects::nonNull)
          .map(
              bs -> {
                try {
                  return bs.build();
                } catch (Throwable e) {
                  return null;
                }
              })
          .filter(Objects::nonNull)
          .findFirst()
          .orElseThrow(() -> new IllegalStateException("Unable to find a driver service"));
    }


    @VisibleForTesting
    void writePayload(JsonOutput out) {
      out.beginObject();

      out.name("capabilities");
      out.beginObject();
      // Try and minimise payload by finding keys that have the same value in every option. This isn't
      // terribly efficient, but we expect the number of entries to be very low in almost every case,
      // so this should be fine.
      Map<String, Object> always = new HashMap<>(options.isEmpty() ? new HashMap<>() : options.get(0));
      for (Map<String, Object> option : options) {
        for (Map.Entry<String, Object> entry : option.entrySet()) {
          if (!always.containsKey(entry.getKey())) {
            continue;
          }

          if (!always.get(entry.getKey()).equals(entry.getValue())) {
            always.remove(entry.getKey());
          }
        }
      }
      always.putAll(additionalCapabilities);

      // Only write alwaysMatch if there are actually things to write
      if (!always.isEmpty()) {
        out.name("alwaysMatch");
        out.beginObject();
        always.forEach((key, value) -> {
          out.name(key);
          out.write(value);
        });
        out.endObject();
      }

      // Only write firstMatch if there are also things to write
      if (!options.isEmpty()) {
        out.name("firstMatch");
        out.beginArray();
        options.forEach(option -> {
          out.beginObject();
          option.entrySet().stream()
              .filter(entry -> !always.containsKey(entry.getKey()))
              .filter(entry -> !additionalCapabilities.containsKey(entry.getKey()))
              .forEach(entry -> {
                out.name(entry.getKey());
                out.write(entry.getValue());
              });
          out.endObject();
        });
        out.endArray();
      }

      out.endObject();  // Close the "capabilities" entry

      metadata.forEach((key, value) -> {
        out.name(key);
        out.write(value);
      });

      out.endObject();
    }
  }

  private static class SpecCompliantExecutor implements CommandExecutor {

    private final CommandCodec<HttpRequest> commandCodec = new W3CHttpCommandCodec();
    private final ResponseCodec<HttpResponse> responseCodec = new W3CHttpResponseCodec();

    private final Supplier<URL> onStart;
    private final Consumer<JsonOutput> writePayload;
    private final Runnable onQuit;
    private HttpClient client;

    public SpecCompliantExecutor(
        Supplier<URL> onStart,
        Consumer<JsonOutput> writePayload,
        Runnable onQuit) {
      this.onStart = onStart;
      this.writePayload = writePayload;
      this.onQuit = onQuit;
    }

    @Override
    public Response execute(Command command) {
      HttpRequest request;

      if (DriverCommand.NEW_SESSION.equals(command.getName())) {
        URL url = onStart.get();
        this.client = HttpClient.Factory.createDefault().createClient(url);

        request = new HttpRequest(POST, "/session");
        request.setHeader("Cache-Control", "none");
        request.setHeader("Content-Type", JSON_UTF_8.toString());
        StringBuilder payload = new StringBuilder();
        try (JsonOutput jsonOutput = new Json().newOutput(payload)) {
          writePayload.accept(jsonOutput);
        }
        request.setContent(utf8String(payload.toString()));
      } else {
        request = commandCodec.encode(command);
      }

      try {
        HttpResponse response = client.execute(request);
        Response decodedResponse = responseCodec.decode(response);

        if (decodedResponse.getSessionId() == null && decodedResponse.getValue() instanceof Map) {
          Map<?, ?> value = (Map<?, ?>) decodedResponse.getValue();
          if (value.get("sessionId") instanceof String) {
            decodedResponse.setSessionId((String) value.get("sessionId"));
          }
        }

        if (decodedResponse.getSessionId() == null && response.getTargetHost() != null) {
          decodedResponse.setSessionId(getSessionId(response.getTargetHost()).orElse(null));
        }

        return decodedResponse;
      } finally {
        if (DriverCommand.QUIT.equals(command.getName())) {
          onQuit.run();
        }
      }
    }
  }
}
