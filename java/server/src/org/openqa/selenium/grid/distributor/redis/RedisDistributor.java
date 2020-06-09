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

import org.openqa.selenium.Beta;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.concurrent.Regularly;
import org.openqa.selenium.events.EventBus;
import org.openqa.selenium.grid.data.CreateSessionResponse;
import org.openqa.selenium.grid.data.DistributorStatus;
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

import java.net.URI;
import java.util.Collection;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.logging.Logger;

public class RedisDistributor extends Distributor {
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
    return this;
  }

  @Override
  public void remove(UUID nodeId) {

  }

  @Override
  public DistributorStatus getStatus() {
    return null;
  }

  @Beta
  public void refresh() {

  }

  private void refresh(NodeStatus status) {

  }
}
