package org.openqa.selenium.grid.hub;

import static com.google.common.net.MediaType.JSON_UTF_8;
import static java.net.HttpURLConnection.HTTP_OK;
import static java.nio.charset.StandardCharsets.UTF_8;
import static org.openqa.selenium.json.Json.MAP_TYPE;

import com.google.common.collect.ImmutableMap;

import org.openqa.selenium.grid.protocol.Registration;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.server.CommandHandler;
import org.openqa.selenium.remote.server.scheduler.Distributor;
import org.openqa.selenium.remote.server.scheduler.Host;

import java.io.IOException;
import java.util.Map;
import java.util.Objects;

public class Register implements CommandHandler {

  private final Json json;
  private final Distributor distributor;

  public Register(Json json, Distributor distributor) {
    this.json = Objects.requireNonNull(json);
    this.distributor = Objects.requireNonNull(distributor);
  }

  @Override
  public void execute(HttpRequest req, HttpResponse resp) throws IOException {
    System.out.println("Registering: " + req.getContentString());
    Map<String, Object> raw = json.toType(req.getContentString(), MAP_TYPE);
    Registration registration = new Registration(raw);

    Host host = Host.builder()
        .name(registration.getId())
        .create();

    distributor.add(host);

    // The old protocol just checked for a 200 response. We're good
    resp.setStatus(HTTP_OK);
    resp.setHeader("Content-Type", JSON_UTF_8.toString());

    byte[] converted = json.toJson(
        ImmutableMap.of("value", "registered " + registration.getId()))
        .getBytes(UTF_8);

    resp.setHeader("Content-Length", String.valueOf(converted.length));
    resp.setContent(converted);
  }
}
