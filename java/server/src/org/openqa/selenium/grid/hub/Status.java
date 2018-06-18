package org.openqa.selenium.grid.hub;

import static com.google.common.net.MediaType.JSON_UTF_8;
import static java.net.HttpURLConnection.HTTP_OK;
import static java.nio.charset.StandardCharsets.UTF_8;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;
import com.google.common.net.MediaType;

import org.openqa.selenium.internal.BuildInfo;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.json.JsonOutput;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.server.CommandHandler;
import org.openqa.selenium.remote.server.scheduler.Distributor;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.net.HttpURLConnection;
import java.util.Map;

public class Status implements CommandHandler {

  private final Json json;
  private final Distributor distributor;

  public Status(Json json, Distributor distributor) {
    this.json = json;
    this.distributor = distributor;
  }

  @Override
  public void execute(HttpRequest req, HttpResponse resp) throws IOException {
    ImmutableMap.Builder<String, Object> value = ImmutableMap.<String, Object>builder()
        // W3
        .put("ready", true)
        .put("message", "Ready for anything. Including cheese");

    // Now add data about the available hosts.
    value.put("role", "hub");
    ImmutableList.Builder<Map<String, Object>> hosts = ImmutableList.builder();

    distributor.getHosts().forEach(host -> {
      hosts.add(ImmutableMap.of(
          "name", host.getName(),
          "status", host.getStatus().toString().toLowerCase(),
          "remainingSlots", host.getRemainingCapacity(),
          "sessionCount", host.getSessionCount()));
    });
    value.put("hosts", hosts.build());

    // Now build and OS data about the hub itself.
    BuildInfo info = new BuildInfo();
    value.put("build", ImmutableMap.of(
        "version", info.getReleaseLabel(),
        "revision", info.getBuildRevision(),
        "time", info.getBuildTime()));

    value.put("os", ImmutableMap.of(
        "name", System.getProperty("os.name"),
        "arch", System.getProperty("os.arch"),
        "version", System.getProperty("os.version")));

    value.put("java", ImmutableMap.of("version", System.getProperty("java.version")));

    StringBuilder builder = new StringBuilder();

    resp.setStatus(HTTP_OK);
    resp.setHeader("Content-Type", JSON_UTF_8.toString());

    try (JsonOutput out = json.newOutput(builder)) {
      out.write(ImmutableMap.of("value", value.build()));

      byte[] bytes = builder.toString().getBytes(UTF_8);
      resp.setHeader("Content-Length", String.valueOf(bytes.length));

      resp.setContent(bytes);
    }
  }
}
