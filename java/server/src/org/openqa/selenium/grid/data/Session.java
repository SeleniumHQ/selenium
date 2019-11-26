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

import com.google.common.collect.ImmutableMap;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.remote.SessionId;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.Map;
import java.util.Objects;

/**
 * Represents a running instance of a WebDriver session. It is identified by a {@link SessionId}.
 * The serialized form is designed to mimic that of the return value of the New Session command, but
 * an additional {@code uri} field must also be present.
 */
public class Session {

  private final SessionId id;
  private final URI uri;
  private final Capabilities capabilities;

  public Session(SessionId id, URI uri, Capabilities capabilities) {
    this.id = Objects.requireNonNull(id, "Session ID must be set.");
    this.uri = Objects.requireNonNull(uri, "Where the session is running must be set.");

    Objects.requireNonNull(capabilities, "Session capabilities must be set");
    this.capabilities = ImmutableCapabilities.copyOf(capabilities);
  }

  public SessionId getId() {
    return id;
  }

  public URI getUri() {
    return uri;
  }

  public Capabilities getCapabilities() {
    return capabilities;
  }

  private Map<String, Object> toJson() {
    // Deliberately shaped like the return value for the W3C New Session command's return value.
    return ImmutableMap.of(
        "sessionId", getId().toString(),
        "capabilities", getCapabilities(),
        "uri", getUri());
  }

  private static Session fromJson(Map<String, Object> raw) throws URISyntaxException {
    SessionId id = new SessionId((String) raw.get("sessionId"));
    URI uri = new URI((String) raw.get("uri"));
    Capabilities caps = new ImmutableCapabilities((Map<?, ?>) raw.get("capabilities"));

    return new Session(id, uri, caps);
  }

  @Override
  public boolean equals(Object that) {
    if (!(that instanceof Session)) {
      return false;
    }

    Session session = (Session) that;
    return Objects.equals(id, session.getId()) &&
           Objects.equals(uri, session.getUri());
  }

  @Override
  public int hashCode() {
    return Objects.hash(id, uri);
  }
}
