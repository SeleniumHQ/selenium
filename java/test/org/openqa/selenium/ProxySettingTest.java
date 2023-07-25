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

package org.openqa.selenium;

import static java.nio.charset.StandardCharsets.US_ASCII;
import static java.nio.charset.StandardCharsets.UTF_8;
import static org.assertj.core.api.Assertions.assertThat;
import static org.openqa.selenium.remote.CapabilityType.PROXY;
import static org.openqa.selenium.testing.drivers.Browser.CHROME;
import static org.openqa.selenium.testing.drivers.Browser.FIREFOX;
import static org.openqa.selenium.testing.drivers.Browser.SAFARI;

import com.google.common.base.Joiner;
import com.google.common.net.HostAndPort;
import io.netty.handler.codec.http.FullHttpResponse;
import io.netty.handler.codec.http.HttpRequest;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.HashSet;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.netty.server.SimpleHttpServer;
import org.openqa.selenium.remote.http.HttpMethod;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JupiterTestBase;
import org.openqa.selenium.testing.NoDriverAfterTest;
import org.openqa.selenium.testing.NoDriverBeforeTest;

class ProxySettingTest extends JupiterTestBase {

  @Test
  @Ignore(SAFARI)
  @NoDriverBeforeTest
  @NoDriverAfterTest
  public void canConfigureManualHttpProxy() throws URISyntaxException, InterruptedException {
    try (FakeProxyServer proxyServer = new FakeProxyServer()) {
      Proxy proxyToUse = proxyServer.asProxy();

      createNewDriver(new ImmutableCapabilities(PROXY, proxyToUse));

      driver.get(appServer.whereElseIs("simpleTest.html"));
      assertThat(proxyServer.hasBeenCalled("simpleTest.html")).isTrue();
    }
  }

  @Test
  @Ignore(SAFARI)
  @NoDriverBeforeTest
  @NoDriverAfterTest
  public void canConfigureNoProxy() throws URISyntaxException, InterruptedException {
    try (FakeProxyServer proxyServer = new FakeProxyServer()) {
      Proxy proxyToUse = proxyServer.asProxy();
      proxyToUse.setNoProxy("localhost, 127.0.0.1, " + appServer.getHostName());

      createNewDriver(new ImmutableCapabilities(PROXY, proxyToUse));

      driver.get(appServer.whereIs("simpleTest.html"));
      assertThat(proxyServer.hasBeenCalled("simpleTest.html")).isFalse();

      driver.get(appServer.whereElseIs("simpleTest.html"));
      assertThat(proxyServer.hasBeenCalled("simpleTest.html")).isTrue();
    }
  }

  @Test
  @Ignore(SAFARI)
  @NoDriverBeforeTest
  @NoDriverAfterTest
  public void canConfigureProxyThroughPACFile() throws URISyntaxException, InterruptedException {
    try (SimpleHttpServer helloServer =
            createSimpleHttpServer(
                appServer.whereElseIs("mouseOver.html"),
                "<!DOCTYPE html><title>Hello</title><h3>Hello, world!</h3>");
        SimpleHttpServer pacFileServer =
            createPacfileServer(
                "/proxy.pac",
                Joiner.on('\n')
                    .join(
                        "function FindProxyForURL(url, host) {",
                        "  return 'PROXY " + getHostAndPort(helloServer) + "';",
                        "}")); ) {

      Proxy proxy = new Proxy();
      proxy.setProxyAutoconfigUrl("http://" + getHostAndPort(pacFileServer) + "/proxy.pac");

      createNewDriver(new ImmutableCapabilities(PROXY, proxy));

      driver.get(appServer.whereElseIs("mouseOver.html"));
      assertThat(driver.findElement(By.tagName("h3")).getText()).isEqualTo("Hello, world!");
    }
  }

  @Test
  @Ignore(SAFARI)
  @NoDriverBeforeTest
  @NoDriverAfterTest
  @Ignore(value = FIREFOX, travis = true)
  @Ignore(value = CHROME, reason = "Flaky")
  public void canUsePACThatOnlyProxiesCertainHosts()
      throws URISyntaxException, InterruptedException {
    try (SimpleHttpServer helloServer =
            createSimpleHttpServer(
                "/index.html", "<!DOCTYPE html><title>Hello</title><h3>Hello, world!</h3>");
        SimpleHttpServer goodbyeServer =
            createSimpleHttpServer(
                helloServer.baseUri().resolve("/index.html").toString(),
                "<!DOCTYPE html><title>Goodbye</title><h3>Goodbye, world!</h3>");
        SimpleHttpServer pacFileServer =
            createPacfileServer(
                "/proxy.pac",
                Joiner.on('\n')
                    .join(
                        "function FindProxyForURL(url, host) {",
                        "  if (url.indexOf('" + getHostAndPort(helloServer) + "') != -1) {",
                        "    return 'PROXY " + getHostAndPort(goodbyeServer) + "';",
                        "  }",
                        "  return 'DIRECT';",
                        "}")); ) {

      Proxy proxy = new Proxy();
      proxy.setProxyAutoconfigUrl("http://" + getHostAndPort(pacFileServer) + "/proxy.pac");

      createNewDriver(new ImmutableCapabilities(PROXY, proxy));

      driver.get("http://" + getHostAndPort(helloServer) + "/index.html");
      assertThat(driver.findElement(By.tagName("h3")).getText()).isEqualTo("Goodbye, world!");

      driver.get(appServer.whereElseIs("simpleTest.html"));
      assertThat(driver.findElement(By.tagName("h1")).getText()).isEqualTo("Heading");
    }
  }

  private SimpleHttpServer createSimpleHttpServer(String requestPath, String responseHtml)
      throws URISyntaxException, InterruptedException {
    SimpleHttpServer server = new SimpleHttpServer();
    byte[] bytes = responseHtml.getBytes(UTF_8);

    server.registerEndpoint(HttpMethod.GET, requestPath, "text/html; charset=utf-8", bytes);

    return server;
  }

  private SimpleHttpServer createPacfileServer(String requestPath, String responsePac)
      throws URISyntaxException, InterruptedException {
    SimpleHttpServer server = new SimpleHttpServer();
    byte[] bytes = responsePac.getBytes(US_ASCII);

    server.registerEndpoint(
        HttpMethod.GET, requestPath, "application/x-ns-proxy-autoconfig", bytes);

    return server;
  }

  private static HostAndPort getHostAndPort(SimpleHttpServer server) {
    URI baseUri = server.baseUri();
    return HostAndPort.fromParts(baseUri.getHost(), baseUri.getPort());
  }

  public static class FakeProxyServer extends SimpleHttpServer {
    private final Set<String> resources = new HashSet<>();

    public FakeProxyServer() throws URISyntaxException, InterruptedException {}

    @Override
    protected FullHttpResponse handleRequest(HttpRequest requested) {
      String[] parts = requested.uri().split("/");

      if (parts.length > 1) {
        resources.add(parts[parts.length - 1]);
      }

      return super.handleRequest(requested);
    }

    /**
     * Checks if a resource has been requested using the short name of the resource.
     *
     * @param resourceName The short name of the resource to check.
     * @return true if the resource has been called.
     */
    public boolean hasBeenCalled(String resourceName) {
      return resources.contains(resourceName);
    }

    public Proxy asProxy() {
      Proxy proxy = new Proxy();
      URI baseUri = baseUri();
      proxy.setHttpProxy(baseUri.getHost() + ":" + baseUri.getPort());
      return proxy;
    }
  }
}
