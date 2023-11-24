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

import static java.util.Collections.unmodifiableMap;
import static java.util.Collections.unmodifiableSet;

import java.lang.reflect.Type;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.StringJoiner;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.JsonInput;
import org.openqa.selenium.json.TypeToken;

public class SessionRequestCapability {

  private static final Type SET_OF_CAPABILITIES = new TypeToken<Set<Capabilities>>() {}.getType();
  private final RequestId requestId;
  private final Set<Capabilities> desiredCapabilities;

  public SessionRequestCapability(RequestId requestId, Set<Capabilities> desiredCapabilities) {
    this.requestId = Require.nonNull("Request ID", requestId);
    this.desiredCapabilities =
        unmodifiableSet(new LinkedHashSet<>(Require.nonNull("Capabilities", desiredCapabilities)));
  }

  public RequestId getRequestId() {
    return requestId;
  }

  public Set<Capabilities> getDesiredCapabilities() {
    return desiredCapabilities;
  }

  @Override
  public String toString() {
    return new StringJoiner(", ", SessionRequestCapability.class.getSimpleName() + "[", "]")
        .add("requestId=" + requestId)
        .add("desiredCapabilities=" + desiredCapabilities)
        .toString();
  }

  @Override
  public boolean equals(Object o) {
    if (!(o instanceof SessionRequestCapability)) {
      return false;
    }
    SessionRequestCapability that = (SessionRequestCapability) o;

    return this.requestId.equals(that.requestId)
        && this.desiredCapabilities.equals(that.desiredCapabilities);
  }

  @Override
  public int hashCode() {
    return Objects.hash(requestId, desiredCapabilities);
  }

  private Map<String, Object> toJson() {
    Map<String, Object> toReturn = new HashMap<>();
    toReturn.put("requestId", requestId);
    toReturn.put("capabilities", desiredCapabilities);
    return unmodifiableMap(toReturn);
  }

  private static SessionRequestCapability fromJson(JsonInput input) {
    RequestId id = null;
    Set<Capabilities> capabilities = null;

    input.beginObject();
    while (input.hasNext()) {
      switch (input.nextName()) {
        case "capabilities":
          capabilities = input.read(SET_OF_CAPABILITIES);
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

    return new SessionRequestCapability(id, capabilities);
  }
}
