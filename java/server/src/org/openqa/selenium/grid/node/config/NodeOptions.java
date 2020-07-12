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

import com.google.common.collect.HashMultimap;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableMultimap;
import com.google.common.collect.Multimap;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.WebDriverInfo;
import org.openqa.selenium.grid.config.Config;
import org.openqa.selenium.grid.config.ConfigException;
import org.openqa.selenium.grid.node.Node;
import org.openqa.selenium.grid.node.SessionFactory;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.json.JsonOutput;
import org.openqa.selenium.remote.service.DriverService;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.ServiceLoader;
import java.util.function.Function;
import java.util.logging.Logger;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

public class NodeOptions {

  private static final Logger LOG = Logger.getLogger(NodeOptions.class.getName());
  private static final Json JSON = new Json();
  private static final String DEFAULT_IMPL = "org.openqa.selenium.grid.node.local.LocalNodeFactory";

  private final Config config;

  public NodeOptions(Config config) {
    this.config = Require.nonNull("Config", config);
  }

  public Optional<URI> getPublicGridUri() {
    return config.get("node", "grid-url").map(url -> {
      try {
        return new URI(url);
      } catch (URISyntaxException e) {
        throw new ConfigException("Unable to construct public URL: " + url);
      }
    });
  }

  public Node getNode() {
    return config.getClass("node", "implementation", Node.class, DEFAULT_IMPL);
  }

  public Map<Capabilities, Collection<SessionFactory>> getSessionFactories(
    /* Danger! Java stereotype ahead! */ Function<WebDriverInfo, Collection<SessionFactory>> factoryFactory) {

    int maxSessions = Math.min(
      config.getInt("node", "max-concurrent-sessions").orElse(Runtime.getRuntime().availableProcessors()),
      Runtime.getRuntime().availableProcessors());

    Map<WebDriverInfo, Collection<SessionFactory>> allDrivers = discoverDrivers(maxSessions, factoryFactory);

    // If drivers have been specified, use those.
    List<String> drivers = config.getAll("node", "drivers").orElse(new ArrayList<>()).stream()
      .map(String::toLowerCase)
      .collect(Collectors.toList());

    ImmutableMultimap.Builder<Capabilities, SessionFactory> sessionFactories = ImmutableMultimap.builder();

    if (!drivers.isEmpty()) {
      allDrivers.entrySet().stream()
        .filter(entry -> drivers.contains(entry.getKey().getDisplayName().toLowerCase()))
        .sorted(Comparator.comparing(entry -> entry.getKey().getDisplayName().toLowerCase()))
        .peek(this::report)
        .forEach(entry -> sessionFactories.putAll(entry.getKey().getCanonicalCapabilities(), entry.getValue()));

      return sessionFactories.build().asMap();
    }

    if (!config.getBool("node", "detect-drivers").orElse(false)) {
      return sessionFactories.build().asMap();
    }

    allDrivers.entrySet().stream()
      .peek(this::report)
      .forEach(entry -> sessionFactories.putAll(entry.getKey().getCanonicalCapabilities(), entry.getValue()));

    return sessionFactories.build().asMap();
  }

  private Map<WebDriverInfo, Collection<SessionFactory>> discoverDrivers(
    int maxSessions,
    Function<WebDriverInfo, Collection<SessionFactory>> factoryFactory) {

    if (!config.getBool("node", "detect-drivers").orElse(false)) {
      return ImmutableMap.of();
    }

    // We don't expect duplicates, but they're fine
    List<WebDriverInfo> infos =
      StreamSupport.stream(ServiceLoader.load(WebDriverInfo.class).spliterator(), false)
        .filter(WebDriverInfo::isAvailable)
        .sorted(Comparator.comparing(info -> info.getDisplayName().toLowerCase()))
        .collect(Collectors.toList());

    // Same
    List<DriverService.Builder<?, ?>> builders = new ArrayList<>();
    ServiceLoader.load(DriverService.Builder.class).forEach(builders::add);

    Multimap<WebDriverInfo, SessionFactory> toReturn = HashMultimap.create();
    infos.forEach(info -> {
      Capabilities caps = info.getCanonicalCapabilities();
      builders.stream()
        .filter(builder -> builder.score(caps) > 0)
        .forEach(builder -> {
          for (int i = 0; i < Math.min(info.getMaximumSimultaneousSessions(), maxSessions); i++) {
            toReturn.putAll(info, factoryFactory.apply(info));
          }
        });
    });

    return toReturn.asMap();
  }

  private void report(Map.Entry<WebDriverInfo, Collection<SessionFactory>> entry) {
    StringBuilder caps = new StringBuilder();
    try (JsonOutput out = JSON.newOutput(caps)) {
      out.setPrettyPrint(false);
      out.write(entry.getKey().getCanonicalCapabilities());
    }

    LOG.info(String.format(
      "Adding %s for %s %d times",
      entry.getKey().getDisplayName(),
      caps.toString().replaceAll("\\s+", " "),
      entry.getValue().size()));
  }
}
