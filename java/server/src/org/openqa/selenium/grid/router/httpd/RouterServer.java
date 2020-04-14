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
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;
import io.opentelemetry.trace.Tracer;
import org.openqa.selenium.BuildInfo;
import org.openqa.selenium.cli.CliCommand;
import org.openqa.selenium.grid.TemplateGridCommand;
import org.openqa.selenium.grid.config.Config;
import org.openqa.selenium.grid.config.MapConfig;
import org.openqa.selenium.grid.distributor.Distributor;
import org.openqa.selenium.grid.distributor.config.DistributorFlags;
import org.openqa.selenium.grid.distributor.config.DistributorOptions;
import org.openqa.selenium.grid.log.LoggingOptions;
import org.openqa.selenium.grid.router.Router;
import org.openqa.selenium.grid.server.BaseServerFlags;
import org.openqa.selenium.grid.server.BaseServerOptions;
import org.openqa.selenium.grid.server.NetworkOptions;
import org.openqa.selenium.grid.server.Server;
import org.openqa.selenium.grid.sessionmap.SessionMap;
import org.openqa.selenium.grid.sessionmap.config.SessionMapFlags;
import org.openqa.selenium.grid.sessionmap.config.SessionMapOptions;
import org.openqa.selenium.netty.server.NettyServer;
import org.openqa.selenium.remote.http.HttpClient;

import java.util.Set;
import java.util.logging.Logger;

@AutoService(CliCommand.class)
public class RouterServer extends TemplateGridCommand {

  private static final Logger LOG = Logger.getLogger(RouterServer.class.getName());

  @Override
  public String getName() {
    return "router";
  }

  @Override
  public String getDescription() {
    return "Creates a router to front the selenium grid.";
  }

  @Override
  protected Set<Object> getFlagObjects() {
    return ImmutableSet.of(
      new BaseServerFlags(),
      new SessionMapFlags(),
      new DistributorFlags());
  }

  @Override
  protected String getSystemPropertiesConfigPrefix() {
    return "router";
  }

  @Override
  protected Config getDefaultConfig() {
    return new MapConfig(ImmutableMap.of("server", ImmutableMap.of("port", 4444)));
  }

  @Override
  protected void execute(Config config) {
    LoggingOptions loggingOptions = new LoggingOptions(config);
    Tracer tracer = loggingOptions.getTracer();

    NetworkOptions networkOptions = new NetworkOptions(config);
    HttpClient.Factory clientFactory = networkOptions.getHttpClientFactory(tracer);

    SessionMapOptions sessionsOptions = new SessionMapOptions(config);
    SessionMap sessions = sessionsOptions.getSessionMap();

    BaseServerOptions serverOptions = new BaseServerOptions(config);

    DistributorOptions distributorOptions = new DistributorOptions(config);
    Distributor distributor = distributorOptions.getDistributor(tracer, clientFactory);

    Router router = new Router(tracer, clientFactory, sessions, distributor);

    Server<?> server = new NettyServer(serverOptions, router);
    server.start();

    BuildInfo info = new BuildInfo();
    LOG.info(String.format(
      "Started Selenium router %s (revision %s): %s",
      info.getReleaseLabel(),
      info.getBuildRevision(),
      server.getUrl()));
  }
}
