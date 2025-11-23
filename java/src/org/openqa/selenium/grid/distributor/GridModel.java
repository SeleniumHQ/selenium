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

package org.openqa.selenium.grid.distributor;

import java.util.Set;
import org.openqa.selenium.grid.data.Availability;
import org.openqa.selenium.grid.data.NodeId;
import org.openqa.selenium.grid.data.NodeStatus;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.data.SlotId;
import org.openqa.selenium.remote.SessionId;

/**
 * An abstract representation of the Grid's node state model. This abstraction allows for different
 * implementations that can store state either locally or in an external datastore for high
 * availability.
 */
public abstract class GridModel {

  /**
   * Adds a node to the grid model, typically starting with DOWN availability until health checks
   * pass.
   *
   * @param node The node status to add
   */
  public abstract void add(NodeStatus node);

  /**
   * Refreshes a node's status in the grid model.
   *
   * @param status The updated node status
   */
  public abstract void refresh(NodeStatus status);

  /**
   * Updates the timestamp for a node to prevent it from being considered stale. May also update the
   * node's availability if reported differently.
   *
   * @param nodeStatus The node status to update
   */
  public abstract void touch(NodeStatus nodeStatus);

  /**
   * Removes a node from the grid model.
   *
   * @param id The ID of the node to remove
   */
  public abstract void remove(NodeId id);

  /** Removes nodes that have been unresponsive for too long. */
  public abstract void purgeDeadNodes();

  /**
   * Sets the availability status for a node.
   *
   * @param id The ID of the node
   * @param availability The new availability status
   */
  public abstract void setAvailability(NodeId id, Availability availability);

  /**
   * Attempts to reserve a specific slot on a node.
   *
   * @param slotId The ID of the slot to reserve
   * @return true if the reservation was successful, false otherwise
   */
  public abstract boolean reserve(SlotId slotId);

  /**
   * Gets a snapshot of all node statuses currently in the grid model.
   *
   * @return A set of node statuses
   */
  public abstract Set<NodeStatus> getSnapshot();

  /**
   * Releases a session, making its slot available again.
   *
   * @param id The ID of the session to release
   */
  public abstract void release(SessionId id);

  /**
   * Updates a reserved slot to contain an actual session.
   *
   * @param slotId The ID of the slot to update
   * @param session The session to associate with the slot, or null to clear
   */
  public abstract void setSession(SlotId slotId, Session session);

  /**
   * Updates the health check count for a node based on its availability.
   *
   * @param id The ID of the node
   * @param availability The current availability status
   */
  public abstract void updateHealthCheckCount(NodeId id, Availability availability);
}
