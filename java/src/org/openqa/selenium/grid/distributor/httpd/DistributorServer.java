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
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;
import com.google.common.net.MediaType;

import org.openqa.selenium.BuildInfo;
import org.openqa.selenium.cli.CliCommand;
import org.openqa.selenium.grid.TemplateGridServerCommand;
import org.openqa.selenium.grid.config.Config;
import org.openqa.selenium.grid.config.Role;
import org.openqa.selenium.grid.distributor.Distributor;
import org.openqa.selenium.grid.distributor.config.DistributorOptions;
import org.openqa.selenium.grid.server.Server;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.http.Contents;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.http.Route;

import java.util.Collections;
import java.util.Set;
import java.util.logging.Logger;

import static java.net.HttpURLConnection.HTTP_OK;
import static java.net.HttpURLConnection.HTTP_UNAVAILABLE;
import static org.openqa.selenium.grid.config.StandardGridRoles.DISTRIBUTOR_ROLE;
import static org.openqa.selenium.grid.config.StandardGridRoles.EVENT_BUS_ROLE;
import static org.openqa.selenium.grid.config.StandardGridRoles.HTTPD_ROLE;
import static org.openqa.selenium.grid.config.StandardGridRoles.SESSION_MAP_ROLE;
import static org.openqa.selenium.grid.config.StandardGridRoles.SESSION_QUEUE_ROLE;
import static org.openqa.selenium.remote.http.HttpMethod.GET;
import static org.openqa.selenium.remote.http.Route.get;

@AutoService(CliCommand.class)
public class DistributorServer extends TemplateGridServerCommand {

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
  public Set<Role> getConfigurableRoles() {
    return ImmutableSet.of(DISTRIBUTOR_ROLE, EVENT_BUS_ROLE, HTTPD_ROLE, SESSION_MAP_ROLE, SESSION_QUEUE_ROLE);
  }

  @Override
  public Set<Object> getFlagObjects() {
    return Collections.emptySet();
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
  protected Handlers createHandlers(Config config) {
    DistributorOptions distributorOptions = new DistributorOptions(config);

    Distributor distributor = distributorOptions.getDistributor();

    HttpHandler readinessCheck = req -> {
      boolean ready = distributor.isReady();
      return new HttpResponse()
        .setStatus(ready ? HTTP_OK : HTTP_UNAVAILABLE)
        .setHeader("Content-Type", MediaType.PLAIN_TEXT_UTF_8.toString())
        .setContent(Contents.utf8String("Distributor is " + ready));
    };

    return new Handlers(
      Route.combine(
        distributor,
        Route.matching(req -> GET.equals(req.getMethod()) && "/status".equals(req.getUri()))
          .to(() -> req -> new HttpResponse()
            .setContent(Contents.asJson(
              ImmutableMap.of("value", ImmutableMap.of(
                "ready", true,
                "message", "Distributor is ready"))))),
        get("/readyz").to(() -> readinessCheck)),
      null);
  }

  @Override
  protected void execute(Config config) {
    Require.nonNull("Config", config);

    Server<?> server = asServer(config).start();

    BuildInfo info = new BuildInfo();
    LOG.info(String.format(
      "Started Selenium Distributor %s (revision %s): %s",
      info.getReleaseLabel(),
      info.getBuildRevision(),
      server.getUrl()));
  }
}
