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

public class SessionClosedEvent extends Event {

  private static final EventName SESSION_CLOSED = new EventName("session-closed");

  // Backward compatible constructor
  public SessionClosedEvent(SessionId id) {
    this(id, SessionClosedReason.QUIT_COMMAND);
  }

  public SessionClosedEvent(SessionId id, SessionClosedReason reason) {
    super(SESSION_CLOSED, new SessionClosedData(id, reason));
    Require.nonNull("Session ID", id);
    Require.nonNull("Reason", reason);
  }

  // Standard listener method that provides access to both SessionId and reason
  public static EventListener<SessionClosedData> listener(Consumer<SessionClosedData> handler) {
    Require.nonNull("Handler", handler);

    return new EventListener<>(SESSION_CLOSED, SessionClosedData.class, handler);
  }

  // Convenience method for listeners that only care about the SessionId
  public static EventListener<SessionClosedData> sessionListener(Consumer<SessionId> handler) {
    Require.nonNull("Handler", handler);

    return new EventListener<>(
        SESSION_CLOSED, SessionClosedData.class, data -> handler.accept(data.getSessionId()));
  }
}
