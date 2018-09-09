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

package org.openqa.grid.e2e.misc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

import com.google.common.base.Function;

import org.junit.After;
import org.junit.Test;
import org.openqa.grid.internal.utils.configuration.GridHubConfiguration;
import org.openqa.grid.selenium.GridLauncherV3;
import org.openqa.grid.shared.Stoppable;
import org.openqa.grid.web.Hub;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.net.UrlChecker;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpMethod;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.server.SeleniumServer;
import org.openqa.selenium.support.ui.FluentWait;

import java.io.BufferedReader;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.PrintStream;
import java.net.MalformedURLException;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

/**
 * Ensure that launching the hub / node in most common ways simulating command line args works
 */
public class GridViaCommandLineTest {

  private Optional<Stoppable> server;
  private Optional<Stoppable> node;

  @After
  public void stopServer() {
    if (server != null) {
      server.ifPresent(Stoppable::stop);
    }
    if (node != null) {
      node.ifPresent(Stoppable::stop);
    }
  }

  @Test
  public void unrecognizedRole() {
    ByteArrayOutputStream outSpy = new ByteArrayOutputStream();
    String[] args = {"-role", "hamlet"};
    new GridLauncherV3(new PrintStream(outSpy), args).launch();
    assertThat(outSpy.toString())
        .startsWith("Error: the role 'hamlet' does not match a recognized server role");
  }

  @Test
  public void canPrintVersion() {
    ByteArrayOutputStream outSpy = new ByteArrayOutputStream();
    String[] args = {"-version"};
    new GridLauncherV3(new PrintStream(outSpy), args).launch();
    assertThat(outSpy.toString()).startsWith("Selenium server version: ");
  }

  @Test
  public void canPrintGeneralHelp() {
    ByteArrayOutputStream outSpy = new ByteArrayOutputStream();
    String[] args = {"-help"};
    new GridLauncherV3(new PrintStream(outSpy), args).launch();
    assertThat(outSpy.toString()).startsWith("Usage: <main class> [options]").contains("-role");
  }

  @Test
  public void canPrintHubHelp() {
    ByteArrayOutputStream outSpy = new ByteArrayOutputStream();
    String[] args = {"-role", "hub", "-help"};
    new GridLauncherV3(new PrintStream(outSpy), args).launch();
    assertThat(outSpy.toString()).startsWith("Usage: <main class> [options]").contains("-hubConfig");
  }

  @Test
  public void canPrintNodeHelp() {
    ByteArrayOutputStream outSpy = new ByteArrayOutputStream();
    String[] args = {"-role", "node", "-help"};
    new GridLauncherV3(new PrintStream(outSpy), args).launch();
    assertThat(outSpy.toString()).startsWith("Usage: <main class> [options]").contains("-nodeConfig");
  }

  @Test
  public void canRedirectLogToFile() throws Exception {
    Integer port = PortProber.findFreePort();
    Path tempLog = Files.createTempFile("test", ".log");
    String[] args = {"-log", tempLog.toString(), "-port", port.toString()};

    server = new GridLauncherV3(args).launch();
    assertTrue(server.isPresent());
    waitUntilServerIsAvailableOnPort(port);

    String log = String.join("", Files.readAllLines(tempLog));
    assertThat(log).contains("Selenium Server is up and running on port " + port);
  }

  @Test
  public void canLaunchStandalone() throws Exception {
    Integer port = PortProber.findFreePort();
    ByteArrayOutputStream outSpy = new ByteArrayOutputStream();
    String[] args = {"-role", "standalone", "-port", port.toString()};

    server = new GridLauncherV3(new PrintStream(outSpy), args).launch();
    assertTrue(server.isPresent());
    assertThat(server.get()).isInstanceOf(SeleniumServer.class);
    waitUntilServerIsAvailableOnPort(port);

    String content = getContentOf(port, "/");
    assertThat(content).contains("Whoops! The URL specified routes to this help page.");

    String status = getContentOf(port, "/wd/hub/status");
    Map<?, ?> statusMap = new Json().toType(status, Map.class);
    assertThat(statusMap.get("status")).isEqualTo(0L);
  }

