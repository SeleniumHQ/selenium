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

import com.google.auto.service.AutoService;

import com.beust.jcommander.JCommander;
import com.beust.jcommander.ParameterException;

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
import org.openqa.selenium.grid.log.LoggingOptions;
import org.openqa.selenium.grid.node.local.LocalNode;
import org.openqa.selenium.grid.node.local.NodeFlags;
import org.openqa.selenium.grid.router.Router;
import org.openqa.selenium.grid.server.BaseServer;
import org.openqa.selenium.grid.server.BaseServerFlags;
import org.openqa.selenium.grid.server.BaseServerOptions;
import org.openqa.selenium.grid.server.EventBusConfig;
import org.openqa.selenium.grid.server.EventBusFlags;
import org.openqa.selenium.grid.server.HelpFlags;
import org.openqa.selenium.grid.server.Server;
import org.openqa.selenium.grid.server.W3CCommandHandler;
import org.openqa.selenium.grid.sessionmap.SessionMap;
import org.openqa.selenium.grid.sessionmap.local.LocalSessionMap;
import org.openqa.selenium.grid.web.Routes;
import org.openqa.selenium.net.NetworkUtils;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.tracing.DistributedTracer;
import org.openqa.selenium.remote.tracing.GlobalDistributedTracer;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.logging.Logger;

@AutoService(CliCommand.class)
public class Standalone implements CliCommand {

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
    NodeFlags nodeFlags = new NodeFlags();

    JCommander commander = JCommander.newBuilder()
        .programName("standalone")
        .addObject(baseFlags)
        .addObject(help)
        .addObject(eventFlags)
        .addObject(nodeFlags)
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
          new AnnotatedConfig(eventFlags),
          new DefaultStandaloneConfig());

      LoggingOptions loggingOptions = new LoggingOptions(config);
      loggingOptions.configureLogging();

      Logger.getLogger("selenium").info("Logging configured.");

      DistributedTracer tracer = loggingOptions.getTracer();
      GlobalDistributedTracer.setInstance(tracer);

      EventBusConfig events = new EventBusConfig(config);
      EventBus bus = events.getEventBus();

      HttpClient.Factory clientFactory = HttpClient.Factory.createDefault();

      SessionMap sessions = new LocalSessionMap(tracer, bus);
      Distributor distributor = new LocalDistributor(tracer, bus, clientFactory);
      Router router = new Router(tracer, clientFactory, sessions, distributor);

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

      LocalNode.Builder node = LocalNode.builder(
          tracer,
          bus,
          clientFactory,
          localhost,
          sessions)
          .maximumConcurrentSessions(Runtime.getRuntime().availableProcessors() * 3);
      nodeFlags.configure(clientFactory, node);

      distributor.add(node.build());

      Server<?> server = new BaseServer<>(new BaseServerOptions(config));
      server.addRoute(Routes.matching(router).using(router).decorateWith(W3CCommandHandler.class));
      server.start();
    };
  }
}
