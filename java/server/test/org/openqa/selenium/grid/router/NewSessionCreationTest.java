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

package org.openqa.selenium.grid.router;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;
import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.WebDriverInfo;
import org.openqa.selenium.chrome.ChromeDriverInfo;
import org.openqa.selenium.events.EventBus;
import org.openqa.selenium.events.local.GuavaEventBus;
import org.openqa.selenium.firefox.GeckoDriverInfo;
import org.openqa.selenium.grid.config.MapConfig;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.distributor.Distributor;
import org.openqa.selenium.grid.distributor.local.LocalDistributor;
import org.openqa.selenium.grid.node.Node;
import org.openqa.selenium.grid.node.config.DriverServiceSessionFactory;
import org.openqa.selenium.grid.node.local.LocalNode;
import org.openqa.selenium.grid.server.BaseServerOptions;
import org.openqa.selenium.grid.server.Server;
import org.openqa.selenium.grid.sessionmap.SessionMap;
import org.openqa.selenium.grid.sessionmap.local.LocalSessionMap;
import org.openqa.selenium.grid.testing.TestSessionFactory;
import org.openqa.selenium.grid.web.EnsureSpecCompliantHeaders;
import org.openqa.selenium.netty.server.NettyServer;
import org.openqa.selenium.remote.http.Contents;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.http.Routable;
import org.openqa.selenium.remote.service.DriverService;
import org.openqa.selenium.remote.tracing.DefaultTestTracer;
import org.openqa.selenium.remote.tracing.Tracer;
import org.openqa.selenium.testing.drivers.Browser;

import java.net.URI;
import java.net.URISyntaxException;

import static java.net.HttpURLConnection.HTTP_INTERNAL_ERROR;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assumptions.assumeThat;
import static org.openqa.selenium.json.Json.JSON_UTF_8;
import static org.openqa.selenium.remote.http.HttpMethod.POST;

public class NewSessionCreationTest {

  private Tracer tracer;
  private EventBus events;
  private HttpClient.Factory clientFactory;

  @Before
  public void setup() {
    tracer = DefaultTestTracer.createTracer();
    events = new GuavaEventBus();
    clientFactory = HttpClient.Factory.createDefault();
  }

  @Test
  public void ensureJsCannotCreateANewSession() throws URISyntaxException {
    ChromeDriverInfo chromeDriverInfo = new ChromeDriverInfo();
    assumeThat(chromeDriverInfo.isAvailable()).isTrue();
    GeckoDriverInfo geckoDriverInfo = new GeckoDriverInfo();
    assumeThat(geckoDriverInfo.isAvailable()).isTrue();

    SessionMap sessions = new LocalSessionMap(tracer, events);
    Distributor distributor = new LocalDistributor(tracer, events, clientFactory, sessions, null);
    Routable router = new Router(tracer, clientFactory, sessions, distributor).with(new EnsureSpecCompliantHeaders(ImmutableList.of()));

    Server<?> server = new NettyServer(
      new BaseServerOptions(new MapConfig(ImmutableMap.of())),
      router,
      new ProxyCdpIntoGrid(clientFactory, sessions))
      .start();

    URI uri = server.getUrl().toURI();
    Node node = LocalNode.builder(
      tracer,
      events,
      uri,
      uri,
      null)
      .add(Browser.detect().getCapabilities(), new TestSessionFactory((id, caps) -> new Session(id, uri, caps)))
      .build();
    distributor.add(node);

    HttpClient client = HttpClient.Factory.createDefault().createClient(server.getUrl());

    // Attempt to create a session without setting the content type
    HttpResponse res = client.execute(
      new HttpRequest(POST, "/session")
        .setContent(Contents.asJson(ImmutableMap.of(
          "capabilities", ImmutableMap.of(
            "alwaysMatch", Browser.detect().getCapabilities())))));

    assertThat(res.getStatus()).isEqualTo(HTTP_INTERNAL_ERROR);

    // Attempt to create a session with an origin header but content type set
    res = client.execute(
      new HttpRequest(POST, "/session")
        .addHeader("Content-Type", JSON_UTF_8)
        .addHeader("Origin", "localhost")
        .setContent(Contents.asJson(ImmutableMap.of(
          "capabilities", ImmutableMap.of(
            "alwaysMatch", Browser.detect().getCapabilities())))));

    assertThat(res.getStatus()).isEqualTo(HTTP_INTERNAL_ERROR);

    // And now make sure the session is just fine
    res = client.execute(
      new HttpRequest(POST, "/session")
        .addHeader("Content-Type", JSON_UTF_8)
        .setContent(Contents.asJson(ImmutableMap.of(
          "capabilities", ImmutableMap.of(
            "alwaysMatch", Browser.detect().getCapabilities())))));

    assertThat(res.isSuccessful()).isTrue();
  }

  private LocalNode.Builder addDriverFactory(
    LocalNode.Builder builder,
    WebDriverInfo info,
    DriverService.Builder<?, ?> driverService) {
    return builder.add(
      info.getCanonicalCapabilities(),
      new DriverServiceSessionFactory(
        tracer,
        clientFactory,
        info::isSupporting,
        driverService));
  }
}
