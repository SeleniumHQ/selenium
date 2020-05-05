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

package org.openqa.selenium.grid.node.local;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.openqa.selenium.remote.Dialect.W3C;

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;

import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.NoSuchSessionException;
import org.openqa.selenium.events.EventBus;
import org.openqa.selenium.events.local.GuavaEventBus;
import org.openqa.selenium.grid.data.CreateSessionRequest;
import org.openqa.selenium.grid.data.CreateSessionResponse;
import org.openqa.selenium.grid.data.NodeStatus;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.testing.TestSessionFactory;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.HttpClient;

import io.opentelemetry.OpenTelemetry;
import io.opentelemetry.trace.Tracer;

import java.net.URI;
import java.net.URISyntaxException;

public class LocalNodeTest {

  private LocalNode node;
  private Session session;

  @Before
  public void setUp() throws URISyntaxException {
    Tracer tracer = OpenTelemetry.getTracerProvider().get("default");
    EventBus bus = new GuavaEventBus();
    HttpClient.Factory clientFactory = HttpClient.Factory.createDefault();
    URI uri = new URI("http://localhost:1234");
    Capabilities stereotype = new ImmutableCapabilities("cheese", "brie");
    node = LocalNode.builder(tracer, bus, clientFactory, uri, null)
        .add(stereotype, new TestSessionFactory((id, caps) -> new Session(id, uri, caps)))
        .build();

    CreateSessionResponse sessionResponse = node.newSession(
        new CreateSessionRequest(
            ImmutableSet.of(W3C),
            stereotype,
            ImmutableMap.of()))
        .orElseThrow(() -> new AssertionError("Unable to create session"));
    session = sessionResponse.getSession();
  }

  @Test
  public void shouldThrowIfSessionIsNotPresent() {
    assertThatExceptionOfType(NoSuchSessionException.class)
        .isThrownBy(() -> node.getSession(new SessionId("12345")));
  }

  @Test
  public void canRetrieveActiveSessionById() {
    assertThat(node.getSession(session.getId())).isEqualTo(session);
  }

  @Test
  public void isOwnerOfAnActiveSession() {
    assertThat(node.isSessionOwner(session.getId())).isTrue();
  }

  @Test
  public void canStopASession() {
    node.stop(session.getId());
    assertThatExceptionOfType(NoSuchSessionException.class)
        .isThrownBy(() -> node.getSession(session.getId()));
  }

  @Test
  public void isNotOwnerOfAStoppedSession() {
    node.stop(session.getId());
    assertThat(node.isSessionOwner(session.getId())).isFalse();
  }

  @Test
  public void canReturnStatusInfo() {
    NodeStatus status = node.getStatus();
    assertThat(status.getCurrentSessions().stream()
        .filter(s -> s.getSessionId().equals(session.getId()))).isNotEmpty();

    node.stop(session.getId());
    status = node.getStatus();
    assertThat(status.getCurrentSessions().stream()
        .filter(s -> s.getSessionId().equals(session.getId()))).isEmpty();
  }

  @Test
  public void nodeStatusInfoIsImmutable() {
    NodeStatus status = node.getStatus();
    assertThat(status.getCurrentSessions().stream()
        .filter(s -> s.getSessionId().equals(session.getId()))).isNotEmpty();

    node.stop(session.getId());
    assertThat(status.getCurrentSessions().stream()
        .filter(s -> s.getSessionId().equals(session.getId()))).isNotEmpty();
  }
}
