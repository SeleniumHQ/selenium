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

import static java.util.Collections.emptyMap;
import static java.util.Collections.unmodifiableMap;
import static java.util.Collections.unmodifiableSet;
import static org.openqa.selenium.json.Json.MAP_TYPE;

import java.lang.reflect.Type;
import java.time.Instant;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.StringJoiner;
import java.util.TreeMap;
import java.util.stream.Collectors;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.JsonInput;
import org.openqa.selenium.json.TypeToken;
import org.openqa.selenium.remote.Dialect;
import org.openqa.selenium.remote.NewSessionPayload;
import org.openqa.selenium.remote.http.Contents;
import org.openqa.selenium.remote.http.HttpRequest;

public class SessionRequest {

  private static final Type SET_OF_CAPABILITIES = new TypeToken<Set<Capabilities>>() {}.getType();
  private static final Type SET_OF_DIALECTS = new TypeToken<Set<Dialect>>() {}.getType();
  private static final Type TRACE_HEADERS = new TypeToken<Map<String, String>>() {}.getType();
  private final RequestId requestId;
  private final Instant enqueued;
  private final Set<Capabilities> desiredCapabilities;
  private final Set<Dialect> downstreamDialects;
  private final Map<String, Object> metadata;
  private final Map<String, String> traceHeaders;

  public SessionRequest(RequestId requestId, HttpRequest request, Instant enqueued) {
    this.requestId = Require.nonNull("Request ID", requestId);
    this.enqueued = Require.nonNull("Enqueued time", enqueued);
    Require.nonNull("Request", request);

    try (NewSessionPayload payload = NewSessionPayload.create(Contents.reader(request))) {
      desiredCapabilities =
          payload.stream()
              .filter(capabilities -> !capabilities.asMap().isEmpty())
              .collect(Collectors.toSet());
      downstreamDialects = payload.getDownstreamDialects();
      metadata = payload.getMetadata();
    }

    Map<String, String> headers = new HashMap<>();
    Optional<String> traceParentValue = Optional.ofNullable(request.getHeader("traceparent"));
    traceParentValue.ifPresent(value -> headers.put("traceparent", value));
    this.traceHeaders = Collections.unmodifiableMap(headers);
  }

  public SessionRequest(
      RequestId requestId,
      Instant enqueued,
      Set<Dialect> downstreamDialects,
      Set<Capabilities> desiredCapabilities,
      Map<String, Object> metadata,
      Map<String, String> traceHeaders) {
    this.requestId = Require.nonNull("Request ID", requestId);
    this.enqueued = Require.nonNull("Enqueued time", enqueued);
    this.downstreamDialects =
        unmodifiableSet(new HashSet<>(Require.nonNull("Downstream dialects", downstreamDialects)));
    this.desiredCapabilities =
        unmodifiableSet(new LinkedHashSet<>(Require.nonNull("Capabilities", desiredCapabilities)));
    this.metadata =
        Collections.unmodifiableMap(new TreeMap<>(Require.nonNull("Metadata", metadata)));
    this.traceHeaders =
        unmodifiableMap(new HashMap<>(Require.nonNull("Trace HTTP headers", traceHeaders)));
  }

  public RequestId getRequestId() {
    return requestId;
  }

  public Map<String, String> getTraceHeaders() {
    return traceHeaders;
  }

  public String getTraceHeader(String key) {
    return traceHeaders.get(key);
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

  @Override
  public String toString() {
    return new StringJoiner(", ", SessionRequest.class.getSimpleName() + "[", "]")
        .add("requestId=" + requestId)
        .add("desiredCapabilities=" + desiredCapabilities)
        .add("downstreamDialects=" + downstreamDialects)
        .add("metadata=" + metadata)
        .add("traceHeaders=" + traceHeaders)
        .toString();
  }

  @Override
  public boolean equals(Object o) {
    if (!(o instanceof SessionRequest)) {
      return false;
    }
    SessionRequest that = (SessionRequest) o;

    return this.requestId.equals(that.requestId)
        && this.desiredCapabilities.equals(that.desiredCapabilities)
        && this.downstreamDialects.equals(that.downstreamDialects)
        && this.metadata.equals(that.metadata)
        && this.traceHeaders.equals(that.traceHeaders);
  }

  @Override
  public int hashCode() {
    return Objects.hash(
        requestId, enqueued, desiredCapabilities, downstreamDialects, metadata, traceHeaders);
  }

  private Map<String, Object> toJson() {
    Map<String, Object> toReturn = new HashMap<>();
    toReturn.put("requestId", requestId);
    toReturn.put("enqueued", enqueued);
    toReturn.put("dialects", downstreamDialects);
    toReturn.put("capabilities", desiredCapabilities);
    toReturn.put("metadata", metadata);
    toReturn.put("traceHeaders", traceHeaders);
    return unmodifiableMap(toReturn);
  }

  private static SessionRequest fromJson(JsonInput input) {
    RequestId id = null;
    Instant enqueued = null;
    Set<Capabilities> capabilities = null;
    Set<Dialect> dialects = null;
    Map<String, Object> metadata = emptyMap();
    Map<String, String> tracerHeaders = emptyMap();

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

        case "traceHeaders":
          tracerHeaders = input.read(TRACE_HEADERS);
          break;

        default:
          input.skipValue();
          break;
      }
    }
    input.endObject();

    return new SessionRequest(id, enqueued, dialects, capabilities, metadata, tracerHeaders);
  }
}
