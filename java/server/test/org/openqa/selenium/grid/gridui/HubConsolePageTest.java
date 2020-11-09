package org.openqa.selenium.grid.gridui;

import com.google.common.collect.ImmutableMap;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.*;
import org.openqa.selenium.grid.commands.Hub;
import org.openqa.selenium.grid.commands.Standalone;
import org.openqa.selenium.grid.config.*;
import org.openqa.selenium.grid.server.Server;
import org.openqa.selenium.grid.web.Values;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.FluentWait;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.io.StringReader;
import java.time.Duration;
import java.util.Map;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.openqa.selenium.json.Json.MAP_TYPE;
import static org.openqa.selenium.remote.http.HttpMethod.GET;

public class HubConsolePageTest {

  private static final int hubPort = PortProber.findFreePort();
  private static final int standalonePort = PortProber.findFreePort();

  private Server<?> hubServer;
  private Server<?> standaloneServer;

  @Before
  public void setFields() {
    this.hubServer = createHub();
    this.standaloneServer = createStandalone();
  }

  @After
  public void stopServers() {
    this.hubServer.stop();
    this.standaloneServer.stop();
  }

  @Test
  public void testNoNodePage() {
    Capabilities caps = new ImmutableCapabilities("browserName", "chrome");
    WebDriver driver = new RemoteWebDriver(standaloneServer.getUrl(), caps);
    WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(2));

    driver.get("localhost:" + hubPort + "/ui/index.html#/");

    WebElement element = wait.until(ExpectedConditions.visibilityOf(driver.findElement(By.id("ring-system"))));

    assertEquals("0% free", element.getText());
  }

  private static Server<?> createHub() {
    int publish = PortProber.findFreePort();
    int subscribe = PortProber.findFreePort();

    String[] rawConfig = new String[] {
      "[events]",
      "publish = \"tcp://localhost:" + publish + "\"",
      "subscribe = \"tcp://localhost:" + subscribe + "\"",
      "",
      "[network]",
      "relax-checks = true",
      "",
      "[node]",
      "detect-drivers = true",
      "[server]",
      "registration-secret = \"feta\""
    };

    TomlConfig baseConfig = new TomlConfig(new StringReader(String.join("\n", rawConfig)));
    Config hubConfig = new CompoundConfig(
      new MapConfig(ImmutableMap.of("events", ImmutableMap.of("bind", true))),
      baseConfig);

    Server<?> hubServer = new Hub().asServer(setRandomPort(hubConfig)).start();

    waitUntilReady(hubServer, Boolean.FALSE);

    return hubServer;
  }

  private static Server<?> createStandalone() {
    String[] rawConfig = new String[]{
      "[network]",
      "relax-checks = true",
      "[node]",
      "detect-drivers = true",
      "[server]",
      "port = " + standalonePort,
      "registration-secret = \"provolone\""
    };
    Config config = new MemoizedConfig(
      new TomlConfig(new StringReader(String.join("\n", rawConfig))));

    Server<?> server = new Standalone().asServer(config).start();

    waitUntilReady(server, Boolean.TRUE);

    return server;
  }

  private static void waitUntilReady(Server<?> server, Boolean state) {
    HttpClient client = HttpClient.Factory.createDefault().createClient(server.getUrl());

    new FluentWait<>(client)
      .withTimeout(Duration.ofSeconds(5))
      .until(c -> {
        HttpResponse response = c.execute(new HttpRequest(GET, "/status"));
        Map<String, Object> status = Values.get(response, MAP_TYPE);
        return state.equals(status.get("ready"));
      });
  }

  private static Config setRandomPort(Config config) {
    return new MemoizedConfig(
      new CompoundConfig(
        new MapConfig(ImmutableMap.of("server", ImmutableMap.of("port", hubPort))),
        config));
  }
}
