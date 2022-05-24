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

package org.openqa.selenium.remote;

import static org.assertj.core.api.Assertions.assertThat;
import static org.openqa.selenium.remote.http.Route.get;
import static org.openqa.selenium.remote.http.Route.post;
import static org.openqa.selenium.testing.Safely.safelyCall;

import com.google.common.collect.ImmutableMap;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.devtools.DevToolsException;
import org.openqa.selenium.devtools.HasDevTools;
import org.openqa.selenium.environment.webserver.AppServer;
import org.openqa.selenium.environment.webserver.NettyAppServer;
import org.openqa.selenium.firefox.FirefoxOptions;
import org.openqa.selenium.remote.http.Contents;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.http.Route;
import org.openqa.selenium.remote.service.DriverService;
import org.openqa.selenium.testing.UnitTests;

import java.io.File;
import java.io.IOException;
import java.net.URL;
import java.util.UUID;

@Category(UnitTests.class)
public class DevToolsAugmenterErrorHandlingTest {

  private static final SessionId SESSION_ID = new SessionId(UUID.randomUUID());

  private AppServer server;

  @Before
  public void startServer() {
    // Server that does not support websockets
    Route route = Route.combine(
      post("/session").to(() -> req -> new HttpResponse()
        .setContent(Contents.asJson(ImmutableMap.of(
          "value", ImmutableMap.of(
            "sessionId", SESSION_ID,
            "capabilities", new ImmutableCapabilities("firefox", "caps",
                                                      "browserName", "firefox",
                                                      "moz:debuggerAddress", server.whereIs("")
                                                        .replace("http://", ""))))))),
      get("/json/version").to(() -> req -> new HttpResponse()
        .setContent(Contents.asJson(ImmutableMap.of("Browser", "Firefox/101.0",
                                                    "Protocol-Version", "1.0",
                                                    "User-Agent",
                                                    "Mozilla/5.0",
                                                    "V8-Version", "1.0",
                                                    "WebKit-Version", "1.0",
                                                    "webSocketDebuggerUrl",
                                                    "ws://" + server.whereIs("")
                                                      .replace("http://", "") + "devtools/browser/"
                                                    + SESSION_ID.toString())))));

    server = new NettyAppServer(route);
    server.start();
  }

  @After
  public void stopServer() {
    safelyCall(server::stop);
  }

  @Test
  public void shouldCreateASessionIfWebSocketIsNotSupported() throws IOException {
    URL url = new URL(server.whereIs("/"));
    DriverService service = new FakeDriverService() {
      @Override
      public URL getUrl() {
        return url;
      }
    };

    WebDriver driver = RemoteWebDriver.builder()
      .oneOf(new FirefoxOptions())
      .withDriverService(service)
      .augmentUsing(new Augmenter())
      .build();

    assertThat(driver).isInstanceOf(HasDevTools.class);
  }

  @Test (expected = DevToolsException.class)
  public void shouldThrowAnErrorWhenTryingToUseUnsupportedDevtools() throws IOException {
    URL url = new URL(server.whereIs("/"));
    DriverService service = new FakeDriverService() {
      @Override
      public URL getUrl() {
        return url;
      }
    };

    WebDriver driver = RemoteWebDriver.builder()
      .oneOf(new FirefoxOptions())
      .withDriverService(service)
      .augmentUsing(new Augmenter())
      .build();

    ((HasDevTools) driver).getDevTools();
  }

  static class FakeDriverService extends DriverService {

    private boolean started;

    FakeDriverService() throws IOException {
      super(new File("."), 0, DEFAULT_TIMEOUT, null, null);
    }

    @Override
    public void start() {
      started = true;
    }

    @Override
    public boolean isRunning() {
      return started;
    }

    @Override
    protected void waitUntilAvailable() {
      // return immediately
    }
  }
}
