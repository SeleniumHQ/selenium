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
import static java.nio.charset.StandardCharsets.UTF_8;
import static org.openqa.selenium.remote.http.HttpMethod.POST;

import com.google.common.annotations.VisibleForTesting;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;

import org.openqa.selenium.Beta;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.json.JsonOutput;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.http.W3CHttpCommandCodec;
import org.openqa.selenium.remote.http.W3CHttpResponseCodec;
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

@Beta
class RemoteWebDriverBuilder {

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

  public RemoteWebDriverBuilder oneOf(Capabilities... oneOfTheseOptions) {
    options.clear();
    for (int i = 0; i < oneOfTheseOptions.length; i++) {
      addAlternative(oneOfTheseOptions[i]);
    }
    return this;
  }

  public RemoteWebDriverBuilder addAlternative(Capabilities options) {
    Map<String, Object> serialized = validate(Objects.requireNonNull(options));
    this.options.add(serialized);
    return this;
  }

  public RemoteWebDriverBuilder addMetadata(String key, Object value) {
    if (ILLEGAL_METADATA_KEYS.contains(key)) {
      throw new IllegalArgumentException(key + " is a reserved key");
    }
    metadata.put(Objects.requireNonNull(key), Objects.requireNonNull(value));
    return this;
  }

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

  public RemoteWebDriverBuilder url(String url) {
    try {
      return url(new URL(url));
    } catch (MalformedURLException e) {
      throw new UncheckedIOException(e);
    }
  }

  public RemoteWebDriverBuilder url(URL url) {
    this.remoteHost = Objects.requireNonNull(url);
    validateDriverServiceAndUrlConstraint();
    return this;
  }

  public RemoteWebDriver build() {
    if (options.isEmpty()) {
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
              serviceRef.set(plan.getDriverService());
              serviceRef.get().start();
              return serviceRef.get().getUrl();
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

  public RemoteWebDriverBuilder withDriverService(DriverService service) {
    this.service = Objects.requireNonNull(service);
    validateDriverServiceAndUrlConstraint();
    return this;
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
          .map(
              map -> {
                map.putAll(additionalCapabilities);
                return map;
              })
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
      Map<String, Object> always = new HashMap<>(options.get(0));
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

      out.name("alwaysMatch");
      out.beginObject();
      always.forEach((key, value) -> {
        out.name(key);
        out.write(value);
      });
      out.endObject();

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
    public Response execute(Command command) throws IOException {
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
        request.setContent(payload.toString().getBytes(UTF_8));
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
          decodedResponse.setSessionId(HttpSessionId.getSessionId(response.getTargetHost()));
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
