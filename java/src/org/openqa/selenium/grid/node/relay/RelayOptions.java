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

import static org.openqa.selenium.remote.http.Contents.string;
import static org.openqa.selenium.remote.http.HttpMethod.GET;

import com.google.common.collect.HashMultimap;
import com.google.common.collect.ImmutableMultimap;
import com.google.common.collect.Multimap;
import java.net.URI;
import java.net.URISyntaxException;
import java.time.Duration;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.logging.Logger;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.grid.config.Config;
import org.openqa.selenium.grid.config.ConfigException;
import org.openqa.selenium.grid.node.SessionFactory;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.tracing.Tracer;

public class RelayOptions {

  static final String RELAY_SECTION = "relay";
  private static final Logger LOG = Logger.getLogger(RelayOptions.class.getName());
  private static final Json JSON = new Json();
  private final Config config;

  public RelayOptions(Config config) {
    this.config = Require.nonNull("Config", config);
  }

  public URI getServiceUri() {
    try {
      Optional<String> possibleUri = config.get(RELAY_SECTION, "url");
      if (possibleUri.isPresent()) {
        return new URI(possibleUri.get());
      }

      Optional<String> possibleHost = config.get(RELAY_SECTION, "host");
      Optional<Integer> possiblePort = config.getInt(RELAY_SECTION, "port");
      if (possibleHost.isPresent() && possiblePort.isPresent()) {
        String host = possibleHost.get();
        int port = possiblePort.get();
        if (!host.startsWith("http")) {
          host = String.format("http://%s:%s", host, port);
        } else {
          host = String.format("%s:%s", host, port);
        }
        URI uri = new URI(host);
        return new URI(
            uri.getScheme(),
            uri.getUserInfo(),
            uri.getHost(),
            uri.getPort(),
            uri.getPath(),
            null,
            null);
      }
      throw new ConfigException("Unable to determine the service url");
    } catch (URISyntaxException e) {
      throw new ConfigException("Unable to determine the service url", e);
    }
  }

  public URI getServiceStatusUri() {
    try {
      if (!config.get(RELAY_SECTION, "status-endpoint").isPresent()) {
        return null;
      }
      String statusEndpoint = config.get(RELAY_SECTION, "status-endpoint").orElse("/status");
      if (!statusEndpoint.startsWith("/")) {
        statusEndpoint = "/" + statusEndpoint;
      }
      URI serviceUri = getServiceUri();
      return new URI(serviceUri.toString() + statusEndpoint);
    } catch (URISyntaxException e) {
      throw new ConfigException("Unable to determine the service status url", e);
    }
  }

  // Method being used in SessionSlot
  @SuppressWarnings("unused")
  private boolean isServiceUp(HttpClient client) {
    URI serviceStatusUri = getServiceStatusUri();
    if (serviceStatusUri == null) {
      // If no status endpoint was configured, we assume the server is up.
      return true;
    }
    try {
      HttpResponse response = client.execute(new HttpRequest(GET, serviceStatusUri.toString()));
      LOG.fine(string(response));
      return 200 == response.getStatus();
    } catch (Exception e) {
      throw new ConfigException("Unable to reach the service at " + getServiceUri(), e);
    }
  }

  public Map<Capabilities, Collection<SessionFactory>> getSessionFactories(
      Tracer tracer, HttpClient.Factory clientFactory, Duration sessionTimeout) {

    List<String> allConfigs =
        config
            .getAll(RELAY_SECTION, "configs")
            .orElseThrow(
                () -> new ConfigException("Unable to find configs for " + getServiceUri()));

    Multimap<Integer, Capabilities> parsedConfigs = HashMultimap.create();
    for (int i = 0; i < allConfigs.size(); i++) {
      int maxSessions;
      try {
        maxSessions = Integer.parseInt(extractConfiguredValue(allConfigs.get(i)));
      } catch (NumberFormatException e) {
        throw new ConfigException("Unable parse value as number. " + allConfigs.get(i));
      }
      i++;
      if (i == allConfigs.size()) {
        throw new ConfigException("Unable to find stereotype config. " + allConfigs);
      }
      Capabilities stereotype =
          JSON.toType(extractConfiguredValue(allConfigs.get(i)), Capabilities.class);
      parsedConfigs.put(maxSessions, stereotype);
    }

    ImmutableMultimap.Builder<Capabilities, SessionFactory> factories = ImmutableMultimap.builder();
    LOG.info(String.format("Adding relay configs for %s", getServiceUri()));
    parsedConfigs.forEach(
        (maxSessions, stereotype) -> {
          for (int i = 0; i < maxSessions; i++) {
            factories.put(
                stereotype,
                new RelaySessionFactory(
                    tracer,
                    clientFactory,
                    sessionTimeout,
                    getServiceUri(),
                    getServiceStatusUri(),
                    stereotype));
          }
          LOG.info(String.format("Mapping %s, %d times", stereotype, maxSessions));
        });
    return factories.build().asMap();
  }

  private String extractConfiguredValue(String keyValue) {
    if (keyValue.contains("=")) {
      return keyValue.substring(keyValue.indexOf("=") + 1);
    }
    return keyValue;
  }
}
