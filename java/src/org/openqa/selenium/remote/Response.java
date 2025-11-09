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

package org.openqa.selenium.remote;

import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import org.jspecify.annotations.NullMarked;
import org.jspecify.annotations.Nullable;

@NullMarked
public class Response {

  private volatile @Nullable Object value;
  private volatile @Nullable String sessionId;
  @Deprecated // (forRemoval = true)
  private volatile @Nullable Integer status;
  private volatile @Nullable String state;

  public Response() {}

  public Response(SessionId sessionId) {
    this.sessionId = String.valueOf(sessionId);
  }

  @Deprecated // (forRemoval = true)
  public @Nullable Integer getStatus() {
    return status;
  }

  @Deprecated // (forRemoval = true)
  public void setStatus(@Nullable Integer status) {
    this.status = status;
  }

  public @Nullable String getState() {
    return state;
  }

  public void setState(@Nullable String state) {
    this.state = state;
  }

  public void setValue(@Nullable Object value) {
    this.value = value;
  }

  public @Nullable Object getValue() {
    return value;
  }

  public void setSessionId(@Nullable String sessionId) {
    this.sessionId = sessionId;
  }

  public @Nullable String getSessionId() {
    return sessionId;
  }

  @Override
  public String toString() {
    return String.format(
        "(Response: SessionID: %s, State: %s, Value: %s)", getSessionId(), getState(), getValue());
  }

  @Override
  public boolean equals(@Nullable Object o) {
    if (!(o instanceof Response)) {
      return false;
    }

    Response that = (Response) o;
    return Objects.equals(value, that.value)
        && Objects.equals(sessionId, that.sessionId)
        && Objects.equals(status, that.status)
        && Objects.equals(state, that.state);
  }

  @Override
  public int hashCode() {
    return Objects.hash(value, sessionId, status, state);
  }

  private static Response fromJson(Map<String, Object> json) {
    ErrorCodes errorCodes = new ErrorCodes();
    Response response = new Response();

    if (json.get("error") instanceof String) {
      String state = (String) json.get("error");
      response.setState(state);
      response.setStatus(errorCodes.toStatus(state, Optional.empty()));
      response.setValue(json.get("message"));
    }

    if (json.get("state") instanceof String) {
      String state = (String) json.get("state");
      response.setState(state);
      response.setStatus(errorCodes.toStatus(state, Optional.empty()));
    }

    if (json.get("status") != null) {
      Object status = json.get("status");
      if (status instanceof String) {
        String state = (String) status;
        response.setState(state);
        response.setStatus(errorCodes.toStatus(state, Optional.empty()));
      } else {
        int intStatus = ((Number) status).intValue();
        response.setState(errorCodes.toState(intStatus));
        response.setStatus(intStatus);
      }
    }

    if (json.get("sessionId") instanceof String) {
      response.setSessionId((String) json.get("sessionId"));
    }

    response.setValue(json.getOrDefault("value", json));

    return response;
  }
}
