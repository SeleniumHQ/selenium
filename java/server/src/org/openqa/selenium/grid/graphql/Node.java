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
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.data.Status;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.Json;

import java.net.URI;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

public class Node {

  private final UUID id;
  private final URI uri;
  private final Status status;
  private final int maxSession;
  private final Map<Capabilities, Integer> capabilities;
  private static final Json JSON = new Json();
  private final Set<Session> activeSessions;


  public Node(UUID id,
              URI uri,
              Status status,
              int maxSession,
              Map<Capabilities, Integer> capabilities,
              Set<Session> activeSessions) {
    this.id = Require.nonNull("Node id", id);
    this.uri = Require.nonNull("Node uri", uri);
    this.status = status;
    this.maxSession = maxSession;
    this.capabilities = Require.nonNull("Node capabilities", capabilities);
    this.activeSessions = Require.nonNull("Active sessions", activeSessions);
  }

  public List<org.openqa.selenium.grid.graphql.Session> getSessions() {
    return activeSessions.stream()
        .map(session -> new org.openqa.selenium.grid.graphql.Session(session.getId().toString(),
                                                                     session.getCapabilities(),
                                                                     session.getStartTime()))
        .collect(ImmutableList.toImmutableList());
  }

  public UUID getId() {
    return id;
  }

  public URI getUri() {
    return uri;
  }

  public int getMaxSession() {
    return maxSession;
  }

  public List<String> getActiveSessionIds() {
      return activeSessions.stream().map(session -> session.getId().toString())
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

  public Status getStatus() {
    return status;
  }
}
