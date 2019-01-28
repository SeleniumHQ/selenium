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

package org.openqa.selenium.grid.router.httpd;

import com.google.auto.service.AutoService;

import com.beust.jcommander.JCommander;
import com.beust.jcommander.ParameterException;

import org.openqa.selenium.cli.CliCommand;
import org.openqa.selenium.grid.config.AnnotatedConfig;
import org.openqa.selenium.grid.config.CompoundConfig;
import org.openqa.selenium.grid.config.ConcatenatingConfig;
import org.openqa.selenium.grid.config.Config;
import org.openqa.selenium.grid.config.EnvConfig;
import org.openqa.selenium.grid.distributor.Distributor;
import org.openqa.selenium.grid.distributor.DistributorOptions;
import org.openqa.selenium.grid.distributor.remote.RemoteDistributor;
import org.openqa.selenium.grid.log.LoggingOptions;
import org.openqa.selenium.grid.node.local.NodeFlags;
import org.openqa.selenium.grid.router.Router;
import org.openqa.selenium.grid.server.BaseServer;
import org.openqa.selenium.grid.server.BaseServerFlags;
import org.openqa.selenium.grid.server.BaseServerOptions;
import org.openqa.selenium.grid.server.HelpFlags;
import org.openqa.selenium.grid.server.Server;
import org.openqa.selenium.grid.server.W3CCommandHandler;
import org.openqa.selenium.grid.sessionmap.SessionMap;
import org.openqa.selenium.grid.sessionmap.SessionMapOptions;
import org.openqa.selenium.grid.sessionmap.remote.RemoteSessionMap;
import org.openqa.selenium.grid.web.Routes;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.tracing.DistributedTracer;
import org.openqa.selenium.remote.tracing.GlobalDistributedTracer;

import java.net.URL;

@AutoService(CliCommand.class)
public class RouterServer implements CliCommand {

  @Override
  public String getName() {
    return "router";
  }

  @Override
  public String getDescription() {
    return "Creates a router to front the selenium grid.";
  }

  @Override
  public Executable configure(String... args) {

    HelpFlags help = new HelpFlags();
    BaseServerFlags serverFlags = new BaseServerFlags(4444);
    NodeFlags nodeFlags = new NodeFlags();

    JCommander commander = JCommander.newBuilder()
        .programName(getName())
        .addObject(help)
        .addObject(serverFlags)
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
          new ConcatenatingConfig("router", '.', System.getProperties()),
          new AnnotatedConfig(help),
          new AnnotatedConfig(serverFlags),
          new AnnotatedConfig(nodeFlags));

      LoggingOptions loggingOptions = new LoggingOptions(config);
      loggingOptions.configureLogging();
      DistributedTracer tracer = loggingOptions.getTracer();
      GlobalDistributedTracer.setInstance(tracer);

      SessionMapOptions sessionsOptions = new SessionMapOptions(config);
      URL sessionMapUrl = sessionsOptions.getSessionMapUri().toURL();

      HttpClient.Factory clientFactory = HttpClient.Factory.createDefault();

      SessionMap sessions = new RemoteSessionMap(
          clientFactory.createClient(sessionMapUrl));

      BaseServerOptions serverOptions = new BaseServerOptions(config);

      DistributorOptions distributorOptions = new DistributorOptions(config);
      URL distributorUrl = distributorOptions.getDistributorUri().toURL();
      Distributor distributor = new RemoteDistributor(
          tracer,
          clientFactory,
          distributorUrl);

      Router router = new Router(tracer, clientFactory, sessions, distributor);

      Server<?> server = new BaseServer<>(serverOptions);
      server.addRoute(Routes.matching(router).using(router).decorateWith(W3CCommandHandler.class));
      server.start();
    };
  }
}
