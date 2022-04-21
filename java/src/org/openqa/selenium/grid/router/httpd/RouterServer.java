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

import org.openqa.selenium.BuildInfo;
import org.openqa.selenium.UsernameAndPassword;
import org.openqa.selenium.cli.CliCommand;
import org.openqa.selenium.grid.TemplateGridServerCommand;
import org.openqa.selenium.grid.config.Config;
import org.openqa.selenium.grid.config.MapConfig;
import org.openqa.selenium.grid.config.Role;
import org.openqa.selenium.grid.distributor.Distributor;
import org.openqa.selenium.grid.distributor.config.DistributorOptions;
import org.openqa.selenium.grid.distributor.remote.RemoteDistributor;
import org.openqa.selenium.grid.graphql.GraphqlHandler;
import org.openqa.selenium.grid.log.LoggingOptions;
import org.openqa.selenium.grid.router.ProxyWebsocketsIntoGrid;
import org.openqa.selenium.grid.router.Router;
import org.openqa.selenium.grid.security.BasicAuthenticationFilter;
import org.openqa.selenium.grid.security.Secret;
import org.openqa.selenium.grid.security.SecretOptions;
import org.openqa.selenium.grid.server.BaseServerOptions;
import org.openqa.selenium.grid.server.NetworkOptions;
import org.openqa.selenium.grid.server.Server;
import org.openqa.selenium.grid.sessionmap.SessionMap;
import org.openqa.selenium.grid.sessionmap.config.SessionMapOptions;
import org.openqa.selenium.grid.sessionqueue.NewSessionQueue;
import org.openqa.selenium.grid.sessionqueue.config.NewSessionQueueOptions;
import org.openqa.selenium.grid.sessionqueue.remote.RemoteNewSessionQueue;
import org.openqa.selenium.grid.web.GridUiRoute;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.http.ClientConfig;
import org.openqa.selenium.remote.http.Contents;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.http.Routable;
import org.openqa.selenium.remote.http.Route;
import org.openqa.selenium.remote.tracing.Tracer;

import java.net.URL;
import java.time.Duration;
import java.util.Collections;
import java.util.Set;
import java.util.logging.Logger;

import static java.net.HttpURLConnection.HTTP_OK;
import static java.net.HttpURLConnection.HTTP_UNAVAILABLE;
import static org.openqa.selenium.grid.config.StandardGridRoles.DISTRIBUTOR_ROLE;
import static org.openqa.selenium.grid.config.StandardGridRoles.HTTPD_ROLE;
import static org.openqa.selenium.grid.config.StandardGridRoles.ROUTER_ROLE;
import static org.openqa.selenium.grid.config.StandardGridRoles.SESSION_MAP_ROLE;
import static org.openqa.selenium.grid.config.StandardGridRoles.SESSION_QUEUE_ROLE;
import static org.openqa.selenium.net.Urls.fromUri;
import static org.openqa.selenium.remote.http.Route.combine;
import static org.openqa.selenium.remote.http.Route.get;

@AutoService(CliCommand.class)
public class RouterServer extends TemplateGridServerCommand {

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
  public Set<Role> getConfigurableRoles() {
    return ImmutableSet.of(
        DISTRIBUTOR_ROLE,
        HTTPD_ROLE,
        ROUTER_ROLE,
        SESSION_MAP_ROLE,
        SESSION_QUEUE_ROLE);
  }

  @Override
  public Set<Object> getFlagObjects() {
    return Collections.emptySet();
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
  protected Handlers createHandlers(Config config) {
    LoggingOptions loggingOptions = new LoggingOptions(config);
    Tracer tracer = loggingOptions.getTracer();

    NetworkOptions networkOptions = new NetworkOptions(config);
    HttpClient.Factory clientFactory = networkOptions.getHttpClientFactory(tracer);

    BaseServerOptions serverOptions = new BaseServerOptions(config);
    SecretOptions secretOptions = new SecretOptions(config);
    Secret secret = secretOptions.getRegistrationSecret();

    SessionMapOptions sessionsOptions = new SessionMapOptions(config);
    SessionMap sessions = sessionsOptions.getSessionMap();

    NewSessionQueueOptions newSessionQueueOptions = new NewSessionQueueOptions(config);
    URL sessionQueueUrl = fromUri(newSessionQueueOptions.getSessionQueueUri());
    Duration sessionRequestTimeout = newSessionQueueOptions.getSessionRequestTimeout();
    ClientConfig httpClientConfig = ClientConfig
      .defaultConfig()
      .baseUrl(sessionQueueUrl)
      .readTimeout(sessionRequestTimeout);
    NewSessionQueue queue = new RemoteNewSessionQueue(
      tracer,
      clientFactory.createClient(httpClientConfig),
      secret);

    DistributorOptions distributorOptions = new DistributorOptions(config);
    URL distributorUrl = fromUri(distributorOptions.getDistributorUri());
    Distributor distributor = new RemoteDistributor(
      tracer,
      clientFactory,
      distributorUrl,
      secret);

    GraphqlHandler graphqlHandler = new GraphqlHandler(
      tracer,
      distributor,
      queue,
      serverOptions.getExternalUri(),
      getServerVersion());

    Routable ui = new GridUiRoute();
    Router router = new Router(tracer, clientFactory, sessions, queue, distributor);
    Routable routerWithSpecChecks = router.with(networkOptions.getSpecComplianceChecks());

    Routable route = Route.combine(
      ui,
      routerWithSpecChecks,
      Route.prefix("/wd/hub").to(combine(routerWithSpecChecks)),
      Route.options("/graphql").to(() -> graphqlHandler),
      Route.post("/graphql").to(() -> graphqlHandler));

    UsernameAndPassword uap = secretOptions.getServerAuthentication();
    if (uap != null) {
      LOG.info("Requiring authentication to connect");
      route = route.with(new BasicAuthenticationFilter(uap.username(), uap.password()));
    }

    HttpHandler readinessCheck = req -> {
      boolean ready = router.isReady();
      return new HttpResponse()
        .setStatus(ready ? HTTP_OK : HTTP_UNAVAILABLE)
        .setContent(Contents.utf8String("Router is " + ready));
    };

    // Since k8s doesn't make it easy to do an authenticated liveness probe, allow unauthenticated access to it.
    Routable routeWithLiveness = Route.combine(
      route,
      get("/readyz").to(() -> readinessCheck));

    return new Handlers(routeWithLiveness, new ProxyWebsocketsIntoGrid(clientFactory, sessions));
  }

  @Override
  protected void execute(Config config) {
    Require.nonNull("Config", config);

    Server<?> server = asServer(config).start();

    LOG.info(String.format(
      "Started Selenium Router %s: %s", getServerVersion(), server.getUrl()));
  }

  private String getServerVersion() {
    BuildInfo info = new BuildInfo();
    return String.format("%s (revision %s)", info.getReleaseLabel(), info.getBuildRevision());
  }
}
