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

package org.openqa.selenium.grid.distributor.model;

import org.openqa.selenium.events.EventBus;
import org.openqa.selenium.grid.node.Node;
import org.openqa.selenium.internal.Require;

import java.util.HashSet;
import java.util.Set;
import java.util.logging.Logger;

import static org.openqa.selenium.grid.data.NodeAddedEvent.NODE_ADDED;
import static org.openqa.selenium.grid.data.NodeRemovedEvent.NODE_REMOVED;

public class GridModel {

  private static final Logger LOG = Logger.getLogger("Grid Model");
  private final EventBus bus;
  private final Set<Node> nodes = new HashSet<>();

  public GridModel(EventBus bus) {
    this.bus = Require.nonNull("EventBus", bus);

    this.bus.addListener(NODE_ADDED, event -> addNode(event.getData(Node.class)));
    this.bus.addListener(NODE_REMOVED, event -> removeNode(event.getData(Node.class)));
  }

  private void addNode(Node node){
    nodes.add(node);
  }

  private void removeNode(Node nodeToRemove) {
    nodes.removeIf(node -> nodeToRemove.getId().equals(node.getId()));
  }

  public Set<Node> getNodes() {
    return nodes;
  }
}
