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

package org.openqa.selenium.grid.node;

import java.io.UncheckedIOException;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

/**
 * Handler for firing user-defined session events. This allows clients to send custom events through
 * the Grid that sidecar services can consume.
 *
 * <p>Endpoint: POST /session/{sessionId}/se/event
 *
 * <p>Request body:
 *
 * <pre>{@code
 * {
 *   "eventType": "test:failed",
 *   "payload": {
 *     "testName": "LoginTest",
 *     "error": "Element not found"
 *   }
 * }
 * }</pre>
 *
 * <p>Response:
 *
 * <pre>{@code
 * {
 *   "value": {
 *     "success": true,
 *     "eventType": "test:failed",
 *     "timestamp": "2024-01-15T10:30:00Z"
 *   }
 * }
 * }</pre>
 */
class FireSessionEvent implements HttpHandler {

  private final Node node;
  private final SessionId sessionId;

  FireSessionEvent(Node node, SessionId sessionId) {
    this.node = Require.nonNull("Node", node);
    this.sessionId = Require.nonNull("Session id", sessionId);
  }

  @Override
  public HttpResponse execute(HttpRequest req) throws UncheckedIOException {
    return node.fireSessionEvent(req, sessionId);
  }
}