  @Test
  public void launchesStandaloneByDefault() throws Exception {
    Integer port = PortProber.findFreePort();
    ByteArrayOutputStream outSpy = new ByteArrayOutputStream();
    String[] args = {"-port", port.toString()};

    server = new GridLauncherV3(new PrintStream(outSpy), args).launch();
    assertTrue(server.isPresent());
    assertThat(server.get()).isInstanceOf(SeleniumServer.class);
    waitUntilServerIsAvailableOnPort(port);
  }

  @Test
  public void canGetDebugLogFromStandalone() throws Exception {
    Integer port = PortProber.findFreePort();
    Path tempLog = Files.createTempFile("test", ".log");
    String[] args = {"-debug", "-log", tempLog.toString(), "-port", port.toString()};

    server = new GridLauncherV3(args).launch();
    assertTrue(server.isPresent());

    WebDriver driver = new RemoteWebDriver(new URL(String.format("http://localhost:%d/wd/hub", port)),
                                           DesiredCapabilities.htmlUnit());
    driver.quit();
    assertThat(readAll(tempLog)).contains("DEBUG [WebDriverServlet.handle]");
  }

  @Test(timeout = 20000L)
  public void canSetSessionTimeoutForStandalone() throws Exception {
    Integer port = PortProber.findFreePort();
    Path tempLog = Files.createTempFile("test", ".log");
    String[] args = {"-log", tempLog.toString(), "-port", port.toString(), "-timeout", "5"};

    server = new GridLauncherV3(args).launch();
    assertTrue(server.isPresent());

    WebDriver driver = new RemoteWebDriver(new URL(String.format("http://localhost:%d/wd/hub", port)),
                                           DesiredCapabilities.htmlUnit());
    long start = System.currentTimeMillis();
    new FluentWait<>(tempLog).withTimeout(Duration.ofSeconds(100))
        .until(file -> readAll(file).contains("Removing session"));
    long end = System.currentTimeMillis();
    assertThat(end - start).isBetween(5000L, 15000L);
  }

  private String readAll(Path file) {
    try {
      return String.join("", Files.readAllLines(file));
    } catch (IOException e) {
      throw new RuntimeException(e);
    }
  }

  @Test
  public void cannotStartHtmlSuite() {
    ByteArrayOutputStream outSpy = new ByteArrayOutputStream();
    String[] args = {"-htmlSuite", "*quantum", "http://base.url", "suite.html", "report.html"};

    new GridLauncherV3(new PrintStream(outSpy), args).launch();
    assertThat(outSpy.toString()).contains("Download the Selenium HTML Runner");
  }

  @Test
  public void testRegisterNodeToHub() throws Exception {
    Integer hubPort = PortProber.findFreePort();
    String[] hubArgs = {"-role", "hub", "-host", "localhost", "-port", hubPort.toString()};

    server = new GridLauncherV3(hubArgs).launch();
    waitUntilServerIsAvailableOnPort(hubPort);

    Integer nodePort = PortProber.findFreePort();
    String[] nodeArgs = {"-role", "node", "-host", "localhost", "-hub", "http://localhost:" + hubPort,
                         "-browser", "browserName=htmlunit,maxInstances=1", "-port", nodePort.toString()};
    node = new GridLauncherV3(nodeArgs).launch();
    waitUntilServerIsAvailableOnPort(nodePort);

    waitForTextOnHubConsole(hubPort, "htmlunit");
    checkPresenceOfElementOnHubConsole(hubPort, By.cssSelector("img[src$='htmlunit.png']"));
  }

