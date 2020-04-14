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
import org.openqa.selenium.grid.router.Router;
import org.openqa.selenium.grid.server.BaseServerFlags;
import org.openqa.selenium.grid.server.BaseServerOptions;
import org.openqa.selenium.grid.server.EventBusFlags;
import org.openqa.selenium.grid.server.EventBusOptions;
import org.openqa.selenium.grid.server.NetworkOptions;
import org.openqa.selenium.grid.server.Server;
import org.openqa.selenium.grid.sessionmap.SessionMap;
import org.openqa.selenium.grid.sessionmap.local.LocalSessionMap;
import org.openqa.selenium.grid.web.CombinedHandler;
import org.openqa.selenium.grid.web.RoutableHttpClientFactory;
import org.openqa.selenium.netty.server.NettyServer;
import org.openqa.selenium.remote.http.HttpClient;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.Set;
import java.util.logging.Logger;

@AutoService(CliCommand.class)
public class Hub extends TemplateGridCommand {

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
  protected Set<Object> getFlagObjects() {
    return ImmutableSet.of(
      new BaseServerFlags(),
      new EventBusFlags());
  }

  @Override
  protected String getSystemPropertiesConfigPrefix() {
    return "selenium";
  }

  @Override
  protected Config getDefaultConfig() {
    return new DefaultHubConfig();
  }

  @Override
  protected void execute(Config config) {
    LoggingOptions loggingOptions = new LoggingOptions(config);
    Tracer tracer = loggingOptions.getTracer();

    EventBusOptions events = new EventBusOptions(config);
    EventBus bus = events.getEventBus();

    CombinedHandler handler = new CombinedHandler();

    SessionMap sessions = new LocalSessionMap(tracer, bus);
    handler.addHandler(sessions);

    BaseServerOptions serverOptions = new BaseServerOptions(config);

    URL externalUrl;
    try {
      externalUrl = serverOptions.getExternalUri().toURL();
    } catch (MalformedURLException e) {
      throw new IllegalArgumentException(e);
    }

    NetworkOptions networkOptions = new NetworkOptions(config);
    HttpClient.Factory clientFactory = new RoutableHttpClientFactory(
      externalUrl,
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
  }
}
