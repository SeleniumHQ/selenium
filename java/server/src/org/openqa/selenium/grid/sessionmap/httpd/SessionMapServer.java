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

package org.openqa.selenium.grid.sessionmap.httpd;

import com.beust.jcommander.JCommander;
import com.beust.jcommander.ParameterException;
import com.google.auto.service.AutoService;
import com.google.common.collect.ImmutableMap;
import com.google.common.net.MediaType;
import io.opentelemetry.trace.Tracer;
import org.openqa.selenium.BuildInfo;
import org.openqa.selenium.cli.CliCommand;
import org.openqa.selenium.events.EventBus;
import org.openqa.selenium.grid.config.AnnotatedConfig;
import org.openqa.selenium.grid.config.CompoundConfig;
import org.openqa.selenium.grid.config.ConcatenatingConfig;
import org.openqa.selenium.grid.config.Config;
import org.openqa.selenium.grid.config.EnvConfig;
import org.openqa.selenium.grid.log.LoggingOptions;
import org.openqa.selenium.grid.server.BaseServerFlags;
import org.openqa.selenium.grid.server.BaseServerOptions;
import org.openqa.selenium.grid.server.EventBusFlags;
import org.openqa.selenium.grid.server.EventBusOptions;
import org.openqa.selenium.grid.server.HelpFlags;
import org.openqa.selenium.grid.server.Server;
import org.openqa.selenium.grid.sessionmap.SessionMap;
import org.openqa.selenium.grid.sessionmap.config.SessionMapOptions;
import org.openqa.selenium.grid.sessionmap.local.LocalSessionMap;
import org.openqa.selenium.netty.server.NettyServer;
import org.openqa.selenium.remote.http.Contents;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.http.Route;

import java.util.logging.Logger;

import static org.openqa.selenium.remote.http.Route.get;

@AutoService(CliCommand.class)
public class SessionMapServer implements CliCommand {

  private static final Logger LOG = Logger.getLogger(SessionMapServer.class.getName());

  @Override
  public String getName() {
    return "sessions";
  }

  @Override
  public String getDescription() {
    return "Adds this server as the session map in a selenium grid.";
  }

  @Override
  public Executable configure(String... args) {

    HelpFlags help = new HelpFlags();
    BaseServerFlags serverFlags = new BaseServerFlags(5556);
    EventBusFlags eventBusFlags = new EventBusFlags();

    JCommander commander = JCommander.newBuilder()
        .programName(getName())
        .addObject(help)
        .addObject(serverFlags)
        .addObject(eventBusFlags)
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
          new ConcatenatingConfig("sessions", '.', System.getProperties()),
          new AnnotatedConfig(help),
          new AnnotatedConfig(serverFlags),
          new AnnotatedConfig(eventBusFlags),
          new DefaultSessionMapConfig());

      LoggingOptions loggingOptions = new LoggingOptions(config);
      loggingOptions.configureLogging();
      Tracer tracer = loggingOptions.getTracer();

      EventBusOptions events = new EventBusOptions(config);
      EventBus bus = events.getEventBus();

      SessionMapOptions sessionMapOptions = new SessionMapOptions(config);
      SessionMap sessions = sessionMapOptions.getSessionMap();

      BaseServerOptions serverOptions = new BaseServerOptions(config);

      Server<?> server = new NettyServer(serverOptions, Route.combine(
        sessions,
        get("/status").to(() -> req ->
          new HttpResponse()
            .addHeader("Content-Type", MediaType.JSON_UTF_8.toString())
            .setContent(Contents.asJson(ImmutableMap.of("ready", true, "message", "Session map is ready."))))));
      server.start();

      BuildInfo info = new BuildInfo();
      LOG.info(String.format(
        "Started Selenium session map %s (revision %s): %s",
        info.getReleaseLabel(),
        info.getBuildRevision(),
        server.getUrl()));
    };
  }
}
