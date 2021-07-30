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
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;

import org.openqa.selenium.BuildInfo;
import org.openqa.selenium.cli.CliCommand;
import org.openqa.selenium.events.Event;
import org.openqa.selenium.events.EventBus;
import org.openqa.selenium.events.EventListener;
import org.openqa.selenium.events.EventName;
import org.openqa.selenium.grid.TemplateGridCommand;
import org.openqa.selenium.grid.config.CompoundConfig;
import org.openqa.selenium.grid.config.Config;
import org.openqa.selenium.grid.config.MapConfig;
import org.openqa.selenium.grid.config.MemoizedConfig;
import org.openqa.selenium.grid.config.Role;
import org.openqa.selenium.grid.server.BaseServerOptions;
import org.openqa.selenium.grid.server.EventBusOptions;
import org.openqa.selenium.grid.server.Server;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.netty.server.NettyServer;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.http.Route;

import java.util.Collections;
import java.util.Set;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.logging.Logger;

import static java.net.HttpURLConnection.HTTP_NO_CONTENT;
import static org.openqa.selenium.grid.config.StandardGridRoles.EVENT_BUS_ROLE;
import static org.openqa.selenium.grid.config.StandardGridRoles.HTTPD_ROLE;
import static org.openqa.selenium.json.Json.JSON_UTF_8;
import static org.openqa.selenium.remote.http.Contents.asJson;

@AutoService(CliCommand.class)
public class EventBusCommand extends TemplateGridCommand {
  private static final Logger LOG = Logger.getLogger(EventBusCommand.class.getName());

  @Override
  public String getName() {
    return "event-bus";
  }

  @Override
  public String getDescription() {
    return "Standalone instance of the event bus.";
  }

  @Override
  public Set<Role> getConfigurableRoles() {
    return ImmutableSet.of(EVENT_BUS_ROLE, HTTPD_ROLE);
  }

  @Override
  public boolean isShown() {
    return false;
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
    return new MapConfig(ImmutableMap.of(
      "events", ImmutableMap.of(
        "bind", true,
        "publish", "tcp://*:4442",
        "subscribe", "tcp://*:4443"),
      "server", ImmutableMap.of(
        "port", 5557)));
  }

  public Server<?> asServer(Config initialConfig) {
    Require.nonNull("Config", initialConfig);

    Config config = new MemoizedConfig(new CompoundConfig(initialConfig, getDefaultConfig()));

    EventBusOptions events = new EventBusOptions(config);
    EventBus bus = events.getEventBus();

    BaseServerOptions serverOptions = new BaseServerOptions(config);

    return new NettyServer(
      serverOptions,
      Route.combine(
        Route.get("/status").to(() -> req -> {
          CountDownLatch latch = new CountDownLatch(1);

          EventName healthCheck = new EventName("healthcheck");
          bus.addListener(new EventListener<>(healthCheck, Object.class, obj -> latch.countDown()));
          bus.fire(new Event(healthCheck, "ping"));

          try {
            if (latch.await(5, TimeUnit.SECONDS)) {
              return httpResponse(true, "Event bus running");
            } else {
              return httpResponse(false, "Event bus could not deliver a test message in 5 seconds");
            }
          } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return httpResponse(false, "Status checking was interrupted");
          }
        }),
        Route.get("/readyz").to(() -> req -> new HttpResponse().setStatus(HTTP_NO_CONTENT)))
    );
  }

  @Override
  protected void execute(Config config) {
    Require.nonNull("Config", config);

    Server<?> server = asServer(config);
    server.start();

    BuildInfo info = new BuildInfo();
    LOG.info(String.format(
      "Started Selenium EventBus %s (revision %s): %s",
      info.getReleaseLabel(),
      info.getBuildRevision(),
      server.getUrl()));
  }

  private HttpResponse httpResponse(boolean ready, String message) {
    return new HttpResponse()
        .addHeader("Content-Type", JSON_UTF_8)
        .setContent(asJson(ImmutableMap.of(
          "value", ImmutableMap.of(
            "ready", ready,
            "message", message))));
  }
}
