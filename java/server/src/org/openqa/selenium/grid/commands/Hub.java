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
import org.openqa.selenium.BuildInfo;
import org.openqa.selenium.cli.CliCommand;
import org.openqa.selenium.events.EventBus;
import org.openqa.selenium.grid.TemplateGridServerCommand;
import org.openqa.selenium.grid.config.Config;
import org.openqa.selenium.grid.config.Role;
import org.openqa.selenium.grid.distributor.Distributor;
import org.openqa.selenium.grid.distributor.local.LocalDistributor;
import org.openqa.selenium.grid.graphql.GraphqlHandler;
import org.openqa.selenium.grid.log.LoggingOptions;
import org.openqa.selenium.grid.router.ProxyCdpIntoGrid;
import org.openqa.selenium.grid.router.Router;
import org.openqa.selenium.grid.security.SecretOptions;
import org.openqa.selenium.grid.server.BaseServerOptions;
import org.openqa.selenium.grid.server.EventBusOptions;
import org.openqa.selenium.grid.server.NetworkOptions;
import org.openqa.selenium.grid.server.Server;
import org.openqa.selenium.grid.sessionmap.SessionMap;
import org.openqa.selenium.grid.sessionmap.local.LocalSessionMap;

import org.openqa.selenium.grid.web.ClassPathResource;

import org.openqa.selenium.grid.sessionqueue.NewSessionQueue;
import org.openqa.selenium.grid.sessionqueue.NewSessionQueuer;
import org.openqa.selenium.grid.sessionqueue.config.NewSessionQueueOptions;
import org.openqa.selenium.grid.sessionqueue.local.LocalNewSessionQueue;
import org.openqa.selenium.grid.sessionqueue.local.LocalNewSessionQueuer;

import org.openqa.selenium.grid.web.CombinedHandler;
import org.openqa.selenium.grid.web.NoHandler;
import org.openqa.selenium.grid.web.ResourceHandler;
import org.openqa.selenium.grid.web.RoutableHttpClientFactory;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.http.Contents;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.http.Routable;
import org.openqa.selenium.remote.http.Route;
import org.openqa.selenium.remote.tracing.Tracer;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.Collections;
import java.util.Set;
import java.util.logging.Logger;

import static java.net.HttpURLConnection.HTTP_INTERNAL_ERROR;
import static java.net.HttpURLConnection.HTTP_MOVED_PERM;
import static java.net.HttpURLConnection.HTTP_OK;
import static org.openqa.selenium.grid.config.StandardGridRoles.EVENT_BUS_ROLE;
import static org.openqa.selenium.grid.config.StandardGridRoles.HTTPD_ROLE;
import static org.openqa.selenium.grid.config.StandardGridRoles.ROUTER_ROLE;
import static org.openqa.selenium.remote.http.Route.combine;
import static org.openqa.selenium.remote.http.Route.get;

@AutoService(CliCommand.class)
public class Hub extends TemplateGridServerCommand {

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
  public Set<Role> getConfigurableRoles() {
    return ImmutableSet.of(EVENT_BUS_ROLE, HTTPD_ROLE, ROUTER_ROLE);
  }

  @Override
  public Set<Object> getFlagObjects() {
    return Collections.emptySet();
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
  protected Handlers createHandlers(Config config) {
    LoggingOptions loggingOptions = new LoggingOptions(config);
    Tracer tracer = loggingOptions.getTracer();

    EventBusOptions events = new EventBusOptions(config);
    EventBus bus = events.getEventBus();

    CombinedHandler handler = new CombinedHandler();

    SessionMap sessions = new LocalSessionMap(tracer, bus);
    handler.addHandler(sessions);

    BaseServerOptions serverOptions = new BaseServerOptions(config);
    SecretOptions secretOptions = new SecretOptions(config);

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

    NewSessionQueueOptions newSessionQueueOptions = new NewSessionQueueOptions(config);
    NewSessionQueue sessionRequests = new LocalNewSessionQueue(
        tracer,
        bus,
        newSessionQueueOptions.getSessionRequestTimeout(),
        newSessionQueueOptions.getSessionRequestRetryInterval());
    NewSessionQueuer queuer = new LocalNewSessionQueuer(tracer, bus, sessionRequests);
    handler.addHandler(queuer);

    Distributor distributor = new LocalDistributor(
        tracer,
        bus,
        clientFactory,
        sessions,
        queuer,
        secretOptions.getRegistrationSecret());
    handler.addHandler(distributor);

    Router router = new Router(tracer, clientFactory, sessions, distributor);
    GraphqlHandler graphqlHandler = new GraphqlHandler(distributor, serverOptions.getExternalUri());
    HttpHandler readinessCheck = req -> {
      boolean ready = router.isReady() && bus.isReady();
      return new HttpResponse()
        .setStatus(ready ? HTTP_OK : HTTP_INTERNAL_ERROR)
        .setContent(Contents.utf8String("Router is " + ready));
    };

    Routable ui;
    URL uiRoot = getClass().getResource("/javascript/grid-ui/build");
    if (uiRoot != null) {
      ResourceHandler
        uiHandler = new ResourceHandler(new ClassPathResource(uiRoot, "javascript/grid-ui/build"));
      ui = Route.combine(
        get("/grid/console").to(() -> req -> new HttpResponse().setStatus(HTTP_MOVED_PERM).addHeader("Location", "/ui/index.html")),
        Route.prefix("/ui/").to(Route.matching(req -> true).to(() -> uiHandler)));
    } else {
      Json json = new Json();
      ui = Route.matching(req -> false).to(() -> new NoHandler(json));
    }

    HttpHandler httpHandler = combine(
      ui,
      router.with(networkOptions.getSpecComplianceChecks()),
      Route.prefix("/wd/hub").to(combine(router.with(networkOptions.getSpecComplianceChecks()))),
      Route.post("/graphql").to(() -> graphqlHandler),
      Route.get("/readyz").to(() -> readinessCheck));

    return new Handlers(httpHandler, new ProxyCdpIntoGrid(clientFactory, sessions));
  }

  @Override
  protected void execute(Config config) {
    Require.nonNull("Config", config);

    Server<?> server = asServer(config).start();

    BuildInfo info = new BuildInfo();
    LOG.info(String.format(
      "Started Selenium hub %s (revision %s): %s",
      info.getReleaseLabel(),
      info.getBuildRevision(),
      server.getUrl()));
  }
}
