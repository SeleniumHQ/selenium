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

package org.openqa.selenium.grid.commands;

import com.beust.jcommander.JCommander;
import com.beust.jcommander.ParameterException;
import com.google.auto.service.AutoService;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.cli.CliCommand;
import org.openqa.selenium.events.EventBus;
import org.openqa.selenium.grid.config.AnnotatedConfig;
import org.openqa.selenium.grid.config.CompoundConfig;
import org.openqa.selenium.grid.config.ConcatenatingConfig;
import org.openqa.selenium.grid.config.Config;
import org.openqa.selenium.grid.config.EnvConfig;
import org.openqa.selenium.grid.distributor.Distributor;
import org.openqa.selenium.grid.distributor.local.LocalDistributor;
import org.openqa.selenium.grid.docker.DockerFlags;
import org.openqa.selenium.grid.docker.DockerOptions;
import org.openqa.selenium.grid.log.LoggingOptions;
import org.openqa.selenium.grid.node.Node;
import org.openqa.selenium.grid.node.config.NodeOptions;
import org.openqa.selenium.grid.node.local.LocalNode;
import org.openqa.selenium.grid.router.Router;
import org.openqa.selenium.grid.server.BaseServer;
import org.openqa.selenium.grid.server.BaseServerFlags;
import org.openqa.selenium.grid.server.BaseServerOptions;
import org.openqa.selenium.grid.server.EventBusConfig;
import org.openqa.selenium.grid.server.EventBusFlags;
import org.openqa.selenium.grid.server.HelpFlags;
import org.openqa.selenium.grid.server.Server;
import org.openqa.selenium.grid.sessionmap.SessionMap;
import org.openqa.selenium.grid.sessionmap.local.LocalSessionMap;
import org.openqa.selenium.grid.web.CombinedHandler;
import org.openqa.selenium.grid.web.RoutableHttpClientFactory;
import org.openqa.selenium.net.NetworkUtils;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.tracing.DistributedTracer;
import org.openqa.selenium.remote.tracing.GlobalDistributedTracer;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.logging.Logger;

@AutoService(CliCommand.class)
public class Standalone implements CliCommand {

  public static final Logger LOG = Logger.getLogger("selenium");

  @Override
  public String getName() {
    return "standalone";
  }

  @Override
  public String getDescription() {
    return "The selenium server, running everything in-process.";
  }

  @Override
  public Executable configure(String... args) {
    HelpFlags help = new HelpFlags();
    BaseServerFlags baseFlags = new BaseServerFlags(4444);
    EventBusFlags eventFlags = new EventBusFlags();
    DockerFlags dockerFlags = new DockerFlags();
    StandaloneFlags standaloneFlags = new StandaloneFlags();

    JCommander commander = JCommander.newBuilder()
        .programName("standalone")
        .addObject(baseFlags)
        .addObject(help)
        .addObject(eventFlags)
        .addObject(dockerFlags)
        .addObject(standaloneFlags)
        .build();

    return () -> {
      try {
        commander.parse(args);
      } catch (ParameterException e) {
        System.err.println(e.getMessage());
        commander.usage();
        return;
      }

      if (help.displayHelp(commander, System.out)) {
        return;
      }

      Config config = new CompoundConfig(
          new EnvConfig(),
          new ConcatenatingConfig("selenium", '.', System.getProperties()),
          new AnnotatedConfig(help),
          new AnnotatedConfig(baseFlags),
          new AnnotatedConfig(dockerFlags),
          new AnnotatedConfig(standaloneFlags),
          new AnnotatedConfig(eventFlags),
          new DefaultStandaloneConfig());

      LoggingOptions loggingOptions = new LoggingOptions(config);
      loggingOptions.configureLogging();

      LOG.info("Logging configured.");

      DistributedTracer tracer = loggingOptions.getTracer();
      LOG.info("Using tracer: " + tracer);
      GlobalDistributedTracer.setInstance(tracer);

      EventBusConfig events = new EventBusConfig(config);
      EventBus bus = events.getEventBus();

      String hostName;
      try {
        hostName = new NetworkUtils().getNonLoopbackAddressOfThisMachine();
      } catch (WebDriverException e) {
        hostName = "localhost";
      }

      int port = config.getInt("server", "port")
          .orElseThrow(() -> new IllegalArgumentException("No port to use configured"));
      URI localhost = null;
      try {
        localhost = new URI("http", null, hostName, port, null, null, null);
      } catch (URISyntaxException e) {
        throw new RuntimeException(e);
      }

      CombinedHandler combinedHandler = new CombinedHandler();
      HttpClient.Factory clientFactory = new RoutableHttpClientFactory(
        localhost.toURL(),
        combinedHandler,
        HttpClient.Factory.createDefault());

      SessionMap sessions = new LocalSessionMap(tracer, bus);
      combinedHandler.addHandler(sessions);
      Distributor distributor = new LocalDistributor(tracer, bus, clientFactory, sessions);
      combinedHandler.addHandler(distributor);
      Router router = new Router(tracer, clientFactory, sessions, distributor);

      LocalNode.Builder nodeBuilder = LocalNode.builder(
          tracer,
          bus,
          clientFactory,
          localhost)
          .maximumConcurrentSessions(Runtime.getRuntime().availableProcessors() * 3);

      new NodeOptions(config).configure(clientFactory, nodeBuilder);
      new DockerOptions(config).configure(clientFactory, nodeBuilder);

      Node node = nodeBuilder.build();
      combinedHandler.addHandler(node);
      distributor.add(node);

      Server<?> server = new BaseServer<>(new BaseServerOptions(config));
      server.setHandler(router);
      server.start();
    };
  }
}
