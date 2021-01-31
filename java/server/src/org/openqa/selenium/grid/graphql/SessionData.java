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

import com.google.common.base.Suppliers;
import graphql.schema.DataFetcher;
import graphql.schema.DataFetchingEnvironment;
import org.openqa.selenium.grid.data.DistributorStatus;
import org.openqa.selenium.grid.data.NodeStatus;
import org.openqa.selenium.grid.data.Slot;
import org.openqa.selenium.grid.distributor.Distributor;
import org.openqa.selenium.internal.Require;

import java.util.Optional;
import java.util.Set;
import java.util.function.Supplier;

public class SessionData implements DataFetcher {

  private final Supplier<DistributorStatus> distributorStatus;

  public SessionData(Distributor distributor) {
    distributorStatus = Suppliers.memoize(Require.nonNull("Distributor", distributor)::getStatus);
  }

  @Override
  public Object get(DataFetchingEnvironment environment) {
    String sessionId = environment.getArgument("id");

    if (sessionId.isEmpty()) {
      throw new SessionNotFoundException("Session id is empty. A valid session id is required.");
    }

    Set<NodeStatus> nodeStatuses = distributorStatus.get().getNodes();

    SessionInSlot currentSession = findSession(sessionId, nodeStatuses);

    if (currentSession != null) {
      org.openqa.selenium.grid.data.Session session = currentSession.session;

      return new org.openqa.selenium.grid.graphql.Session(
        session.getId().toString(),
        session.getCapabilities(),
        session.getStartTime(),
        session.getUri(),
        currentSession.node.getId().toString(),
        currentSession.node.getUri(),
        currentSession.slot);
    } else {
      throw new SessionNotFoundException("No ongoing session found with the requested session id.",
                                         sessionId);
    }
  }

  private SessionInSlot findSession(String sessionId, Set<NodeStatus> nodeStatuses) {
    for (NodeStatus status : nodeStatuses) {
      for (Slot slot : status.getSlots()) {
        Optional<org.openqa.selenium.grid.data.Session> session = slot.getSession();

        if (session.isPresent() && sessionId.equals(session.get().getId().toString())) {
          return new SessionInSlot(session.get(), status, slot);
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
