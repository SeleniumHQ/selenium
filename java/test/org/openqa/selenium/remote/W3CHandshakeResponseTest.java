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

package org.openqa.selenium.remote;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;

import com.google.common.collect.ImmutableMap;
import java.util.Map;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.SessionNotCreatedException;

@Tag("UnitTests")
class W3CHandshakeResponseTest {

  @Test
  void successfulResponseGetsParsedProperly() {
    Capabilities caps = new ImmutableCapabilities("cheese", "peas");
    Map<String, Map<String, Object>> payload =
        ImmutableMap.of(
            "value",
            ImmutableMap.of("capabilities", caps.asMap(), "sessionId", "cheese is opaque"));
    InitialHandshakeResponse initialResponse = new InitialHandshakeResponse(0, 200, payload);

    ProtocolHandshake.Result result =
        new W3CHandshakeResponse().getResponseFunction().apply(initialResponse);

    assertThat(result).isNotNull();
    assertThat(result.getDialect()).isEqualTo(Dialect.W3C);
    Response response = result.createResponse();

    assertThat(response.getState()).isEqualTo("success");
    assertThat((int) response.getStatus()).isZero();

    assertThat(response.getValue()).isEqualTo(caps.asMap());
  }

  @Test
  void shouldIgnoreAJsonWireProtocolReply() {
    Capabilities caps = new ImmutableCapabilities("cheese", "peas");
    Map<String, ?> payload =
        ImmutableMap.of("status", 0, "value", caps.asMap(), "sessionId", "cheese is opaque");
    InitialHandshakeResponse initialResponse = new InitialHandshakeResponse(0, 200, payload);

    ProtocolHandshake.Result result =
        new W3CHandshakeResponse().getResponseFunction().apply(initialResponse);

    assertThat(result).isNull();
  }

  @Test
  void shouldIgnoreAGeckodriver013Reply() {
    Capabilities caps = new ImmutableCapabilities("cheese", "peas");
    Map<String, ?> payload =
        ImmutableMap.of("value", caps.asMap(), "sessionId", "cheese is opaque");
    InitialHandshakeResponse initialResponse = new InitialHandshakeResponse(0, 200, payload);

    ProtocolHandshake.Result result =
        new W3CHandshakeResponse().getResponseFunction().apply(initialResponse);

    assertThat(result).isNull();
  }

  @Test
  void shouldProperlyPopulateAnError() {
    Map<String, ?> payload =
        ImmutableMap.of(
            "value",
            ImmutableMap.of(
                "error", "session not created",
                "message", "me no likey",
                "stacktrace", "I have no idea what went wrong"));

    InitialHandshakeResponse initialResponse = new InitialHandshakeResponse(0, 500, payload);

    assertThatExceptionOfType(SessionNotCreatedException.class)
        .isThrownBy(() -> new W3CHandshakeResponse().getResponseFunction().apply(initialResponse))
        .withMessageContaining("me no likey")
        .satisfies(
            e ->
                assertThat(e.getAdditionalInformation())
                    .contains("I have no idea what went wrong"));
  }
}
