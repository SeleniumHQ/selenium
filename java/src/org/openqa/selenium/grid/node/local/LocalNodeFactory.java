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

package org.openqa.selenium.grid.node.local;

import com.google.common.collect.ImmutableList;
import java.io.File;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.List;
import java.util.ServiceLoader;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.grid.config.Config;
import org.openqa.selenium.grid.data.SlotMatcher;
import org.openqa.selenium.grid.log.LoggingOptions;
import org.openqa.selenium.grid.node.Node;
import org.openqa.selenium.grid.node.SessionFactory;
import org.openqa.selenium.grid.node.config.DriverServiceSessionFactory;
import org.openqa.selenium.grid.node.config.NodeOptions;
import org.openqa.selenium.grid.node.docker.DockerOptions;
import org.openqa.selenium.grid.node.relay.RelayOptions;
import org.openqa.selenium.grid.security.SecretOptions;
import org.openqa.selenium.grid.server.BaseServerOptions;
import org.openqa.selenium.grid.server.EventBusOptions;
import org.openqa.selenium.grid.server.NetworkOptions;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.service.DriverService;
import org.openqa.selenium.remote.tracing.Tracer;

public class LocalNodeFactory {

  public static Node create(Config config) {
    LoggingOptions loggingOptions = new LoggingOptions(config);
    EventBusOptions eventOptions = new EventBusOptions(config);
    BaseServerOptions serverOptions = new BaseServerOptions(config);
    NodeOptions nodeOptions = new NodeOptions(config);
    NetworkOptions networkOptions = new NetworkOptions(config);
    SecretOptions secretOptions = new SecretOptions(config);

    Tracer tracer = loggingOptions.getTracer();
    HttpClient.Factory clientFactory = networkOptions.getHttpClientFactory(tracer);

    Duration sessionTimeout = nodeOptions.getSessionTimeout();
    LocalNode.Builder builder =
        LocalNode.builder(
                tracer,
                eventOptions.getEventBus(),
                serverOptions.getExternalUri(),
                nodeOptions.getPublicGridUri().orElseGet(serverOptions::getExternalUri),
                secretOptions.getRegistrationSecret())
            .maximumConcurrentSessions(nodeOptions.getMaxSessions())
            .sessionTimeout(sessionTimeout)
            .drainAfterSessionCount(nodeOptions.getDrainAfterSessionCount())
            .enableCdp(nodeOptions.isCdpEnabled())
            .enableBiDi(nodeOptions.isBiDiEnabled())
            .enableManagedDownloads(nodeOptions.isManagedDownloadsEnabled())
            .heartbeatPeriod(nodeOptions.getHeartbeatPeriod());

    List<DriverService.Builder<?, ?>> builders = new ArrayList<>();
    ServiceLoader.load(DriverService.Builder.class).forEach(builders::add);

    nodeOptions
        .getSessionFactories(
            caps ->
                createSessionFactory(
                    tracer,
                    clientFactory,
                    sessionTimeout,
                    builders,
                    caps,
                    nodeOptions.getSlotMatcher()))
        .forEach((caps, factories) -> factories.forEach(factory -> builder.add(caps, factory)));

    if (config.getAll("docker", "configs").isPresent()) {
      new DockerOptions(config)
          .getDockerSessionFactories(tracer, clientFactory, nodeOptions)
          .forEach((caps, factories) -> factories.forEach(factory -> builder.add(caps, factory)));
    }

    if (config.getAll("relay", "configs").isPresent()) {
      new RelayOptions(config)
          .getSessionFactories(tracer, clientFactory, sessionTimeout)
          .forEach((caps, factories) -> factories.forEach(factory -> builder.add(caps, factory)));
    }

    return builder.build();
  }

  private static Collection<SessionFactory> createSessionFactory(
      Tracer tracer,
      HttpClient.Factory clientFactory,
      Duration sessionTimeout,
      List<DriverService.Builder<?, ?>> builders,
      ImmutableCapabilities stereotype,
      SlotMatcher slotMatcher) {
    ImmutableList.Builder<SessionFactory> toReturn = ImmutableList.builder();
    String webDriverExecutablePath =
        String.valueOf(stereotype.asMap().getOrDefault("se:webDriverExecutable", ""));

    builders.stream()
        .filter(builder -> builder.score(stereotype) > 0)
        .max(Comparator.comparingInt(builder -> builder.score(stereotype)))
        .ifPresent(
            builder -> {
              DriverService.Builder<?, ?> driverServiceBuilder;
              Class<?> clazz = builder.getClass();
              try {
                // We do this to give each Node slot its own instance of the DriverService.Builder.
                // This is important because the Node processes many new session requests
                // and the DriverService creation needs to be thread safe.
                Object driverBuilder = clazz.newInstance();
                driverServiceBuilder =
                    ((DriverService.Builder<?, ?>) driverBuilder).usingAnyFreePort();
                if (!webDriverExecutablePath.isEmpty()) {
                  driverServiceBuilder =
                      driverServiceBuilder.usingDriverExecutable(new File(webDriverExecutablePath));
                }
              } catch (InstantiationException | IllegalAccessException e) {
                throw new IllegalArgumentException(
                    String.format("Class %s could not be found or instantiated", clazz));
              }
              toReturn.add(
                  new DriverServiceSessionFactory(
                      tracer,
                      clientFactory,
                      sessionTimeout,
                      stereotype,
                      capabilities -> slotMatcher.matches(stereotype, capabilities),
                      driverServiceBuilder));
            });

    return toReturn.build();
  }
}
