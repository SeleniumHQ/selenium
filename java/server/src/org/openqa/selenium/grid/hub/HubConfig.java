package org.openqa.selenium.grid.hub;

import static com.google.common.net.MediaType.JSON_UTF_8;
import static java.nio.charset.StandardCharsets.UTF_8;

import com.google.common.collect.ImmutableMap;

import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.server.CommandHandler;
import org.openqa.selenium.remote.server.scheduler.Distributor;

import java.io.IOException;
import java.util.Objects;

public class HubConfig implements CommandHandler {

  private final Json json;
  private final Distributor distributor;

  public HubConfig(Json json, Distributor distributor) {
    this.json = Objects.requireNonNull(json);
    this.distributor = Objects.requireNonNull(distributor);
  }


  @Override
  public void execute(HttpRequest req, HttpResponse resp) throws IOException {
    resp.setHeader("Content-Type", JSON_UTF_8.toString());

    byte[] bytes = json.toJson(ImmutableMap.of(
        "host", "localhost",
        "port", "4444",
        "role", "hub"))
        .getBytes(UTF_8);

    resp.setHeader("Content-Length", String.valueOf(bytes.length));
    resp.setContent(bytes);
  }
}
