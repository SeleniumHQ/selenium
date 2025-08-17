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

import java.io.Closeable;
import java.net.URI;
import java.util.Set;
import org.openqa.selenium.grid.data.Availability;
import org.openqa.selenium.grid.data.DistributorStatus;
import org.openqa.selenium.grid.data.NodeId;
import org.openqa.selenium.grid.data.NodeStatus;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.data.SlotId;
import org.openqa.selenium.grid.node.Node;
import org.openqa.selenium.status.HasReadyState;

/**
 * Maintains a registry of the nodes available for a {@link
 * org.openqa.selenium.grid.distributor.Distributor}. Implementations may store nodes in memory or
 * in an external data store to allow for high availability configurations.
 */
public interface NodeRegistry extends HasReadyState, Closeable {

  /**
   * Register a node status received from an event.
   *
   * @param status The node status to register.
   */
  void register(NodeStatus status);

  /**
   * Add a node to this registry.
   *
   * @param node The node to add.
   */
  void add(Node node);

  /**
   * Removes a node from this registry.
   *
   * @param nodeId The id of the node to remove.
   */
  void remove(NodeId nodeId);

  /**
   * Set a node to draining state.
   *
   * @param nodeId The id of the node to drain.
   * @return true if the node was set to draining, false otherwise.
   */
  boolean drain(NodeId nodeId);

  /**
   * Updates a node's availability status.
   *
   * @param nodeUri The URI of the node.
   * @param id The id of the node.
   * @param availability The new availability status.
   */
  void updateNodeAvailability(URI nodeUri, NodeId id, Availability availability);

  /** Refreshes all nodes by running a health check on each one. */
  void refresh();

  /**
   * Gets a snapshot of all registered nodes.
   *
   * @return The current status of the distributor.
   */
  DistributorStatus getStatus();

  /**
   * Gets all available nodes that are not DOWN or DRAINING.
   *
   * @return Set of available node statuses.
   */
  Set<NodeStatus> getAvailableNodes();

  /**
   * Gets a node by its ID.
   *
   * @param id The node ID to look up.
   * @return The node, or null if not found.
   */
  Node getNode(NodeId id);

  /**
   * Gets the total number of nodes that are UP.
   *
   * @return The number of UP nodes.
   */
  long getUpNodeCount();

  /**
   * Gets the total number of nodes that are DOWN.
   *
   * @return The number of DOWN nodes.
   */
  long getDownNodeCount();

  /** Run health checks on all nodes. */
  void runHealthChecks();

  /**
   * Reserve a slot for a session.
   *
   * @param slotId The slot ID to reserve.
   * @return Whether the reservation was successful.
   */
  boolean reserve(SlotId slotId);

  /**
   * Set a session for a particular slot.
   *
   * @param slotId The slot ID.
   * @param session The session to associate with the slot, or null to clear.
   */
  void setSession(SlotId slotId, Session session);

  /** Get the number of active slots. */
  int getActiveSlots();

  /** Get the number of idle slots. */
  int getIdleSlots();

  /**
   * Get node by URI.
   *
   * @param uri The node URI to look up.
   * @return The node if found, null otherwise.
   */
  Node getNode(URI uri);
}
