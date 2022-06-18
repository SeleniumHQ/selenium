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

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.events.local.GuavaEventBus;
import org.openqa.selenium.grid.data.CreateSessionRequest;
import org.openqa.selenium.grid.data.CreateSessionResponse;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.node.Node;
import org.openqa.selenium.grid.security.Secret;
import org.openqa.selenium.grid.testing.TestSessionFactory;
import org.openqa.selenium.internal.Either;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.ErrorCodes;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.tracing.DefaultTestTracer;

import java.net.URI;
import java.net.URISyntaxException;
import java.time.Instant;
import java.util.Map;

import static java.nio.charset.StandardCharsets.UTF_8;
import static org.assertj.core.api.Assertions.assertThat;
import static org.openqa.selenium.json.Json.MAP_TYPE;
import static org.openqa.selenium.remote.Dialect.OSS;
import static org.openqa.selenium.remote.Dialect.W3C;
import static org.openqa.selenium.remote.http.Contents.utf8String;
import static org.openqa.selenium.remote.http.HttpMethod.POST;

public class CreateSessionTest {

  private final Json json = new Json();
  private final Capabilities stereotype = new ImmutableCapabilities("cheese", "brie");
  private final Secret registrationSecret = new Secret("tunworth");

  @Test
  public void shouldAcceptAW3CPayload() throws URISyntaxException {
    String payload = json.toJson(ImmutableMap.of(
        "capabilities", ImmutableMap.of(
            "alwaysMatch", ImmutableMap.of("cheese", "brie"))));

    HttpRequest request = new HttpRequest(POST, "/session");
    request.setContent(utf8String(payload));

    URI uri = new URI("http://example.com");

    Node node = LocalNode.builder(
      DefaultTestTracer.createTracer(),
        new GuavaEventBus(),
        uri,
        uri,
        registrationSecret)
        .add(stereotype, new TestSessionFactory((id, caps) -> new Session(id, uri, new ImmutableCapabilities(), caps, Instant.now())))
        .build();

    Either<WebDriverException, CreateSessionResponse> response = node.newSession(
      new CreateSessionRequest(
        ImmutableSet.of(W3C),
        stereotype,
        ImmutableMap.of()));

    if (response.isRight()) {
      CreateSessionResponse sessionResponse = response.right();
      Map<String, Object> all = json.toType(
        new String(sessionResponse.getDownstreamEncodedResponse(), UTF_8),
        MAP_TYPE);

      // Ensure that there's no status field (as this is used by the protocol handshake to determine
      // whether the session is using the JWP or the W3C dialect.
      assertThat(all.containsKey("status")).isFalse();

      // Now check the fields required by the spec
      Map<?, ?> value = (Map<?, ?>) all.get("value");
      assertThat(value.get("sessionId")).isInstanceOf(String.class);
      assertThat(value.get("capabilities")).isInstanceOf(Map.class);
    } else {
      throw new AssertionError("Unable to create session" + response.left().getMessage());
    }
  }

  @Test
  public void shouldOnlyAcceptAJWPPayloadIfConfiguredTo() {
    // TODO: implement shouldOnlyAcceptAJWPPayloadIfConfiguredTo test
  }

  @Test
  public void ifOnlyW3CPayloadSentAndRemoteEndIsJWPOnlyFailSessionCreationIfJWPNotConfigured() {
    // TODO: implement ifOnlyW3CPayloadSentAndRemoteEndIsJWPOnlyFailSessionCreationIfJWPNotConfigured test
  }

  @Test
  public void ifOnlyJWPPayloadSentResponseShouldBeJWPOnlyIfJWPConfigured()
      throws URISyntaxException {
    String payload = json.toJson(ImmutableMap.of(
        "desiredCapabilities", ImmutableMap.of("cheese", "brie")));

    HttpRequest request = new HttpRequest(POST, "/session");
    request.setContent(utf8String(payload));

    URI uri = new URI("http://example.com");

    Node node = LocalNode.builder(
      DefaultTestTracer.createTracer(),
        new GuavaEventBus(),
        uri,
        uri,
        registrationSecret)
        .add(stereotype, new TestSessionFactory((id, caps) -> new Session(id, uri, new ImmutableCapabilities(), caps, Instant.now())))
        .build();

    Either<WebDriverException, CreateSessionResponse> response = node.newSession(
      new CreateSessionRequest(
        ImmutableSet.of(OSS),
        stereotype,
        ImmutableMap.of()));

    if (response.isRight()) {
      CreateSessionResponse sessionResponse = response.right();
      Map<String, Object> all = json.toType(
        new String(sessionResponse.getDownstreamEncodedResponse(), UTF_8),
        MAP_TYPE);

      // The status field is used by local ends to determine whether or not the session is a JWP one.
      assertThat(all.get("status")).matches(obj -> ((Number) obj).intValue() == ErrorCodes.SUCCESS);

      // The session id is a top level field
      assertThat(all.get("sessionId")).isInstanceOf(String.class);

      // And the value should contain the capabilities.
      assertThat(all.get("value")).isInstanceOf(Map.class);
    } else {
      throw new AssertionError("Unable to create session" + response.left().getMessage());
    }
  }

  @Test
  public void shouldPreferUsingTheW3CProtocol() throws URISyntaxException {
    String payload = json.toJson(ImmutableMap.of(
      "desiredCapabilities", ImmutableMap.of(
        "cheese", "brie"),
      "capabilities", ImmutableMap.of(
        "alwaysMatch", ImmutableMap.of("cheese", "brie"))));

    HttpRequest request = new HttpRequest(POST, "/session");
    request.setContent(utf8String(payload));

    URI uri = new URI("http://example.com");

    Node node = LocalNode.builder(
      DefaultTestTracer.createTracer(),
      new GuavaEventBus(),
      uri,
      uri,
      registrationSecret)
      .add(stereotype, new TestSessionFactory((id, caps) -> new Session(id, uri, new ImmutableCapabilities(), caps, Instant.now())))
      .build();

    Either<WebDriverException, CreateSessionResponse> response = node.newSession(
      new CreateSessionRequest(
        ImmutableSet.of(W3C),
        stereotype,
        ImmutableMap.of()));

    if (response.isRight()) {
      CreateSessionResponse sessionResponse = response.right();
      Map<String, Object> all = json.toType(
        new String(sessionResponse.getDownstreamEncodedResponse(), UTF_8),
        MAP_TYPE);

      // Ensure that there's no status field (as this is used by the protocol handshake to determine
      // whether the session is using the JWP or the W3C dialect.
      assertThat(all.containsKey("status")).isFalse();

      // Now check the fields required by the spec
      Map<?, ?> value = (Map<?, ?>) all.get("value");
      assertThat(value.get("sessionId")).isInstanceOf(String.class);
      assertThat(value.get("capabilities")).isInstanceOf(Map.class);
    } else {
      throw new AssertionError("Unable to create session" + response.left().getMessage());
    }
  }

  @Test
  public void sessionDataShouldBeCorrectRegardlessOfPayloadProtocol() {
    // TODO: implement sessionDataShouldBeCorrectRegardlessOfPayloadProtocol test
  }

  @Test
  public void shouldSupportProtocolConversion() {
    // TODO: implement shouldSupportProtocolConversion test
  }
}