  /*
    throwOnCapabilityNotPresent is a flag used in the ProxySet. It is configured in the hub,
    and then passed to the registry, finally to the ProxySet.
    This test checks that the flag value makes it all the way to the ProxySet. Default is "true".
   */
  @Test
  public void testThrowOnCapabilityNotPresentFlagIsUsed() {
    Integer hubPort = PortProber.findFreePort();
    String[] hubArgs = {"-role", "hub", "-host", "localhost", "-port", hubPort.toString(),
                        "-throwOnCapabilityNotPresent", "true"};

    server = new GridLauncherV3(hubArgs).launch();
    Hub hub = (Hub) server.orElse(null);
    assertNotNull("Hub didn't start with given parameters." ,hub);

    assertTrue("throwOnCapabilityNotPresent was false in the Hub and it was passed as true",
                hub.getConfiguration().throwOnCapabilityNotPresent);
    assertTrue("throwOnCapabilityNotPresent was false in the ProxySet and it was passed as true",
                hub.getRegistry().getAllProxies().isThrowOnCapabilityNotPresent());

    // Stopping the hub and starting it with a new throwOnCapabilityNotPresent value
    hub.stop();
    hubArgs = new String[]{"-role", "hub", "-host", "localhost", "-port", hubPort.toString(),
                           "-throwOnCapabilityNotPresent", "false"};
    server = new GridLauncherV3(hubArgs).launch();
    hub = (Hub) server.orElse(null);
    assertNotNull("Hub didn't start with given parameters." ,hub);

    assertFalse("throwOnCapabilityNotPresent was true in the Hub and it was passed as false",
                hub.getConfiguration().throwOnCapabilityNotPresent);
    assertFalse("throwOnCapabilityNotPresent was true in the ProxySet and it was passed as false",
                hub.getRegistry().getAllProxies().isThrowOnCapabilityNotPresent());
  }

  @Test
  public void canStartHubUsingConfigFile() throws Exception {
    Integer hubPort = PortProber.findFreePort();
    Path hubConfig = Files.createTempFile("hub", ".json");
    String hubJson = String.format(
        "{ \"port\": %s,\n"
        + " \"newSessionWaitTimeout\": -1,\n"
        + " \"servlets\" : [],\n"
        + " \"withoutServlets\": [],\n"
        + " \"custom\": {},\n"
        + " \"prioritizer\": null,\n"
        + " \"capabilityMatcher\": \"org.openqa.grid.internal.utils.DefaultCapabilityMatcher\",\n"
        + " \"registry\": \"org.openqa.grid.internal.DefaultGridRegistry\",\n"
        + " \"throwOnCapabilityNotPresent\": true,\n"
        + " \"cleanUpCycle\": 10000,\n"
        + " \"role\": \"hub\",\n"
        + " \"debug\": false,\n"
        + " \"browserTimeout\": 30000,\n"
        + " \"timeout\": 3600\n"
        + "}", hubPort);
    Files.write(hubConfig, hubJson.getBytes());
    String[] hubArgs = {"-role", "hub",  "-host", "localhost", "-hubConfig", hubConfig.toString()};
    server = new GridLauncherV3(hubArgs).launch();
    waitUntilServerIsAvailableOnPort(hubPort);

    assertThat(server.get()).isInstanceOf(Hub.class);
    GridHubConfiguration realHubConfig = ((Hub) server.get()).getConfiguration();
    assertEquals(10000, realHubConfig.cleanUpCycle.intValue());
    assertEquals(30000, realHubConfig.browserTimeout.intValue());
    assertEquals(3600, realHubConfig.timeout.intValue());

    Integer nodePort = PortProber.findFreePort();
    String[] nodeArgs = {"-role", "node", "-host", "localhost", "-hub", "http://localhost:" + hubPort,
                         "-browser", "browserName=htmlunit,maxInstances=1", "-port", nodePort.toString()};
    node = new GridLauncherV3(nodeArgs).launch();
    waitUntilServerIsAvailableOnPort(nodePort);

    waitForTextOnHubConsole(hubPort, "htmlunit");
    checkPresenceOfElementOnHubConsole(hubPort, By.cssSelector("img[src$='htmlunit.png']"));
  }

