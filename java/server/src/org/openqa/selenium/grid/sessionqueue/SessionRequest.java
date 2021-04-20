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

package org.openqa.selenium.grid.sessionqueue;

import com.google.common.collect.ImmutableMap;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.grid.data.RequestId;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.JsonInput;
import org.openqa.selenium.json.TypeToken;
import org.openqa.selenium.remote.Dialect;
import org.openqa.selenium.remote.NewSessionPayload;
import org.openqa.selenium.remote.http.Contents;
import org.openqa.selenium.remote.http.HttpRequest;

import java.lang.reflect.Type;
import java.time.Instant;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

public class SessionRequest {

  private static final Type SET_OF_CAPABILITIES = new TypeToken<Set<Capabilities>>() {}.getType();
  private static final Type SET_OF_DIALECTS = new TypeToken<Set<Dialect>>() {}.getType();
  private final RequestId requestId;
  private final Instant enqueued;
  private final Set<Capabilities> desiredCapabilities;
  private final Set<Dialect> downstreamDialects;

  public SessionRequest(RequestId requestId, HttpRequest request, Instant enqueued) {
    this.requestId = Require.nonNull("Request ID", requestId);
    this.enqueued = Require.nonNull("Enqueud time", enqueued);
    Require.nonNull("Request", request);

    try (NewSessionPayload payload = NewSessionPayload.create(Contents.reader(request))) {
      desiredCapabilities = payload.stream().collect(Collectors.toSet());
      downstreamDialects = payload.getDownstreamDialects();
    }
  }

  public SessionRequest(
    RequestId requestId,
    Instant enqueued,
    Set<Dialect> downstreamDialects,
    Set<Capabilities> desiredCapabilities) {
    this.requestId = Require.nonNull("Request ID", requestId);
    this.enqueued = Require.nonNull("Enqueud time", enqueued);
    this.downstreamDialects = Require.nonNull("Downstream dialects", downstreamDialects);
    this.desiredCapabilities = Require.nonNull("Capabilities", desiredCapabilities);
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

  public Instant getEnqueued() {
    return enqueued;
  }

  private Map<String, Object> toJson() {
    return ImmutableMap.of(
      "requestId", requestId,
      "enqueued", enqueued,
      "dialects", downstreamDialects,
      "capabilities", desiredCapabilities);
  }

  private static SessionRequest fromJson(JsonInput input) {
    RequestId id = null;
    Instant enqueued = null;
    Set<Capabilities> capabilities = null;
    Set<Dialect> dialects = null;

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

        case "requestId":
          id = input.read(RequestId.class);
          break;

        default:
          input.skipValue();
          break;
      }
    }
    input.endObject();

    return new SessionRequest(id, enqueued, dialects, capabilities);
  }
}
