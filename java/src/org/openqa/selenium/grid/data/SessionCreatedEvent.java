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

import java.util.function.Consumer;
import org.openqa.selenium.events.Event;
import org.openqa.selenium.events.EventListener;
import org.openqa.selenium.events.EventName;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.SessionId;

/**
 * Event fired when a new session is successfully created on a node. This event provides rich
 * context about the session for sidecar services to consume, enabling functionality such as video
 * recording, logging, or other session lifecycle management.
 */
public class SessionCreatedEvent extends Event {

  private static final EventName SESSION_CREATED = new EventName("session-created");

  public SessionCreatedEvent(SessionCreatedData data) {
    super(SESSION_CREATED, Require.nonNull("Session created data", data));
  }

  /**
   * Creates an event listener that receives full session creation data.
   *
   * @param handler the handler to process session creation events
   * @return an EventListener configured for session created events
   */
  public static EventListener<SessionCreatedData> listener(Consumer<SessionCreatedData> handler) {
    Require.nonNull("Handler", handler);
    return new EventListener<>(SESSION_CREATED, SessionCreatedData.class, handler);
  }

  /**
   * Convenience method for listeners that only need the SessionId.
   *
   * @param handler the handler to process just the session ID
   * @return an EventListener configured for session created events
   */
  public static EventListener<SessionCreatedData> sessionIdListener(Consumer<SessionId> handler) {
    Require.nonNull("Handler", handler);
    return new EventListener<>(
        SESSION_CREATED, SessionCreatedData.class, data -> handler.accept(data.getSessionId()));
  }
}