  @Test
  public void canStartNodeUsingConfigFile() throws Exception {
    Integer hubPort = PortProber.findFreePort();
    String[] hubArgs = {"-role", "hub", "-port", hubPort.toString()};
    server = new GridLauncherV3(hubArgs).launch();
    waitUntilServerIsAvailableOnPort(hubPort);

    Integer nodePort = PortProber.findFreePort();
    Path nodeConfig = Files.createTempFile("node", ".json");
    String nodeJson = String.format(
        "{\n"
        + " \"capabilities\": [ { \"browserName\": \"htmlunit\", \"maxInstances\": 1 } ],\n"
        + " \"proxy\": \"org.openqa.grid.selenium.proxy.DefaultRemoteProxy\",\n"
        + " \"maxSession\": 10,\n"
        + " \"port\": %s,\n"
        + " \"register\": true,\n"
        + " \"registerCycle\": 10000,\n"
        + " \"hub\": \"http://localhost:%s\",\n"
        + " \"nodeStatusCheckTimeout\": 10000,\n"
        + " \"nodePolling\": 10000,\n"
        + " \"role\": \"node\",\n"
        + " \"unregisterIfStillDownAfter\": 20000,\n"
        + " \"downPollingLimit\": 2,\n"
        + " \"debug\": false,\n"
        + " \"servlets\" : [],\n"
        + " \"withoutServlets\": [],\n"
        + " \"custom\": {}\n"
        + "}", nodePort, hubPort);
    Files.write(nodeConfig, nodeJson.getBytes());
    String[] nodeArgs = {"-role", "node", "-nodeConfig", nodeConfig.toString() };
    node = new GridLauncherV3(nodeArgs).launch();
    waitUntilServerIsAvailableOnPort(nodePort);

    waitForTextOnHubConsole(hubPort, "htmlunit");
    checkPresenceOfElementOnHubConsole(hubPort, By.cssSelector("img[src$='htmlunit.png']"));
  }

  private void waitForTextOnHubConsole(Integer hubPort, String text) throws MalformedURLException {
    new FluentWait<>(new URL(String.format("http://localhost:%d/grid/console", hubPort)))
        .withTimeout(Duration.ofSeconds(5)).pollingEvery(Duration.ofMillis(50))
        .until((Function<URL, Boolean>) u -> {
          try (InputStream is = u.openConnection().getInputStream();
               InputStreamReader isr = new InputStreamReader(is, StandardCharsets.UTF_8);
               BufferedReader reader = new BufferedReader(isr)) {
            return reader.lines().anyMatch(l -> l.contains(text));
          } catch (IOException ioe) {
            return false;
          }
        });
  }

  private void waitUntilServerIsAvailableOnPort(int port) throws Exception {
    waitUntilAvailable(String.format("http://localhost:%d/wd/hub/status", port));
  }

  private void waitUntilAvailable(String url) throws Exception {
    new UrlChecker().waitUntilAvailable(10, TimeUnit.SECONDS, new URL(url));
  }

  private String getContentOf(int port, String path) throws Exception {
    String baseUrl = String.format("http://localhost:%d", port);
    HttpClient client = HttpClient.Factory.createDefault().createClient(new URL(baseUrl));
    HttpRequest req = new HttpRequest(HttpMethod.GET, path);
    return client.execute(req).getContentString();

  }

  private void checkPresenceOfElementOnHubConsole(Integer hubPort, By locator)
      throws MalformedURLException {
    WebDriver driver = new RemoteWebDriver(
        new URL(String.format("http://localhost:%d/wd/hub", hubPort)),
        DesiredCapabilities.htmlUnit());

    try {
      driver.get(String.format("http://localhost:%d/grid/console", hubPort));
      assertEquals("Should only have one htmlunit registered to the hub",
                   1, driver.findElements(locator).size());
    } finally {
      try {
        driver.quit();
      } catch (Exception ignore) {}
    }
  }
}
