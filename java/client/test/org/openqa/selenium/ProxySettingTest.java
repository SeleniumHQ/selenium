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

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.openqa.selenium.remote.CapabilityType.PROXY;
import static org.openqa.selenium.testing.Driver.CHROME;
import static org.openqa.selenium.testing.Driver.IE;
import static org.openqa.selenium.testing.Driver.MARIONETTE;
import static org.openqa.selenium.testing.Driver.PHANTOMJS;
import static org.openqa.selenium.testing.Driver.SAFARI;

import com.google.common.base.Joiner;
import com.google.common.collect.Lists;
import com.google.common.net.HostAndPort;

import org.junit.After;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.ErrorCollector;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JUnit4TestBase;
import org.openqa.selenium.testing.NeedsLocalEnvironment;
import org.openqa.selenium.testing.ProxyServer;
import org.openqa.selenium.testing.drivers.WebDriverBuilder;
import org.seleniumhq.jetty9.server.Handler;
import org.seleniumhq.jetty9.server.Request;
import org.seleniumhq.jetty9.server.Server;
import org.seleniumhq.jetty9.server.ServerConnector;
import org.seleniumhq.jetty9.server.handler.AbstractHandler;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.Callable;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@Ignore(MARIONETTE)
public class ProxySettingTest extends JUnit4TestBase {

  @Rule
  public ErrorCollector errorCollector = new ErrorCollector();

  private final List<Callable<Object>> tearDowns = Lists.newLinkedList();

  private ProxyServer proxyServer;

  @Before
  public void newProxyInstance() {
    proxyServer = new ProxyServer();
    registerProxyTeardown(proxyServer);
  }

  @After
  public void tearDown() {
    for (Callable<Object> tearDown : tearDowns) {
      errorCollector.checkSucceeds(tearDown);
    }
  }

  @Test
  @Ignore(SAFARI)
  @Ignore(PHANTOMJS)
  @NeedsLocalEnvironment
  public void canConfigureManualHttpProxy() {
    Proxy proxyToUse = proxyServer.asProxy();
    DesiredCapabilities caps = new DesiredCapabilities();
    caps.setCapability(PROXY, proxyToUse);

    WebDriver driver = new WebDriverBuilder().setDesiredCapabilities(caps).get();
    registerDriverTeardown(driver);

    driver.get(pages.simpleTestPage);
    assertTrue("Proxy should have been called", proxyServer.hasBeenCalled("simpleTest.html"));
  }

  @Test
  @Ignore(SAFARI)
  @Ignore(PHANTOMJS)
  @NeedsLocalEnvironment
  public void canConfigureProxyThroughPACFile() {
    Server helloServer = createSimpleHttpServer(
        "<!DOCTYPE html><title>Hello</title><h3>Hello, world!</h3>");
    Server pacFileServer = createPacfileServer(Joiner.on('\n').join(
        "function FindProxyForURL(url, host) {",
        "  return 'PROXY " + getHostAndPort(helloServer) + "';",
        "}"));

    Proxy proxy = new Proxy();
    proxy.setProxyAutoconfigUrl("http://" + getHostAndPort(pacFileServer) + "/proxy.pac");

    DesiredCapabilities caps = new DesiredCapabilities();
    caps.setCapability(PROXY, proxy);

    WebDriver driver = new WebDriverBuilder().setDesiredCapabilities(caps).get();
    registerDriverTeardown(driver);

    driver.get(pages.mouseOverPage);
    assertEquals("Should follow proxy to another server",
        "Hello, world!", driver.findElement(By.tagName("h3")).getText());
  }

  @Test
  @Ignore(SAFARI)
  @Ignore(PHANTOMJS)
  @NeedsLocalEnvironment
  public void canUsePACThatOnlyProxiesCertainHosts() throws Exception {
    Server helloServer = createSimpleHttpServer(
        "<!DOCTYPE html><title>Hello</title><h3>Hello, world!</h3>");
    Server goodbyeServer = createSimpleHttpServer(
        "<!DOCTYPE html><title>Goodbye</title><h3>Goodbye, world!</h3>");
    Server pacFileServer = createPacfileServer(Joiner.on('\n').join(
        "function FindProxyForURL(url, host) {",
        "  if (url.indexOf('" + getHostAndPort(helloServer) + "') != -1) {",
        "    return 'PROXY " + getHostAndPort(goodbyeServer) + "';",
        "  }",
        "  return 'DIRECT';",
        "}"));

    Proxy proxy = new Proxy();
    proxy.setProxyAutoconfigUrl("http://" + getHostAndPort(pacFileServer) + "/proxy.pac");

    DesiredCapabilities caps = new DesiredCapabilities();
    caps.setCapability(PROXY, proxy);

    WebDriver driver = new WebDriverBuilder().setDesiredCapabilities(caps).get();
    registerDriverTeardown(driver);

    driver.get("http://" + getHostAndPort(helloServer));
    assertEquals("Should follow proxy to another server",
        "Goodbye, world!", driver.findElement(By.tagName("h3")).getText());

    driver.get(pages.simpleTestPage);
    assertEquals("Proxy should have permitted direct access to host",
        "Heading", driver.findElement(By.tagName("h1")).getText());
  }

