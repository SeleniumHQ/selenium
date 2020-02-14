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
import com.google.common.collect.ImmutableMap;
import com.google.common.net.MediaType;
import org.openqa.selenium.BuildInfo;
import org.openqa.selenium.cli.CliCommand;
import org.openqa.selenium.events.EventBus;
import org.openqa.selenium.grid.config.AnnotatedConfig;
import org.openqa.selenium.grid.config.CompoundConfig;
import org.openqa.selenium.grid.config.ConcatenatingConfig;
import org.openqa.selenium.grid.config.Config;
import org.openqa.selenium.grid.config.EnvConfig;
import org.openqa.selenium.grid.config.MapConfig;
import org.openqa.selenium.grid.log.LoggingOptions;
import org.openqa.selenium.grid.server.BaseServerFlags;
import org.openqa.selenium.grid.server.BaseServerOptions;
import org.openqa.selenium.grid.server.EventBusFlags;
import org.openqa.selenium.grid.server.EventBusOptions;
import org.openqa.selenium.grid.server.HelpFlags;
import org.openqa.selenium.grid.server.Server;
import org.openqa.selenium.netty.server.NettyServer;
import org.openqa.selenium.remote.http.Contents;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.http.Route;

import java.util.logging.Logger;

@AutoService(CliCommand.class)
public class MessageBusCommand implements CliCommand {
  private static final Logger LOG = Logger.getLogger(MessageBusCommand.class.getName());

  @Override
  public String getName() {
    return "message-bus";
  }

  @Override
  public String getDescription() {
    return "Standalone instance of the message bus.";
  }

  @Override
  public boolean isShown() {
    return false;
  }

  @Override
  public Executable configure(String... args) {
    HelpFlags help = new HelpFlags();
    BaseServerFlags baseFlags = new BaseServerFlags(5557);
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
        new ConcatenatingConfig("message-bus", '.', System.getProperties()),
        new AnnotatedConfig(help),
        new AnnotatedConfig(eventBusFlags),
        new AnnotatedConfig(baseFlags),
        new MapConfig(ImmutableMap.of(
          "events", ImmutableMap.of(
            "bind", true,
            "publish", "tcp://*:4442",
            "subscribe", "tcp://*:4443"))));

      LoggingOptions loggingOptions = new LoggingOptions(config);
      loggingOptions.configureLogging();

      EventBusOptions events = new EventBusOptions(config);
      // We need this reference to stop the bus being garbage collected. Which would be less than ideal.
      EventBus bus = events.getEventBus();

      BaseServerOptions serverOptions = new BaseServerOptions(config);

      Server<?> server = new NettyServer(
        serverOptions,
        Route.get("/status").to(() -> req ->
          new HttpResponse()
            .addHeader("Content-Type", MediaType.JSON_UTF_8.toString())
            .setContent(Contents.asJson(ImmutableMap.of("ready", true, "message", "Event bus running")))));
      server.start();

      BuildInfo info = new BuildInfo();
      LOG.info(String.format("Started Selenium message bus %s (revision %s)", info.getReleaseLabel(), info.getBuildRevision()));

      // If we exit, the bus goes out of scope, and it's closed
      Thread.currentThread().join();

      LOG.info("Shutting down: " + bus);
    };
  }
}
