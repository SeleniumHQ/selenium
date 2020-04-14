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

package org.openqa.selenium.grid.distributor.httpd;

import com.google.auto.service.AutoService;
import com.google.common.collect.ImmutableSet;
import io.opentelemetry.trace.Tracer;
import org.openqa.selenium.BuildInfo;
import org.openqa.selenium.cli.CliCommand;
import org.openqa.selenium.events.EventBus;
import org.openqa.selenium.grid.TemplateGridCommand;
import org.openqa.selenium.grid.config.Config;
import org.openqa.selenium.grid.distributor.Distributor;
import org.openqa.selenium.grid.distributor.local.LocalDistributor;
import org.openqa.selenium.grid.log.LoggingOptions;
import org.openqa.selenium.grid.server.BaseServerFlags;
import org.openqa.selenium.grid.server.BaseServerOptions;
import org.openqa.selenium.grid.server.EventBusFlags;
import org.openqa.selenium.grid.server.EventBusOptions;
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
public class DistributorServer extends TemplateGridCommand {

  private static final Logger LOG = Logger.getLogger(DistributorServer.class.getName());

  @Override
  public String getName() {
    return "distributor";
  }

  @Override
  public String getDescription() {
    return "Adds this server as the distributor in a selenium grid.";
  }

  @Override
  protected Set<Object> getFlagObjects() {
    return ImmutableSet.of(
      new BaseServerFlags(),
      new SessionMapFlags(),
      new EventBusFlags());
  }

  @Override
  protected String getSystemPropertiesConfigPrefix() {
    return "distributor";
  }

  @Override
  protected Config getDefaultConfig() {
    return new DefaultDistributorConfig();
  }

  @Override
  protected void execute(Config config) {
    LoggingOptions loggingOptions = new LoggingOptions(config);
    Tracer tracer = loggingOptions.getTracer();

    EventBusOptions events = new EventBusOptions(config);
    EventBus bus = events.getEventBus();

    NetworkOptions networkOptions = new NetworkOptions(config);
    HttpClient.Factory clientFactory = networkOptions.getHttpClientFactory(tracer);

    SessionMap sessions = new SessionMapOptions(config).getSessionMap();

    BaseServerOptions serverOptions = new BaseServerOptions(config);

    Distributor distributor = new LocalDistributor(
      tracer,
      bus,
      clientFactory,
      sessions,
      serverOptions.getRegistrationSecret());

    Server<?> server = new NettyServer(serverOptions, distributor);
    server.start();

    BuildInfo info = new BuildInfo();
    LOG.info(String.format(
      "Started Selenium distributor %s (revision %s): %s",
      info.getReleaseLabel(),
      info.getBuildRevision(),
      server.getUrl()));
  }
}
