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

import static org.assertj.core.api.Assertions.assertThat;
import static org.openqa.selenium.testing.Safely.safelyCall;

import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.events.EventBus;
import org.openqa.selenium.events.local.GuavaEventBus;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.node.Node;
import org.openqa.selenium.grid.node.local.LocalNode;
import org.openqa.selenium.grid.sessionmap.local.LocalSessionMap;
import org.openqa.selenium.grid.testing.TestSessionFactory;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.tracing.DefaultTestTracer;
import org.openqa.selenium.remote.tracing.Tracer;

import redis.embedded.RedisCluster;
import redis.embedded.RedisServer;

import java.io.UncheckedIOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

public class RedisDistributorTest {

  private static URI redisUri;
  private static RedisServer server;
  private Tracer tracer;
  private EventBus bus;
  private HttpClient.Factory clientFactory;
  private URI uri;
  private Node local;

  @BeforeClass
  public static void startRedisServer() throws URISyntaxException {
    redisUri = new URI("redis://localhost:" + PortProber.findFreePort());
    server = RedisServer.builder().port(redisUri.getPort()).build();
    server.start();
  }

  @Before
  public void setUp() throws URISyntaxException {
    tracer = DefaultTestTracer.createTracer();
    bus = new GuavaEventBus();
    clientFactory = HttpClient.Factory.createDefault();

    Capabilities caps = new ImmutableCapabilities("browserName", "cheese");
    uri = new URI("http://localhost:1234");
    local = LocalNode.builder(tracer, bus, uri, uri, null)
        .add(caps, new TestSessionFactory((id, c) -> new Handler(c)))
        .maximumConcurrentSessions(2)
        .build();
  }

  @AfterClass
  public static void tearDownRedisServer() {
    safelyCall(() -> server.stop());
  }

  @Test
  public void testAddNodeToRedisDistributor() {
    RedisDistributor redisDistributor = new RedisDistributor(tracer, bus, clientFactory, new LocalSessionMap(tracer, bus), null, redisUri);
    redisDistributor.add(local);

    UUID addedNodeUri = redisDistributor.getNodeUri(local.getId());
    assertThat(addedNodeUri).isEqualTo(local.getId());
  }

  @Test
  public void testRemoveNodeFromRedisDistributor(){
    RedisDistributor redisDistributor = new RedisDistributor(tracer, bus, clientFactory, new LocalSessionMap(tracer, bus), null, redisUri);
    redisDistributor.add(local);

    redisDistributor.remove(local.getId());

    UUID removedNodeUri = redisDistributor.getNodeUri(local.getId());
    assertThat(removedNodeUri).isEqualTo(null);
  }
  private class Handler extends Session implements HttpHandler {
    private Handler(Capabilities capabilities) {
      super(new SessionId(UUID.randomUUID()), uri, capabilities);
    }

    @Override
    public HttpResponse execute(HttpRequest req) throws UncheckedIOException {
      return new HttpResponse();
    }
  }
}
