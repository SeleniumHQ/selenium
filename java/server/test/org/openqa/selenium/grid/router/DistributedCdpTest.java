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

import org.junit.BeforeClass;
import org.junit.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.MutableCapabilities;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.devtools.DevTools;
import org.openqa.selenium.devtools.HasDevTools;
import org.openqa.selenium.devtools.idealized.Network;
import org.openqa.selenium.grid.config.MapConfig;
import org.openqa.selenium.grid.config.TomlConfig;
import org.openqa.selenium.grid.router.DeploymentTypes.Deployment;
import org.openqa.selenium.grid.server.BaseServerOptions;
import org.openqa.selenium.grid.server.Server;
import org.openqa.selenium.netty.server.NettyServer;
import org.openqa.selenium.remote.Augmenter;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.remote.http.Contents;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.http.Route;
import org.openqa.selenium.support.devtools.NetworkInterceptor;
import org.openqa.selenium.testing.drivers.Browser;

import java.io.StringReader;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.CountDownLatch;

import static java.util.concurrent.TimeUnit.SECONDS;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assumptions.assumeThat;

public class DistributedCdpTest {

  @BeforeClass
  public static void ensureBrowserIsCdpEnabled() {
    Browser browser = Objects.requireNonNull(Browser.detect());

    assumeThat(browser.supportsCdp()).isTrue();
  }

  @Test
  public void ensureBasicFunctionality() throws InterruptedException {
    Browser browser = Browser.detect();

    Deployment deployment = DeploymentTypes.DISTRIBUTED.start(
      browser.getCapabilities(),
      new TomlConfig(new StringReader(
        "[node]\n" +
        "driver-implementation = " + browser.displayName())));

    Server<?> server = new NettyServer(
      new BaseServerOptions(new MapConfig(ImmutableMap.of())),
      req -> new HttpResponse().setContent(Contents.utf8String("I like cheese")))
      .start();

    WebDriver driver = new RemoteWebDriver(
      deployment.getServer().getUrl(), addBrowserPath(browser.getCapabilities()));
    driver = new Augmenter().augment(driver);

    String serverUri = server.getUrl().toString();

    CountDownLatch latch = new CountDownLatch(1);
    try (DevTools devTools = ((HasDevTools) driver).getDevTools()) {
      devTools.createSessionIfThereIsNotOne();
      Network<?, ?> network = devTools.getDomains().network();
      network.addRequestHandler(
        Route.matching(req -> req.getUri().startsWith(serverUri))
          .to(() -> req -> {
            latch.countDown();
            return NetworkInterceptor.PROCEED_WITH_REQUEST;
          }));

      driver.get(server.getUrl().toString());

      assertThat(latch.await(10, SECONDS)).isTrue();
    }
  }

  private Capabilities addBrowserPath(Capabilities caps) {
    if (Browser.detect() == Browser.CHROME) {
      String binary = System.getProperty("webdriver.chrome.binary");
      if (binary == null) {
        return caps;
      }

      MutableCapabilities newCaps = new MutableCapabilities(caps);
      @SuppressWarnings("unchecked")
      Map<String, Object> rawOptions = (Map<String, Object>) newCaps.getCapability(ChromeOptions.CAPABILITY);
      HashMap<String, Object> googOptions = new HashMap<>(rawOptions);
      googOptions.put("binary", binary);
      newCaps.setCapability(ChromeOptions.CAPABILITY, googOptions);
      return newCaps;
    }

    return caps;
  }
}
