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

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.JsonInput;
import org.openqa.selenium.remote.SessionId;

import java.io.Serializable;
import java.net.URI;
import java.time.Instant;
import java.util.Map;
import java.util.Objects;
import java.util.TreeMap;

import static java.util.Collections.unmodifiableMap;

/**
 * Represents a running instance of a WebDriver session. It is identified by a {@link SessionId}.
 * The serialized form is designed to mimic that of the return value of the New Session command, but
 * an additional {@code uri} field must also be present.
 */
public class Session implements Serializable {

  private final SessionId id;
  private final URI uri;
  private final Capabilities stereotype;
  private final Capabilities capabilities;
  private final Instant startTime;

  public Session(SessionId id, URI uri, Capabilities stereotype, Capabilities capabilities, Instant startTime) {
    this.id = Require.nonNull("Session ID", id);
    this.uri = Require.nonNull("Where the session is running", uri);
    this.startTime = Require.nonNull("Start time", startTime);

    this.stereotype = ImmutableCapabilities.copyOf(Require.nonNull("Stereotype", stereotype));
    this.capabilities = ImmutableCapabilities.copyOf(
        Require.nonNull("Session capabilities", capabilities));
  }

  public SessionId getId() {
    return id;
  }

  public URI getUri() {
    return uri;
  }

  public Capabilities getStereotype() {
    return stereotype;
  }

  public Capabilities getCapabilities() {
    return capabilities;
  }

  public Instant getStartTime() {
    return startTime;
  }

  private Map<String, Object> toJson() {
    // Deliberately shaped like the return value for the W3C New Session command's return value.
    Map<String, Object> toReturn = new TreeMap<>();
    toReturn.put("capabilities", getCapabilities());
    toReturn.put("sessionId", getId().toString());
    toReturn.put("stereotype", getStereotype());
    toReturn.put("start", getStartTime());
    toReturn.put("uri", getUri());
    return unmodifiableMap(toReturn);
  }

  private static Session fromJson(JsonInput input) {
    SessionId id = null;
    URI uri = null;
    Capabilities caps = null;
    Capabilities stereotype = null;
    Instant start = null;

    input.beginObject();
    while (input.hasNext()) {
      switch (input.nextName()) {
        case "capabilities":
          caps = ImmutableCapabilities.copyOf(input.read(Capabilities.class));
          break;

        case "sessionId":
          id = input.read(SessionId.class);
          break;

        case "start":
          start = input.read(Instant.class);
          break;

        case "stereotype":
          stereotype = input.read(Capabilities.class);
          break;

        case "uri":
          uri = input.read(URI.class);
          break;

        default:
          input.skipValue();
          break;
      }
    }
    input.endObject();

    return new Session(id, uri, stereotype, caps, start);
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
