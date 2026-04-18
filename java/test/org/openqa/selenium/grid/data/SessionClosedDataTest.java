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

package org.openqa.selenium.grid.data;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.UUID;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.events.Event;
import org.openqa.selenium.events.EventName;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.SessionId;

class SessionClosedDataTest {

  private static final Json JSON = new Json();

  @Test
  void shouldReadLegacySessionIdPayloadAsQuitCommand() {
    SessionId sessionId = new SessionId("a3aedb1b7bc8894ebf0606214ee47283");

    SessionClosedData data = JSON.toType(JSON.toJson(sessionId), SessionClosedData.class);

    assertThat(data.getSessionId()).isEqualTo(sessionId);
    assertThat(data.getReason()).isEqualTo(SessionClosedReason.QUIT_COMMAND);
    assertThat(data.getNodeId()).isNull();
    assertThat(data.getNodeUri()).isNull();
    assertThat(data.getCapabilities()).isNull();
    assertThat(data.getStartTime()).isNull();
    assertThat(data.getEndTime()).isNotNull();
  }

  @Test
  void sessionClosedEventListenersShouldHandleLegacySessionIdPayload() {
    SessionId sessionId = new SessionId("a3aedb1b7bc8894ebf0606214ee47283");
    Event legacyEvent = new Event(UUID.randomUUID(), new EventName("session-closed"), sessionId);
    AtomicReference<SessionClosedData> seenData = new AtomicReference<>();
    AtomicReference<SessionId> seenSessionId = new AtomicReference<>();

    SessionClosedEvent.listener(seenData::set).accept(legacyEvent);
    SessionClosedEvent.sessionListener(seenSessionId::set).accept(legacyEvent);

    assertThat(seenData.get()).isNotNull();
    assertThat(seenData.get().getSessionId()).isEqualTo(sessionId);
    assertThat(seenData.get().getReason()).isEqualTo(SessionClosedReason.QUIT_COMMAND);
    assertThat(seenSessionId.get()).isEqualTo(sessionId);
  }
}
