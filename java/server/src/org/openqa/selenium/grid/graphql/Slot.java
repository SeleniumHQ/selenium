package org.openqa.selenium.grid.graphql;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.Json;

public class Slot {

  private static final DateTimeFormatter DATE_TIME_FORMATTER =
      DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss").withZone(ZoneId.systemDefault());

  private final UUID id;
  private final Capabilities stereotype;
  private final Instant lastStarted;
  private static final Json JSON = new Json();

  public Slot(UUID id, Capabilities stereotype, Instant lastStarted) {
    this.id = Require.nonNull("Slot ID", id);
    this.stereotype = ImmutableCapabilities.copyOf(Require.nonNull("Stereotype", stereotype));
    this.lastStarted = Require.nonNull("Last started", lastStarted);
  }

  public String getId() {
    return id.toString();
  }

  public String getStereotype() {
    return JSON.toJson(stereotype);
  }

  public String getLastStarted() {
    return DATE_TIME_FORMATTER.format(lastStarted);
  }

}

