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

import com.google.common.collect.ImmutableMap;
import org.junit.Test;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.devtools.DevTools;
import org.openqa.selenium.devtools.HasDevTools;
import org.openqa.selenium.devtools.network.Network;
import org.openqa.selenium.devtools.page.Page;
import org.openqa.selenium.grid.commands.EventBusCommand;
import org.openqa.selenium.grid.config.MapConfig;
import org.openqa.selenium.grid.distributor.httpd.DistributorServer;
import org.openqa.selenium.grid.node.httpd.NodeServer;
import org.openqa.selenium.grid.router.httpd.RouterServer;
import org.openqa.selenium.grid.server.BaseServerOptions;
import org.openqa.selenium.grid.server.Server;
import org.openqa.selenium.grid.sessionmap.httpd.SessionMapServer;
import org.openqa.selenium.grid.web.Values;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.netty.server.NettyServer;
import org.openqa.selenium.remote.Augmenter;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.remote.http.Contents;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.support.ui.FluentWait;
import org.openqa.selenium.testing.drivers.Browser;

import java.io.UncheckedIOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.concurrent.CountDownLatch;

import static java.time.Duration.ofSeconds;
import static java.util.concurrent.TimeUnit.SECONDS;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assumptions.assumeThat;
import static org.openqa.selenium.json.Json.MAP_TYPE;
import static org.openqa.selenium.remote.http.HttpMethod.GET;

public class DistributedCdpTest {

  @Test
  public void ensureBasicFunctionality() throws MalformedURLException, InterruptedException {
    Browser browser = Objects.requireNonNull(Browser.detect());

    assumeThat(browser.supportsCdp()).isTrue();

    int eventPublishPort = PortProber.findFreePort();
    int eventSubscribePort = PortProber.findFreePort();
    String[] eventBusFlags = new String[]{"--publish-events", "tcp://*:" + eventPublishPort, "--subscribe-events", "tcp://*:" + eventSubscribePort};

    int eventBusPort = PortProber.findFreePort();
    new EventBusCommand().configure(
      System.out,
      System.err,
      mergeArgs(eventBusFlags, "--port", "" + eventBusPort)).run();
    waitUntilUp(eventBusPort);

    int sessionsPort = PortProber.findFreePort();
    new SessionMapServer().configure(
      System.out,
      System.err,
      mergeArgs(eventBusFlags, "--bind-bus", "false", "--port", "" + sessionsPort)).run();
    waitUntilUp(sessionsPort);

    int distributorPort = PortProber.findFreePort();
    new DistributorServer().configure(
      System.out,
      System.err,
      mergeArgs(eventBusFlags, "--bind-bus", "false", "--port", "" + distributorPort, "-s", "http://localhost:" + sessionsPort)).run();
    waitUntilUp(distributorPort);

    int routerPort = PortProber.findFreePort();
    new RouterServer().configure(
      System.out,
      System.err,
      "--port", "" + routerPort, "-s", "http://localhost:" + sessionsPort, "-d", "http://localhost:" + distributorPort).run();
    waitUntilUp(routerPort);

    int nodePort = PortProber.findFreePort();
    new NodeServer().configure(
      System.out,
      System.err,
      mergeArgs(eventBusFlags, "--port", "" + nodePort, "-I", getBrowserShortName(), "--public-url", "http://localhost:" + routerPort)).run();
    waitUntilUp(nodePort);

    HttpClient client = HttpClient.Factory.createDefault().createClient(new URL("http://localhost:" + routerPort));
    new FluentWait<>(client).withTimeout(ofSeconds(10)).until(c -> {
      HttpResponse res = c.execute(new HttpRequest(GET, "/status"));
      if (!res.isSuccessful()) {
        return false;
      }
      Map<String, Object> value = Values.get(res, MAP_TYPE);
      if (value == null) {
        return false;
      }
      return Boolean.TRUE.equals(value.get("ready"));
    });

    Server<?> server = new NettyServer(
      new BaseServerOptions(new MapConfig(ImmutableMap.of())),
      req -> new HttpResponse().setContent(Contents.utf8String("I like cheese")))
      .start();

    WebDriver driver = new RemoteWebDriver(new URL("http://localhost:" + routerPort), browser.getCapabilities());
    driver = new Augmenter().augment(driver);

    CountDownLatch latch = new CountDownLatch(1);
    try (DevTools devTools = ((HasDevTools) driver).getDevTools()) {
      devTools.createSessionIfThereIsNotOne();
      devTools.send(Page.enable());
      devTools.addListener(Network.loadingFinished(), res -> latch.countDown());
      devTools.send(Network.enable(Optional.empty(), Optional.empty(), Optional.empty()));

      devTools.send(Page.navigate(server.getUrl().toString(), Optional.empty(), Optional.empty(), Optional.empty(), Optional.empty()));
      assertThat(latch.await(10, SECONDS)).isTrue();
    }
  }

  private String[] mergeArgs(String[] baseFlags, String... allTheArgs) {
    int length = baseFlags.length + allTheArgs.length;

    String[] args = new String[length];

    System.arraycopy(baseFlags, 0, args, 0, baseFlags.length);
    System.arraycopy(allTheArgs, 0, args, baseFlags.length, allTheArgs.length);

    return args;
  }

  private void waitUntilUp(int port) {
    try {
      HttpClient.Factory clientFactory = HttpClient.Factory.createDefault();
      HttpClient client = clientFactory.createClient(new URL("http://localhost:" + port));

      new FluentWait<>(client)
        .ignoring(UncheckedIOException.class)
        .withTimeout(ofSeconds(15))
        .until(http -> http.execute(new HttpRequest(GET, "/status")).isSuccessful());
    } catch (MalformedURLException e) {
      throw new RuntimeException(e);
    }
  }

  private String getBrowserShortName() {
    switch (System.getProperty("selenium.browser")) {
      case "chrome":
      case "edge":
      case "ie":
        return System.getProperty("selenium.browser");

      case "ff":
        return "firefox";

      case "safari":
        return "Safari Technology Preview";

      default:
        throw new RuntimeException("Unknown browser: " + System.getProperty("selenium.browser"));
    }
  }
}
