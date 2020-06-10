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

package org.openqa.selenium.grid.distributor.redis;

import static org.openqa.selenium.grid.data.NodeStatusEvent.NODE_STATUS;

import com.google.common.annotations.VisibleForTesting;
import com.google.common.collect.ImmutableMap;

import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.concurrent.Regularly;
import org.openqa.selenium.events.EventBus;
import org.openqa.selenium.grid.data.CreateSessionResponse;
import org.openqa.selenium.grid.data.DistributorStatus;
import org.openqa.selenium.grid.data.NodeAddedEvent;
import org.openqa.selenium.grid.data.NodeRemovedEvent;
import org.openqa.selenium.grid.data.NodeStatus;
import org.openqa.selenium.grid.distributor.Distributor;
import org.openqa.selenium.grid.node.Node;
import org.openqa.selenium.grid.sessionmap.SessionMap;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.tracing.Tracer;

import io.lettuce.core.RedisClient;
import io.lettuce.core.RedisURI;
import io.lettuce.core.api.StatefulRedisConnection;
import io.lettuce.core.api.sync.RedisCommands;

import java.io.Closeable;
import java.net.URI;
import java.util.Collection;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.logging.Logger;

public class RedisDistributor extends Distributor implements Closeable {
  private static final Json JSON = new Json();
  private static final Logger LOG = Logger.getLogger("Selenium Distributor (Redis)");
  private final Tracer tracer;
  private final EventBus bus;
  private final HttpClient.Factory clientFactory;
  private final SessionMap sessions;
  private final Regularly hostChecker = new Regularly("redis distributor host checker");
  private final Map<UUID, Collection<Runnable>> allChecks = new ConcurrentHashMap<>();
  private final String registrationSecret;
  private final RedisClient client;
  private final StatefulRedisConnection<String, String> connection;

  public RedisDistributor(
      Tracer tracer,
      EventBus bus,
      HttpClient.Factory clientFactory,
      SessionMap sessions,
      String registrationSecret,
      URI redisServerUri) {
    super(tracer, clientFactory);
    Require.nonNull("Redis URI", redisServerUri);
    this.tracer = Require.nonNull("Tracer", tracer);
    this.bus = Require.nonNull("Even bus", bus);
    this.clientFactory = Require.nonNull("HTTP client factory", clientFactory);
    this.sessions = Require.nonNull("Session map", sessions);
    this.registrationSecret = registrationSecret;

    this.client = RedisClient.create(RedisURI.create(redisServerUri));
    this.connection = this.client.connect();

    bus.addListener(NODE_STATUS, event -> refresh(event.getData(NodeStatus.class)));
  }

  @Override
  public CreateSessionResponse newSession(HttpRequest request)
      throws SessionNotCreatedException {
    return null;
  }

  @Override
  public Distributor add(Node node) {
    Require.nonNull("Node to add", node);

    RedisCommands<String, String> commands = connection.sync();
    commands.mset(
        ImmutableMap.of(
            nodeIdKey(node.getId()), node.getId().toString(),
            nodeUriKey(node.getId()), node.getUri().toString()));

    bus.fire(new NodeAddedEvent(node.getId()));
    return this;
  }

  @Override
  public void remove(UUID nodeId) {
    Require.nonNull("NodeId to remove", nodeId);

    RedisCommands<String, String> commands = connection.sync();

    commands.del(nodeIdKey(nodeId), nodeUriKey(nodeId));

    bus.fire(new NodeRemovedEvent(nodeId));
  }

  @Override
  public DistributorStatus getStatus() {
    return null;
  }

  private void refresh(NodeStatus status) {

  }

  private String nodeIdKey(UUID id) {
    Require.nonNull("Node UUID", id);

    return "node:" + id.toString() + ":id";
  }

  private String nodeUriKey(UUID id) {
    Require.nonNull("Node UUID", id);

    return "node:" + id.toString() + ":uri";
  }

  @Override
  public void close() {
    client.shutdown();
  }

  @VisibleForTesting
  String getNodeUri(UUID id) {
    RedisCommands<String, String> commands = connection.sync();

    return commands.get(nodeUriKey(id));
  }
}
