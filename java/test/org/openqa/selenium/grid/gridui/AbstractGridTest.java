package org.openqa.selenium.grid.gridui;

import static org.openqa.selenium.json.Json.MAP_TYPE;
import static org.openqa.selenium.remote.http.HttpMethod.GET;

import com.google.common.collect.ImmutableMap;
import java.time.Duration;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import org.openqa.selenium.grid.commands.Standalone;
import org.openqa.selenium.grid.config.Config;
import org.openqa.selenium.grid.config.MapConfig;
import org.openqa.selenium.grid.config.MemoizedConfig;
import org.openqa.selenium.grid.server.Server;
import org.openqa.selenium.grid.web.Values;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.support.ui.FluentWait;

public abstract class AbstractGridTest {

  protected void waitUntilReady(Server<?> server) {
    try (HttpClient client = HttpClient.Factory.createDefault().createClient(server.getUrl())) {
      new FluentWait<>(client)
        .withTimeout(Duration.ofSeconds(5))
        .until(
          c -> {
            HttpResponse response = c.execute(new HttpRequest(GET, "/status"));
            Map<String, Object> status = Values.get(response, MAP_TYPE);
            return status != null && Boolean.TRUE.equals(status.get("ready"));
          });
    }
  }

  protected Server<?> createStandalone() {
    return createStandalone(Collections.emptyMap());
  }

  protected Server<?> createStandalone(Map<String, Object> input) {
    int port = PortProber.findFreePort();
    Map<String, Object> nodeData = new HashMap<>(input);
    nodeData.putAll(ImmutableMap.of("detect-drivers", true, "selenium-manager", true));
    Config config = new MemoizedConfig(
      new MapConfig(ImmutableMap.of(
        "server", Collections.singletonMap("port", port),
        "node", nodeData)));

    Server<?> server = new Standalone().asServer(config).start();

    waitUntilReady(server);

    return server;
  }
}
