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
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.WebDriverInfo;
import org.openqa.selenium.grid.config.Config;
import org.openqa.selenium.grid.docker.DockerOptions;
import org.openqa.selenium.grid.log.LoggingOptions;
import org.openqa.selenium.grid.node.Node;
import org.openqa.selenium.grid.node.SessionFactory;
import org.openqa.selenium.grid.node.config.DriverServiceSessionFactory;
import org.openqa.selenium.grid.node.config.NodeOptions;
import org.openqa.selenium.grid.server.BaseServerOptions;
import org.openqa.selenium.grid.server.EventBusOptions;
import org.openqa.selenium.grid.server.NetworkOptions;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.service.DriverService;
import org.openqa.selenium.remote.tracing.Tracer;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.ServiceLoader;

public class LocalNodeFactory {

  public static Node create(Config config) {
    LoggingOptions loggingOptions = new LoggingOptions(config);
    EventBusOptions eventOptions = new EventBusOptions(config);
    BaseServerOptions serverOptions = new BaseServerOptions(config);
    NodeOptions nodeOptions = new NodeOptions(config);
    NetworkOptions networkOptions = new NetworkOptions(config);

    Tracer tracer = loggingOptions.getTracer();
    HttpClient.Factory clientFactory = networkOptions.getHttpClientFactory(tracer);

    LocalNode.Builder builder = LocalNode.builder(
      tracer,
      eventOptions.getEventBus(),
      serverOptions.getExternalUri(),
      nodeOptions.getPublicGridUri().orElseGet(serverOptions::getExternalUri),
      serverOptions.getRegistrationSecret());

    List<DriverService.Builder<?, ?>> builders = new ArrayList<>();
    ServiceLoader.load(DriverService.Builder.class).forEach(builders::add);

    nodeOptions.getSessionFactories(info -> createSessionFactory(tracer, clientFactory, builders, info))
      .forEach((caps, factories) -> factories.forEach(factory -> builder.add(caps, factory)));

    new DockerOptions(config).getDockerSessionFactories(tracer, clientFactory)
      .forEach((caps, factories) -> factories.forEach(factory -> builder.add(caps, factory)));

    return builder.build();
  }

  private static Collection<SessionFactory> createSessionFactory(
    Tracer tracer,
    HttpClient.Factory clientFactory,
    List<DriverService.Builder<?, ?>> builders,
    WebDriverInfo info) {
    ImmutableList.Builder<SessionFactory> toReturn = ImmutableList.builder();

    Capabilities caps = info.getCanonicalCapabilities();

    builders.stream()
      .filter(builder -> builder.score(caps) > 0)
      .forEach(builder -> {
        DriverService.Builder<?, ?> freePortBuilder = builder.usingAnyFreePort();
        toReturn.add(new DriverServiceSessionFactory(
          tracer,
          clientFactory,
          c -> freePortBuilder.score(c) > 0,
          freePortBuilder));
      });

    return toReturn.build();
  }
}