  @Test
  @Ignore(CHROME)
  @Ignore(IE)
  @Ignore(SAFARI)
  @Ignore(PHANTOMJS)
  @NeedsLocalEnvironment
  public void canConfigureProxyWithRequiredCapability() {
    Proxy proxyToUse = proxyServer.asProxy();
    DesiredCapabilities requiredCaps = new DesiredCapabilities();
    requiredCaps.setCapability(PROXY, proxyToUse);

    WebDriver driver = new WebDriverBuilder().setRequiredCapabilities(requiredCaps).get();
    registerDriverTeardown(driver);

    driver.get(pages.simpleTestPage);
    assertTrue("Proxy should have been called", proxyServer.hasBeenCalled("simpleTest.html"));
  }

  @Test
  @Ignore(CHROME)
  @Ignore(IE)
  @Ignore(SAFARI)
  @Ignore(PHANTOMJS)
  @NeedsLocalEnvironment
  public void requiredProxyCapabilityShouldHavePriority() {
    ProxyServer desiredProxyServer = new ProxyServer();
    registerProxyTeardown(desiredProxyServer);

    Proxy desiredProxy = desiredProxyServer.asProxy();
    Proxy requiredProxy = proxyServer.asProxy();

    DesiredCapabilities desiredCaps = new DesiredCapabilities();
    desiredCaps.setCapability(PROXY, desiredProxy);
    DesiredCapabilities requiredCaps = new DesiredCapabilities();
    requiredCaps.setCapability(PROXY, requiredProxy);

    WebDriver driver = new WebDriverBuilder().setDesiredCapabilities(desiredCaps).
        setRequiredCapabilities(requiredCaps).get();
    registerDriverTeardown(driver);

    driver.get(pages.simpleTestPage);

    assertFalse("Desired proxy should not have been called.",
                desiredProxyServer.hasBeenCalled("simpleTest.html"));
    assertTrue("Required proxy should have been called.",
               proxyServer.hasBeenCalled("simpleTest.html"));
  }

  private void registerDriverTeardown(final WebDriver driver) {
    tearDowns.add(() -> {
      driver.quit();
      return null;
    });
  }

  private void registerProxyTeardown(final ProxyServer proxy) {
    tearDowns.add(() -> {
      proxy.destroy();
      return null;
    });
  }

  private Server createSimpleHttpServer(final String responseHtml) {
    return createServer(new AbstractHandler() {
      @Override
      public void handle(String s, Request baseRequest, HttpServletRequest request,
                         HttpServletResponse response) throws IOException, ServletException {
        response.setContentType("text/html; charset=utf-8");
        response.setStatus(HttpServletResponse.SC_OK);
        response.getWriter().println(responseHtml);
        baseRequest.setHandled(true);
      }
    });
  }

  private Server createPacfileServer(final String pacFileContents) {
    return createServer(new AbstractHandler() {
      @Override
      public void handle(String s, Request baseRequest, HttpServletRequest request,
                         HttpServletResponse response) throws IOException, ServletException {
        response.setContentType("application/x-javascript-config; charset=us-ascii");
        response.setStatus(HttpServletResponse.SC_OK);
        response.getWriter().println(pacFileContents);
        baseRequest.setHandled(true);
      }
    });
  }

  private Server createServer(Handler handler) {
    final Server server = new Server();

    ServerConnector http = new ServerConnector(server);
    int port = PortProber.findFreePort();
    http.setPort(port);
    http.setIdleTimeout(500000);
    server.addConnector(http);

    server.setHandler(handler);

    tearDowns.add(() -> {
      try {
        server.stop();
      } catch (Exception e) {
        throw new RuntimeException(e);
      }
      return null;
    });

    try {
      server.start();
    } catch (Exception e) {
      throw new RuntimeException("Server failed to start", e);
    }
    return server;
  }

  private static HostAndPort getHostAndPort(Server server) {
    return HostAndPort.fromParts(server.getURI().getHost(), server.getURI().getPort());
  }
}
