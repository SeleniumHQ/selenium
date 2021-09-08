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

package org.openqa.selenium.redis;

import io.lettuce.core.KeyValue;
import io.lettuce.core.RedisClient;
import io.lettuce.core.RedisURI;
import io.lettuce.core.api.StatefulRedisConnection;
import org.openqa.selenium.grid.data.Availability;
import org.openqa.selenium.grid.data.NodeId;
import org.openqa.selenium.grid.data.NodeStatus;
import org.redisson.Redisson;
import org.redisson.api.RLiveObjectService;
import org.redisson.api.RSet;
import org.redisson.api.RedissonClient;
import org.redisson.config.Config;
import org.redisson.config.SingleServerConfig;

import java.io.Closeable;
import java.net.URI;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

public class GridRedisClient implements Closeable {
  private final RedisClient client;
  private final RedissonClient redissonClient;
  private final StatefulRedisConnection<String, String> connection;
  private final RLiveObjectService service;

  public GridRedisClient(URI serverUri) {
    client = RedisClient.create(RedisURI.create(serverUri));
    connection = client.connect();

    Config redissonConfig = new Config();
    redissonConfig.setNettyThreads(0);
    SingleServerConfig singleServerConfig = redissonConfig.useSingleServer();
    singleServerConfig.setAddress(serverUri.toString());
    singleServerConfig.setConnectionMinimumIdleSize(5);
    singleServerConfig.setConnectionPoolSize(5);
    redissonClient = Redisson.create(redissonConfig);
    service = redissonClient.getLiveObjectService();
  }

  public StatefulRedisConnection<String, String> getConnection() {
    return connection;
  }

  public void mset(Map<String, String> map) {
    connection.sync().mset(map);
  }

  public List<KeyValue<String, String>> mget(String... keys) {
    return connection.sync().mget(keys);
  }

  public String get(String key) {
    return connection.sync().get(key);
  }

  public List<String> getKeysByPattern(String pattern) {
    return connection.sync().keys(pattern);
  }

  public boolean isOpen() {
    return connection.isOpen();
  }

  public void del(String... var1) {
    connection.sync().del(var1);
  }

  @Override
  public void close() {
    client.shutdown();
    redissonClient.shutdown();
  }

  public void addNodeAvailability(Availability availability, NodeStatus node) {
    RSet<NodeId> nodeAvailabilitySet = redissonClient.getSet(availability.name());
    nodeAvailabilitySet.add(node.getNodeId());
  }

  public void removeNodeAvailability(Availability availability, NodeStatus node) {
    RSet<NodeId> nodeAvailabilitySet = redissonClient.getSet(availability.name());
    nodeAvailabilitySet.remove(node.getNodeId());
  }

  public void addAllNodeAvailability(Availability availability, Set<NodeId> nodes) {
    RSet<NodeId> nodeAvailabilitySet = redissonClient.getSet(availability.name());
    nodeAvailabilitySet.addAll(nodes);
  }

  public void removeAllNodeAvailability(Availability availability, Set<NodeId> nodes) {
    RSet<NodeId> nodeAvailabilitySet = redissonClient.getSet(availability.name());
    nodeAvailabilitySet.removeAll(nodes);
  }

  public boolean getNodeAvailability(Availability availability, NodeId id) {
    RSet<NodeId> nodeAvailabilitySet = redissonClient.getSet(availability.name());
    return nodeAvailabilitySet.contains(id);
  }

  public Set<NodeId> getNodesByAvailability(Availability availability) {
    return redissonClient.getSet(availability.name());
  }

  public void addNode(NodeStatus node) {
    // Add/update the current state of the Node
    service.merge(node);
  }

  public void removeNode(NodeId id) {
    service.delete(NodeStatus.class, id);
  }

  public Optional<NodeStatus> getNode(NodeId id) {
    Optional<NodeStatus> maybeNode = Optional.ofNullable(service.get(NodeStatus.class, id));

    if (maybeNode.isPresent()) {
      NodeStatus node = maybeNode.get();
      NodeStatus resultNode = new NodeStatus(
        id,
        node.getExternalUri(),
        node.getMaxSessionCount(),
        node.getSlots(),
        node.getAvailability(),
        node.getHeartbeatPeriod(),
        node.getVersion(),
        node.getOsInfo());
      return Optional.of(resultNode);
    }

    return maybeNode;
  }

  public void removeAllNodes(Set<NodeId> nodeIds) {
    nodeIds.forEach(this::removeNode);
  }

  public Set<NodeStatus> getNodes(Set<NodeId> nodeIds) {
    return nodeIds.stream()
      .filter(nodeId -> getNode(nodeId).isPresent())
      .map(nodeId -> getNode(nodeId).get())
      .collect(Collectors.toSet());
  }

  public Set<NodeId> getAllNodes() {
    Set<NodeId> nodeIds = new HashSet<>();
    Iterable<NodeId> allNodeIds = service.findIds(NodeStatus.class);
    allNodeIds.forEach(nodeIds::add);

    return nodeIds;
  }
}
