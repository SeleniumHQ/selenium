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

package org.openqa.selenium.grid.sessionqueue.httpd;

import static java.net.HttpURLConnection.HTTP_NO_CONTENT;
import static org.openqa.selenium.grid.config.StandardGridRoles.EVENT_BUS_ROLE;
import static org.openqa.selenium.grid.config.StandardGridRoles.HTTPD_ROLE;
import static org.openqa.selenium.grid.config.StandardGridRoles.SESSION_QUEUER_ROLE;
import static org.openqa.selenium.grid.config.StandardGridRoles.SESSION_QUEUE_ROLE;
import static org.openqa.selenium.json.Json.JSON_UTF_8;
import static org.openqa.selenium.remote.http.Contents.asJson;
import static org.openqa.selenium.remote.http.Route.get;

import com.google.auto.service.AutoService;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;

import org.openqa.selenium.BuildInfo;
import org.openqa.selenium.cli.CliCommand;
import org.openqa.selenium.grid.TemplateGridCommand;
import org.openqa.selenium.grid.config.Config;
import org.openqa.selenium.grid.config.Role;

import org.openqa.selenium.grid.server.BaseServerOptions;
import org.openqa.selenium.grid.server.Server;
import org.openqa.selenium.grid.sessionqueue.NewSessionQueuer;
import org.openqa.selenium.grid.sessionqueue.config.NewSessionQueuerOptions;
import org.openqa.selenium.netty.server.NettyServer;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.http.Route;

import java.util.Collections;
import java.util.Set;
import java.util.logging.Logger;

@AutoService(CliCommand.class)
public class NewSessionQueuerServer extends TemplateGridCommand {

  private static final Logger LOG = Logger.getLogger(NewSessionQueuerServer.class.getName());
  private static final String
      LOCAL_NEWSESSION_QUEUER = "org.openqa.selenium.grid.sessionqueue.local.LocalNewSessionQueuer";

  @Override
  public String getName() {
    return "sessionqueuer";
  }

  @Override
  public String getDescription() {
    return "Adds this server as the new session queue in a selenium grid.";
  }

  @Override
  public Set<Role> getConfigurableRoles() {
    return ImmutableSet.of(EVENT_BUS_ROLE, HTTPD_ROLE, SESSION_QUEUER_ROLE, SESSION_QUEUE_ROLE);
  }

  @Override
  public Set<Object> getFlagObjects() {
    return Collections.emptySet();
  }

  @Override
  protected String getSystemPropertiesConfigPrefix() {
    return "sessionqueuer";
  }

  @Override
  protected Config getDefaultConfig() {
    return new DefaultNewSessionQueuerConfig();
  }

  @Override
  protected void execute(Config config) {
    BaseServerOptions serverOptions = new BaseServerOptions(config);
    NewSessionQueuerOptions queuerOptions = new NewSessionQueuerOptions(config);

    NewSessionQueuer sessionQueuer = queuerOptions.getSessionQueuer(LOCAL_NEWSESSION_QUEUER);

    Server<?> server = new NettyServer(serverOptions, Route.combine(
        sessionQueuer,
        get("/status").to(() -> req ->
            new HttpResponse()
                .addHeader("Content-Type", JSON_UTF_8)
                .setContent(asJson(
                    ImmutableMap.of("value", ImmutableMap.of(
                        "ready", true,
                        "message", "New Session Queuer is ready."))))),
        get("/readyz").to(() -> req -> new HttpResponse().setStatus(HTTP_NO_CONTENT))));
    server.start();

    BuildInfo info = new BuildInfo();
    LOG.info(String.format(
        "Started Selenium New Session Queuer %s (revision %s): %s",
        info.getReleaseLabel(),
        info.getBuildRevision(),
        server.getUrl()));
  }
}
