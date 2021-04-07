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

import com.google.common.base.Joiner;
import com.google.common.net.HostAndPort;
import io.netty.channel.ChannelHandlerContext;
import io.netty.handler.codec.http.HttpObject;
import io.netty.handler.codec.http.HttpRequest;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.littleshoot.proxy.HttpFilters;
import org.littleshoot.proxy.HttpFiltersAdapter;
import org.littleshoot.proxy.HttpFiltersSourceAdapter;
import org.littleshoot.proxy.HttpProxyServer;
import org.littleshoot.proxy.impl.DefaultHttpProxyServer;
import org.openqa.selenium.grid.config.MapConfig;
import org.openqa.selenium.grid.server.BaseServerOptions;
import org.openqa.selenium.grid.server.Server;
import org.openqa.selenium.jre.server.JreServer;
import org.openqa.selenium.net.NetworkUtils;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.remote.http.Contents;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JUnit4TestBase;
import org.openqa.selenium.testing.NeedsLocalEnvironment;
import org.openqa.selenium.testing.NoDriverAfterTest;
import org.openqa.selenium.testing.NoDriverBeforeTest;
import org.openqa.selenium.testing.Safely;
import org.openqa.selenium.testing.TearDownFixture;

import java.net.URL;
import java.util.ArrayList;
import java.util.List;

import static java.nio.charset.StandardCharsets.US_ASCII;
import static java.util.Collections.singletonMap;
import static org.assertj.core.api.Assertions.assertThat;
import static org.openqa.selenium.remote.CapabilityType.PROXY;
import static org.openqa.selenium.testing.drivers.Browser.CHROME;
import static org.openqa.selenium.testing.drivers.Browser.FIREFOX;
import static org.openqa.selenium.testing.drivers.Browser.SAFARI;

public class ProxySettingTest extends JUnit4TestBase {

  private final List<TearDownFixture> tearDowns = new ArrayList<>();

  private ProxyServer proxyServer;

  @Before
  public void newProxyInstance() {
    proxyServer = new ProxyServer();
    tearDowns.add(proxyServer::destroy);
  }

  @After
  public void tearDown() {
    tearDowns.forEach(Safely::safelyCall);
  }

  @Test
  @Ignore(SAFARI)
  @NeedsLocalEnvironment
  @NoDriverBeforeTest
  @NoDriverAfterTest
  public void canConfigureManualHttpProxy() {
    Proxy proxyToUse = proxyServer.asProxy();

    createNewDriver(new ImmutableCapabilities(PROXY, proxyToUse));

    driver.get(appServer.whereElseIs("simpleTest.html"));
    assertThat(proxyServer.hasBeenCalled("simpleTest.html")).isTrue();
  }

  @Test
  @Ignore(SAFARI)
  @NeedsLocalEnvironment
  @NoDriverBeforeTest
  @NoDriverAfterTest
  public void canConfigureNoProxy() {
    Proxy proxyToUse = proxyServer.asProxy();
    proxyToUse.setNoProxy("localhost, 127.0.0.1, " + appServer.getHostName());

    createNewDriver(new ImmutableCapabilities(PROXY, proxyToUse));

    driver.get(appServer.whereIs("simpleTest.html"));
    assertThat(proxyServer.hasBeenCalled("simpleTest.html")).isFalse();

    driver.get(appServer.whereElseIs("simpleTest.html"));
    assertThat(proxyServer.hasBeenCalled("simpleTest.html")).isTrue();
  }

  @Test
  @Ignore(SAFARI)
  @NeedsLocalEnvironment
  @NoDriverBeforeTest
  @NoDriverAfterTest
  public void canConfigureProxyThroughPACFile() {
    Server<?> helloServer = createSimpleHttpServer(
        "<!DOCTYPE html><title>Hello</title><h3>Hello, world!</h3>");
    Server<?> pacFileServer = createPacfileServer(Joiner.on('\n').join(
        "function FindProxyForURL(url, host) {",
        "  return 'PROXY " + getHostAndPort(helloServer) + "';",
        "}"));

    Proxy proxy = new Proxy();
    proxy.setProxyAutoconfigUrl("http://" + getHostAndPort(pacFileServer) + "/proxy.pac");

    createNewDriver(new ImmutableCapabilities(PROXY, proxy));

    driver.get(appServer.whereElseIs("mouseOver.html"));
    assertThat(driver.findElement(By.tagName("h3")).getText()).isEqualTo("Hello, world!");
  }

