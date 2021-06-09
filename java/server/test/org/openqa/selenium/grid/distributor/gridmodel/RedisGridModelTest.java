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

package org.openqa.selenium.grid.distributor.gridmodel;

import org.junit.After;
import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.events.local.GuavaEventBus;
import org.openqa.selenium.grid.data.DefaultSlotMatcher;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.distributor.Distributor;
import org.openqa.selenium.grid.distributor.GridModel;
import org.openqa.selenium.grid.distributor.gridmodel.redis.RedisGridModel;
import org.openqa.selenium.grid.distributor.local.LocalDistributor;
import org.openqa.selenium.grid.distributor.selector.DefaultSlotSelector;
import org.openqa.selenium.grid.node.Node;
import org.openqa.selenium.grid.node.local.LocalNode;
import org.openqa.selenium.grid.security.Secret;
import org.openqa.selenium.grid.sessionmap.SessionMap;
import org.openqa.selenium.grid.sessionmap.local.LocalSessionMap;
import org.openqa.selenium.grid.sessionqueue.local.LocalNewSessionQueue;
import org.openqa.selenium.grid.testing.TestSessionFactory;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.tracing.DefaultTestTracer;
import org.openqa.selenium.remote.tracing.Tracer;
import redis.embedded.RedisServer;

import java.net.URI;
import java.net.URISyntaxException;
import java.time.Duration;
import java.time.Instant;

import static org.junit.Assert.assertEquals;
import static org.openqa.selenium.testing.Safely.safelyCall;

public class RedisGridModelTest {

  private static RedisServer server;
  private final Secret secret = new Secret("cheese");

  private LocalNewSessionQueue queue;
  private  Distributor distributor;
  private Node chromeNode;
  private Node edgeNode;
  private GridModel gridModel;

  private static URI uri;

  @BeforeClass
  public static void startRedisServer() throws URISyntaxException {
    uri = new URI("redis://localhost:" + PortProber.findFreePort());
    server = RedisServer.builder().port(uri.getPort()).build();
    server.start();
  }

  @Before
  public void setUp() throws URISyntaxException {
    ImmutableCapabilities chromeCaps = new ImmutableCapabilities("browserName", "chrome");
    ImmutableCapabilities edgeCaps = new ImmutableCapabilities("browserName", "edge");

    HttpClient.Factory clientFactory = HttpClient.Factory.createDefault();
    Tracer tracer = DefaultTestTracer.createTracer();
    GuavaEventBus events = new GuavaEventBus();

    SessionMap sessions = new LocalSessionMap(tracer, events);

    queue = new LocalNewSessionQueue(
      tracer,
      events,
      new DefaultSlotMatcher(),
      Duration.ofSeconds(2),
      Duration.ofSeconds(2),
      secret);

    gridModel = new RedisGridModel(events, uri);
    distributor = new LocalDistributor(
      tracer,
      events,
      clientFactory,
      sessions,
      queue,
      gridModel,
      new DefaultSlotSelector(),
      secret,
      Duration.ofMinutes(5),
      false);


    URI nodeUri = new URI("http://example:5678");

    chromeNode = LocalNode.builder(tracer, events, nodeUri, nodeUri, secret)
      .add(chromeCaps, new TestSessionFactory((id, c) -> new Session(
        id,
        nodeUri,
        new ImmutableCapabilities(),
        chromeCaps,
        Instant.now())))
      .maximumConcurrentSessions(2)
      .build();

    edgeNode = LocalNode.builder(tracer, events, nodeUri, nodeUri, secret)
      .add(edgeCaps, new TestSessionFactory((id, c) -> new Session(
        id,
        nodeUri,
        new ImmutableCapabilities(),
        edgeCaps,
        Instant.now())))
      .maximumConcurrentSessions(2)
      .build();
  }

  @After
  public void cleanUp() {

  }
  @AfterClass
  public static void tearDownRedisServer() {
    safelyCall(() -> server.stop());
  }

  @Test
  public void shouldBeAbleAddTheNodeWhenRegistrationEventIsFired() {
  }


}
