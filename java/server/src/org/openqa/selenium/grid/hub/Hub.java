package org.openqa.selenium.grid.hub;

import com.google.common.collect.ImmutableMap;

import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.server.CommandHandler;
import org.openqa.selenium.remote.server.commandhandler.NoHandler;
import org.openqa.selenium.remote.server.scheduler.Distributor;

import java.io.IOException;
import java.util.Map;

public class Hub implements CommandHandler {
  private final Map<String, CommandHandler> handlers;
  private final CommandHandler missing;

  public Hub(
      Json json,
      Distributor distributor) {
    missing = new NoHandler(json);

    handlers = ImmutableMap.of(
        "/status", new Status(json, distributor));
  }

  @Override
  public void execute(HttpRequest req, HttpResponse resp) throws IOException {
    handlers.getOrDefault(req.getUri(), missing).execute(req, resp);
  }
}