  @Test
  @Ignore(SAFARI)
  @NeedsLocalEnvironment
  @NoDriverBeforeTest
  @NoDriverAfterTest
  @Ignore(value = FIREFOX, travis = true)
  @Ignore(value = CHROME, reason = "Flaky")
  public void canUsePACThatOnlyProxiesCertainHosts() {
    Server<?> helloServer = createSimpleHttpServer(
        "<!DOCTYPE html><title>Hello</title><h3>Hello, world!</h3>");
    Server<?> goodbyeServer = createSimpleHttpServer(
        "<!DOCTYPE html><title>Goodbye</title><h3>Goodbye, world!</h3>");
    Server<?> pacFileServer = createPacfileServer(Joiner.on('\n').join(
        "function FindProxyForURL(url, host) {",
        "  if (url.indexOf('" + getHostAndPort(helloServer) + "') != -1) {",
        "    return 'PROXY " + getHostAndPort(goodbyeServer) + "';",
        "  }",
        "  return 'DIRECT';",
        "}"));

    Proxy proxy = new Proxy();
    proxy.setProxyAutoconfigUrl("http://" + getHostAndPort(pacFileServer) + "/proxy.pac");

    createNewDriver(new ImmutableCapabilities(PROXY, proxy));

    driver.get("http://" + getHostAndPort(helloServer));
    assertThat(driver.findElement(By.tagName("h3")).getText()).isEqualTo("Goodbye, world!");

    driver.get(appServer.whereElseIs("simpleTest.html"));
    assertThat(driver.findElement(By.tagName("h1")).getText()).isEqualTo("Heading");
  }

  private Server<?> createSimpleHttpServer(final String responseHtml) {
    return createServer(
      req -> new HttpResponse()
        .setHeader("Content-Type", "text/html; charset=utf-8")
        .setContent(Contents.utf8String(responseHtml)));
  }

  private Server<?> createPacfileServer(final String pacFileContents) {
    return createServer(
      req -> new HttpResponse()
        .setHeader("Content-Type", "application/x-javascript-config; charset=us-ascii")
        .setContent(Contents.bytes(pacFileContents.getBytes(US_ASCII))));
  }

  private Server<?> createServer(HttpHandler handler) {
    Server<?> server = new JreServer(
      new BaseServerOptions(new MapConfig(
        singletonMap("server", singletonMap("port", PortProber.findFreePort())))),
      handler)
      .start();

    tearDowns.add(server::stop);

    return server;
  }

  private static HostAndPort getHostAndPort(Server<?> server) {
    URL url = server.getUrl();
    return HostAndPort.fromParts(url.getHost(), url.getPort());
  }

  public static class ProxyServer {
    private final HttpProxyServer proxyServer;
    private final String baseUrl;
    private final List<String> uris = new ArrayList<>();

    public ProxyServer() {
      int port = PortProber.findFreePort();

      String address = new NetworkUtils().getPrivateLocalAddress();
      baseUrl = String.format("%s:%d", address, port);

      proxyServer = DefaultHttpProxyServer.bootstrap().withAllowLocalOnly(false).withPort(port)
          .withFiltersSource(new HttpFiltersSourceAdapter() {
            @Override
            public HttpFilters filterRequest(HttpRequest originalRequest, ChannelHandlerContext ctx) {
              return new HttpFiltersAdapter(originalRequest) {
                @Override
                public io.netty.handler.codec.http.HttpResponse clientToProxyRequest(HttpObject httpObject) {
                  String uri = originalRequest.uri();
                  String[] parts = uri.split("/");
                  if (parts.length == 0) {
                    return null;
                  }
                  String finalPart = parts[parts.length - 1];
                  uris.add(finalPart);
                  return null;
                }

                @Override
                public HttpObject serverToProxyResponse(HttpObject httpObject) {
                  return httpObject;
                }
              };
            }
          })
          .start();
    }

    /**
     * Checks if a resource has been requested using the short name of the resource.
     *
     * @param resourceName The short name of the resource to check.
     * @return true if the resource has been called.
     */
    public boolean hasBeenCalled(String resourceName) {
      return uris.contains(resourceName);
    }

    public void destroy() {
      proxyServer.stop();
    }

    public Proxy asProxy() {
      Proxy proxy = new Proxy();
      proxy.setHttpProxy(baseUrl);
      return proxy;
    }
  }
}
