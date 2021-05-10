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
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.JsonInput;
import org.openqa.selenium.json.TypeToken;
import org.openqa.selenium.remote.Dialect;
import org.openqa.selenium.remote.NewSessionPayload;
import org.openqa.selenium.remote.http.Contents;
import org.openqa.selenium.remote.http.HttpRequest;

import java.lang.reflect.Type;
import java.time.Instant;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import java.util.stream.Collectors;

import static java.util.Collections.emptyMap;
import static java.util.Collections.unmodifiableMap;
import static java.util.Collections.unmodifiableSet;
import static org.openqa.selenium.json.Json.MAP_TYPE;

public class SessionRequest {

  private static final Type SET_OF_CAPABILITIES = new TypeToken<Set<Capabilities>>() {}.getType();
  private static final Type SET_OF_DIALECTS = new TypeToken<Set<Dialect>>() {}.getType();
  private final RequestId requestId;
  private final Instant enqueued;
  private final Set<Capabilities> desiredCapabilities;
  private final Set<Dialect> downstreamDialects;
  private final Map<String, Object> metadata;

  public SessionRequest(RequestId requestId, HttpRequest request, Instant enqueued) {
    this.requestId = Require.nonNull("Request ID", requestId);
    this.enqueued = Require.nonNull("Enqueud time", enqueued);
    Require.nonNull("Request", request);

    try (NewSessionPayload payload = NewSessionPayload.create(Contents.reader(request))) {
      desiredCapabilities = payload.stream().collect(Collectors.toSet());
      downstreamDialects = payload.getDownstreamDialects();
      metadata = payload.getMetadata();
    }
  }

  public SessionRequest(
    RequestId requestId,
    Instant enqueued,
    Set<Dialect> downstreamDialects,
    Set<Capabilities> desiredCapabilities,
    Map<String, Object> metadata) {
    this.requestId = Require.nonNull("Request ID", requestId);
    this.enqueued = Require.nonNull("Enqueud time", enqueued);
    this.downstreamDialects = unmodifiableSet(
      new HashSet<>(Require.nonNull("Downstream dialects", downstreamDialects)));
    this.desiredCapabilities = unmodifiableSet(
      new LinkedHashSet<>(Require.nonNull("Capabilities", desiredCapabilities)));
    this.metadata = Collections.unmodifiableMap(new TreeMap<>(Require.nonNull("Metadata", metadata)));
  }

  public RequestId getRequestId() {
    return requestId;
  }

  public Set<Capabilities> getDesiredCapabilities() {
    return desiredCapabilities;
  }

  public Set<Dialect> getDownstreamDialects() {
    return downstreamDialects;
  }

  public Map<String, Object> getMetadata() {
    return metadata;
  }

  public Instant getEnqueued() {
    return enqueued;
  }

  private Map<String, Object> toJson() {
    Map<String, Object> toReturn = new HashMap<>();
    toReturn.put("requestId", requestId);
    toReturn.put("enqueued", enqueued);
    toReturn.put("dialects", downstreamDialects);
    toReturn.put("capabilities", desiredCapabilities);
    toReturn.put("metadata", metadata);
    return unmodifiableMap(toReturn);
  }

  private static SessionRequest fromJson(JsonInput input) {
    RequestId id = null;
    Instant enqueued = null;
    Set<Capabilities> capabilities = null;
    Set<Dialect> dialects = null;
    Map<String, Object> metadata = emptyMap();

    input.beginObject();
    while (input.hasNext()) {
      switch (input.nextName()) {
        case "capabilities":
          capabilities = input.read(SET_OF_CAPABILITIES);
          break;

        case "dialects":
          dialects = input.read(SET_OF_DIALECTS);
          break;

        case "enqueued":
          enqueued = input.read(Instant.class);
          break;

        case "metadata":
          metadata = input.read(MAP_TYPE);
          break;

        case "requestId":
          id = input.read(RequestId.class);
          break;

        default:
          input.skipValue();
          break;
      }
    }
    input.endObject();

    return new SessionRequest(id, enqueued, dialects, capabilities, metadata);
  }
}
