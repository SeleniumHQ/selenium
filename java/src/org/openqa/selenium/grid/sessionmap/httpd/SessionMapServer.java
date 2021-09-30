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

import com.google.auto.service.AutoService;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;

import org.openqa.selenium.BuildInfo;
import org.openqa.selenium.cli.CliCommand;
import org.openqa.selenium.grid.TemplateGridServerCommand;
import org.openqa.selenium.grid.config.Config;
import org.openqa.selenium.grid.config.Role;
import org.openqa.selenium.grid.server.Server;
import org.openqa.selenium.grid.sessionmap.SessionMap;
import org.openqa.selenium.grid.sessionmap.config.SessionMapOptions;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.http.Route;

import java.util.Collections;
import java.util.Set;
import java.util.logging.Logger;

import static java.net.HttpURLConnection.HTTP_NO_CONTENT;
import static org.openqa.selenium.grid.config.StandardGridRoles.EVENT_BUS_ROLE;
import static org.openqa.selenium.grid.config.StandardGridRoles.HTTPD_ROLE;
import static org.openqa.selenium.grid.config.StandardGridRoles.SESSION_MAP_ROLE;
import static org.openqa.selenium.json.Json.JSON_UTF_8;
import static org.openqa.selenium.remote.http.Contents.asJson;
import static org.openqa.selenium.remote.http.Route.get;

@AutoService(CliCommand.class)
public class SessionMapServer extends TemplateGridServerCommand {

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
  public Set<Role> getConfigurableRoles() {
    return ImmutableSet.of(EVENT_BUS_ROLE, HTTPD_ROLE, SESSION_MAP_ROLE);
  }

  @Override
  public Set<Object> getFlagObjects() {
    return Collections.emptySet();
  }

  @Override
  protected String getSystemPropertiesConfigPrefix() {
    return "sessions";
  }

  @Override
  protected Config getDefaultConfig() {
    return new DefaultSessionMapConfig();
  }

  @Override
  protected Handlers createHandlers(Config config) {
    Require.nonNull("Config", config);

    SessionMapOptions sessionMapOptions = new SessionMapOptions(config);
    SessionMap sessions = sessionMapOptions.getSessionMap();

    return new Handlers(
      Route.combine(
        sessions,
        get("/status").to(() -> req ->
          new HttpResponse()
            .addHeader("Content-Type", JSON_UTF_8)
            .setContent(asJson(
              ImmutableMap.of("value", ImmutableMap.of(
                "ready", true,
                "message", "Session map is ready."))))),
        get("/readyz").to(() -> req -> new HttpResponse().setStatus(HTTP_NO_CONTENT))),
      null);
  }

  @Override
  protected void execute(Config config) {
    Server<?> server = asServer(config);
    server.start();

    BuildInfo info = new BuildInfo();
    LOG.info(String.format(
      "Started Selenium SessionMap %s (revision %s): %s",
      info.getReleaseLabel(),
      info.getBuildRevision(),
      server.getUrl()));
  }
}
