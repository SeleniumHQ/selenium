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

package org.openqa.selenium.grid.graphql;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.grid.data.Slot;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.Json;

import java.net.URI;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

public class Session {

  private static final DateTimeFormatter DATE_TIME_FORMATTER =
      DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss").withZone(ZoneId.systemDefault());

  private final String id;
  private final Capabilities capabilities;
  private final Instant startTime;
  private final URI uri;
  private final String nodeId;
  private final URI nodeUri;
  private final Slot slot;
  private static final Json JSON = new Json();

  public Session(String id, Capabilities capabilities, Instant startTime, URI uri, String nodeId,
                 URI nodeUri, Slot slot) {
    this.id = Require.nonNull("Session id", id);
    this.capabilities = Require.nonNull("Session capabilities", capabilities);
    this.startTime = Require.nonNull("Session Start time", startTime);
    this.uri = Require.nonNull("Session uri", uri);
    this.nodeId = Require.nonNull("Node id", nodeId);
    this.nodeUri = Require.nonNull("Node uri", nodeUri);
    this.slot = Require.nonNull("Slot", slot);
  }

  public String getId() {
    return id;
  }

  public String getCapabilities() {
    return JSON.toJson(capabilities);
  }

  public String getStartTime() {
    return DATE_TIME_FORMATTER.format(startTime);
  }

  public URI getUri() {
    return uri;
  }

  public String getNodeId() {
    return nodeId;
  }

  public URI getNodeUri() {
    return nodeUri;
  }

  public String getSessionDurationMillis() {
    long duration = Duration.between(startTime, Instant.now()).toMillis();
    return String.valueOf(duration);
  }

  public org.openqa.selenium.grid.graphql.Slot getSlot() {
    return new org.openqa.selenium.grid.graphql.Slot(
        slot.getId().getSlotId(),
        slot.getStereotype(),
        slot.getLastStarted());
  }

}
