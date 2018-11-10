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

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;

import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.MutableCapabilities;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.distributor.local.LocalDistributor;
import org.openqa.selenium.grid.distributor.remote.RemoteDistributor;
import org.openqa.selenium.grid.node.local.LocalNode;
import org.openqa.selenium.grid.sessionmap.local.LocalSessionMap;
import org.openqa.selenium.grid.web.PassthroughHttpClient;
import org.openqa.selenium.remote.NewSessionPayload;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.tracing.DistributedTracer;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.UUID;

public class DistributorTest {

  private DistributedTracer tracer;
  private Distributor local;
  private Distributor distributor;
  private ImmutableCapabilities caps;

  @Before
  public void setUp() {
    tracer = DistributedTracer.builder().build();
    local = new LocalDistributor();
    distributor = new RemoteDistributor(new PassthroughHttpClient<>(local));

    caps = new ImmutableCapabilities("browserName", "cheese");
  }

  @Test
  public void creatingANewSessionWithoutANodeEndsInFailure() {
    try (NewSessionPayload payload = NewSessionPayload.create(caps)) {
      assertThatExceptionOfType(SessionNotCreatedException.class)
          .isThrownBy(() -> distributor.newSession(payload));
    }
  }

  @Test
  public void shouldBeAbleToAddANodeAndCreateASession() throws URISyntaxException {
    URI nodeUri = new URI("http://example:5678");
    URI routableUri = new URI("http://localhost:1234");

    LocalSessionMap sessions = new LocalSessionMap();
    LocalNode node = LocalNode.builder(tracer, routableUri, sessions)
        .add(caps, c -> new Session(new SessionId(UUID.randomUUID()), nodeUri, c))
        .build();

    Distributor distributor = new LocalDistributor();
    distributor.add(node);

    MutableCapabilities sessionCaps = new MutableCapabilities(caps);
    sessionCaps.setCapability("sausages", "gravy");
    try (NewSessionPayload payload = NewSessionPayload.create(sessionCaps)) {
      Session session = distributor.newSession(payload);

      assertThat(session.getCapabilities()).isEqualTo(sessionCaps);
      assertThat(session.getUri()).isEqualTo(routableUri);
    }
  }

  @Test
  public void shouldBeAbleToRemoveANode() throws URISyntaxException {
    URI nodeUri = new URI("http://example:5678");
    URI routableUri = new URI("http://localhost:1234");

    LocalSessionMap sessions = new LocalSessionMap();
    LocalNode node = LocalNode.builder(tracer, routableUri, sessions)
        .add(caps, c -> new Session(new SessionId(UUID.randomUUID()), nodeUri, c))
        .build();

    Distributor local = new LocalDistributor();
    distributor = new RemoteDistributor(new PassthroughHttpClient<>(local));
    distributor.add(node);
    distributor.remove(node.getId());

    try (NewSessionPayload payload = NewSessionPayload.create(caps)) {
      assertThatExceptionOfType(SessionNotCreatedException.class)
          .isThrownBy(() -> distributor.newSession(payload));
    }
  }

  @Test
  public void registeringTheSameNodeMultipleTimesOnlyCountsTheFirstTime()
      throws URISyntaxException {
    URI nodeUri = new URI("http://example:5678");
    URI routableUri = new URI("http://localhost:1234");

    LocalSessionMap sessions = new LocalSessionMap();
    LocalNode node = LocalNode.builder(tracer, routableUri, sessions)
        .add(caps, c -> new Session(new SessionId(UUID.randomUUID()), nodeUri, c))
        .build();

    local.add(node);
    local.add(node);

    DistributorStatus status = local.getStatus();

    assertThat(status.getNodes().size()).isEqualTo(1);
  }

  @Test
  public void theMostLightlyLoadedNodeIsSelectedFirst() {

  }

}
