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
import io.opentelemetry.trace.Tracer;
import org.openqa.selenium.BuildInfo;
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
import org.openqa.selenium.grid.router.Router;
import org.openqa.selenium.grid.server.BaseServerFlags;
import org.openqa.selenium.grid.server.BaseServerOptions;
import org.openqa.selenium.grid.server.EventBusFlags;
import org.openqa.selenium.grid.server.EventBusOptions;
import org.openqa.selenium.grid.server.HelpFlags;
import org.openqa.selenium.grid.server.NetworkOptions;
import org.openqa.selenium.grid.server.Server;
import org.openqa.selenium.grid.sessionmap.SessionMap;
import org.openqa.selenium.grid.sessionmap.local.LocalSessionMap;
import org.openqa.selenium.grid.web.CombinedHandler;
import org.openqa.selenium.grid.web.RoutableHttpClientFactory;
import org.openqa.selenium.netty.server.NettyServer;
import org.openqa.selenium.remote.http.HttpClient;

import java.util.logging.Logger;

@AutoService(CliCommand.class)
public class Hub implements CliCommand {

  private static final Logger LOG = Logger.getLogger(Hub.class.getName());

  @Override
  public String getName() {
    return "hub";
  }

  @Override
  public String getDescription() {
    return "A grid hub, composed of sessions, distributor, and router.";
  }

  @Override
  public Executable configure(String... args) {
    HelpFlags help = new HelpFlags();
    BaseServerFlags baseFlags = new BaseServerFlags(4444);
    EventBusFlags eventBusFlags = new EventBusFlags();

    JCommander commander = JCommander.newBuilder()
        .programName("standalone")
        .addObject(baseFlags)
        .addObject(eventBusFlags)
        .addObject(help)
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
          new AnnotatedConfig(eventBusFlags),
          new AnnotatedConfig(baseFlags),
          new DefaultHubConfig());

      LoggingOptions loggingOptions = new LoggingOptions(config);
      loggingOptions.configureLogging();
      Tracer tracer = loggingOptions.getTracer();

      EventBusOptions events = new EventBusOptions(config);
      EventBus bus = events.getEventBus();

      CombinedHandler handler = new CombinedHandler();

      SessionMap sessions = new LocalSessionMap(tracer, bus);
      handler.addHandler(sessions);

      BaseServerOptions serverOptions = new BaseServerOptions(config);

      NetworkOptions networkOptions = new NetworkOptions(config);
      HttpClient.Factory clientFactory = new RoutableHttpClientFactory(
          serverOptions.getExternalUri().toURL(),
          handler,
          networkOptions.getHttpClientFactory(tracer));

      Distributor distributor = new LocalDistributor(
          tracer,
          bus,
          clientFactory,
          sessions,
          null);
      handler.addHandler(distributor);
      Router router = new Router(tracer, clientFactory, sessions, distributor);

      Server<?> server = new NettyServer(serverOptions, router);
      server.start();

      BuildInfo info = new BuildInfo();
      LOG.info(String.format(
        "Started Selenium hub %s (revision %s): %s",
        info.getReleaseLabel(),
        info.getBuildRevision(),
        server.getUrl()));
    };
  }
}
