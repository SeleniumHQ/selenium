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
import java.util.function.Predicate;
import org.openqa.selenium.events.Event;
import org.openqa.selenium.events.EventListener;
import org.openqa.selenium.events.EventName;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.SessionId;

/**
 * Event for user-defined session events fired from clients through the Grid. This enables sidecar
 * services to receive custom events and take action accordingly.
 *
 * <h2>Example Usage</h2>
 *
 * <p>Sidecar service subscribing to events:
 *
 * <pre>{@code
 * // Listen for all session events
 * bus.addListener(SessionEvent.listener(data -> {
 *   System.out.println("Received event: " + data.getEventType());
 *   System.out.println("Session: " + data.getSessionId());
 *   System.out.println("Payload: " + data.getPayload());
 * }));
 *
 * // Listen for specific event types
 * bus.addListener(SessionEvent.listener("test:failed", data -> {
 *   collectLogs(data.getSessionId());
 *   takeScreenshot(data.getSessionId());
 * }));
 *
 * // Listen for events matching a pattern
 * bus.addListener(SessionEvent.listener(
 *     data -> data.getEventType().startsWith("test:"),
 *     data -> {
 *       updateTestDashboard(data);
 *     }
 * ));
 * }</pre>
 *
 * @see SessionEventData
 */
public class SessionEvent extends Event {

  private static final EventName SESSION_EVENT = new EventName("session-event");

  public SessionEvent(SessionEventData data) {
    super(SESSION_EVENT, Require.nonNull("Session event data", data));
  }

  /**
   * Creates a listener for all session events.
   *
   * @param handler the handler to process session events
   * @return an EventListener configured for session events
   */
  public static EventListener<SessionEventData> listener(Consumer<SessionEventData> handler) {
    Require.nonNull("Handler", handler);
    return new EventListener<>(SESSION_EVENT, SessionEventData.class, handler);
  }

  /**
   * Creates a listener for session events of a specific type.
   *
   * @param eventType the event type to listen for (e.g., "test:failed")
   * @param handler the handler to process matching events
   * @return an EventListener configured for the specific event type
   */
  public static EventListener<SessionEventData> listener(
      String eventType, Consumer<SessionEventData> handler) {
    Require.nonNull("Event type", eventType);
    Require.nonNull("Handler", handler);
    return new EventListener<>(
        SESSION_EVENT,
        SessionEventData.class,
        data -> {
          if (eventType.equals(data.getEventType())) {
            handler.accept(data);
          }
        });
  }

  /**
   * Creates a listener for session events matching a predicate.
   *
   * @param matcher a predicate to filter events
   * @param handler the handler to process matching events
   * @return an EventListener configured for matching events
   */
  public static EventListener<SessionEventData> listener(
      Predicate<SessionEventData> matcher, Consumer<SessionEventData> handler) {
    Require.nonNull("Matcher", matcher);
    Require.nonNull("Handler", handler);
    return new EventListener<>(
        SESSION_EVENT,
        SessionEventData.class,
        data -> {
          if (matcher.test(data)) {
            handler.accept(data);
          }
        });
  }

  /**
   * Creates a listener for events from a specific session.
   *
   * @param sessionId the session ID to listen for
   * @param handler the handler to process events from that session
   * @return an EventListener configured for the specific session
   */
  public static EventListener<SessionEventData> sessionListener(
      SessionId sessionId, Consumer<SessionEventData> handler) {
    Require.nonNull("Session ID", sessionId);
    Require.nonNull("Handler", handler);
    return new EventListener<>(
        SESSION_EVENT,
        SessionEventData.class,
        data -> {
          if (sessionId.equals(data.getSessionId())) {
            handler.accept(data);
          }
        });
  }
}
