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

import com.google.common.collect.ImmutableList;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.grid.data.Availability;
import org.openqa.selenium.grid.data.NodeId;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.data.Slot;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.Json;

import java.net.URI;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class Node {

  private final NodeId id;
  private final URI uri;
  private final Availability status;
  private final int maxSession;
  private final Map<Capabilities, Integer> capabilities;
  private static final Json JSON = new Json();
  private final Map<Session, Slot> activeSessions;


  public Node(NodeId id,
              URI uri,
              Availability status,
              int maxSession,
              Map<Capabilities, Integer> capabilities,
              Map<Session, Slot> activeSessions) {
    this.id = Require.nonNull("Node id", id);
    this.uri = Require.nonNull("Node uri", uri);
    this.status = status;
    this.maxSession = maxSession;
    this.capabilities = Require.nonNull("Node capabilities", capabilities);
    this.activeSessions = Require.nonNull("Active sessions", activeSessions);
  }

  public List<org.openqa.selenium.grid.graphql.Session> getSessions() {
    return activeSessions.entrySet().stream()
        .map(this::createGraphqlSession)
        .collect(ImmutableList.toImmutableList());
  }

  public NodeId getId() {
    return id;
  }

  public URI getUri() {
    return uri;
  }

  public int getMaxSession() {
    return maxSession;
  }

  public List<String> getActiveSessionIds() {
    return activeSessions.keySet().stream().map(session -> session.getId().toString())
        .collect(ImmutableList.toImmutableList());
  }

  public String getCapabilities() {
    List<Map<String, Object> > toReturn = new ArrayList<>();

    for (Map.Entry<Capabilities, Integer> entry : capabilities.entrySet()) {
      Map<String, Object> details  = new HashMap<>();
      details.put("browserName", entry.getKey().getBrowserName());
      details.put("slots", entry.getValue());
      toReturn.add(details);
    }

    return JSON.toJson(toReturn);
  }

  public Availability getStatus() {
    return status;
  }

  private org.openqa.selenium.grid.graphql.Session createGraphqlSession(
      Map.Entry<Session, Slot> entry) {
    Session session = entry.getKey();
    Slot slot = entry.getValue();

    return new org.openqa.selenium.grid.graphql.Session(
        session.getId().toString(),
        session.getCapabilities(),
        session.getStartTime(),
        session.getUri(),
        id.toString(),
        uri,
        slot
    );
  }
}
