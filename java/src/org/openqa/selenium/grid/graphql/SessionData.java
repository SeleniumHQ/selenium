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

import graphql.schema.DataFetcher;
import graphql.schema.DataFetchingEnvironment;
import java.util.Set;
import org.openqa.selenium.grid.data.NodeStatus;
import org.openqa.selenium.grid.data.Slot;
import org.openqa.selenium.grid.distributor.Distributor;
import org.openqa.selenium.internal.Require;

public class SessionData implements DataFetcher {

  private final Distributor distributor;

  public SessionData(Distributor distributor) {
    this.distributor = Require.nonNull("Distributor", distributor);
  }

  @Override
  public Object get(DataFetchingEnvironment environment) {
    String sessionId = environment.getArgument("id");

    if (sessionId.isEmpty()) {
      throw new SessionNotFoundException("Session id is empty. A valid session id is required.");
    }

    Set<NodeStatus> nodeStatuses = distributor.getStatus().getNodes();

    SessionInSlot currentSession = findSession(sessionId, nodeStatuses);

    if (currentSession != null) {
      org.openqa.selenium.grid.data.Session session = currentSession.session;

      return new org.openqa.selenium.grid.graphql.Session(
          session.getId().toString(),
          session.getCapabilities(),
          session.getStartTime(),
          session.getUri(),
          currentSession.node.getNodeId().toString(),
          currentSession.node.getExternalUri(),
          currentSession.slot);
    } else {
      throw new SessionNotFoundException(
          "No ongoing session found with the requested session id.", sessionId);
    }
  }

  private SessionInSlot findSession(String sessionId, Set<NodeStatus> nodeStatuses) {
    for (NodeStatus status : nodeStatuses) {
      for (Slot slot : status.getSlots()) {
        org.openqa.selenium.grid.data.Session session = slot.getSession();

        if (session != null && sessionId.equals(session.getId().toString())) {
          return new SessionInSlot(session, status, slot);
        }
      }
    }
    return null;
  }

  private static class SessionInSlot {
    private final org.openqa.selenium.grid.data.Session session;
    private final NodeStatus node;
    private final Slot slot;

    SessionInSlot(org.openqa.selenium.grid.data.Session session, NodeStatus node, Slot slot) {
      this.session = session;
      this.node = node;
      this.slot = slot;
    }
  }
}
