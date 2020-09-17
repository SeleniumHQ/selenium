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
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.JsonInput;
import org.openqa.selenium.remote.SessionId;

import java.time.Instant;
import java.util.Map;
import java.util.Objects;

public class Active {

  private final Capabilities stereotype;
  private final SessionId id;
  private final Capabilities currentCapabilities;
  private final Instant startTime;

  public Active(Capabilities stereotype, SessionId id, Capabilities currentCapabilities, Instant startTime) {
    this.stereotype = ImmutableCapabilities.copyOf(Require.nonNull("Stereotype", stereotype));
    this.id = Require.nonNull("Session id", id);
    this.currentCapabilities =
      ImmutableCapabilities.copyOf(Require.nonNull("Capabilities", currentCapabilities));
    this.startTime = Require.nonNull("Start time", startTime);
  }

  public SessionId getId() {
    return id;
  }

  public Capabilities getStereotype() {
    return stereotype;
  }

  public SessionId getSessionId() {
    return id;
  }

  public Capabilities getCurrentCapabilities() {
    return currentCapabilities;
  }

  public Instant getStartTime() {
    return startTime;
  }

  @Override
  public boolean equals(Object o) {
    if (!(o instanceof Active)) {
      return false;
    }
    Active that = (Active) o;
    return Objects.equals(this.getStereotype(), that.getStereotype()) &&
      Objects.equals(this.id, that.id) &&
      Objects.equals(this.getCurrentCapabilities(), that.getCurrentCapabilities()) &&
      Objects.equals(this.getStartTime().toEpochMilli(), that.getStartTime().toEpochMilli());
  }

  @Override
  public int hashCode() {
    return Objects.hash(getStereotype(), getSessionId(), getCurrentCapabilities(), getStartTime().toEpochMilli());
  }

  private Map<String, Object> toJson() {
    return ImmutableMap.of(
      "sessionId", getSessionId(),
      "stereotype", getStereotype(),
      "currentCapabilities", getCurrentCapabilities(),
      "startTime", getStartTime());
  }

  private static Active fromJson(JsonInput input) {
    SessionId id = null;
    Capabilities stereotype = null;
    Capabilities current = null;
    Instant startTime = null;

    input.beginObject();
    while (input.hasNext()) {
      switch (input.nextName()) {
        case "currentCapabilities":
          current = input.read(Capabilities.class);
          break;

        case "sessionId":
          id = input.read(SessionId.class);
          break;

        case "startTime":
          startTime = input.read(Instant.class);
          break;

        case "stereotype":
          stereotype = input.read(Capabilities.class);
          break;
      }
    }
    input.endObject();

    return new Active(stereotype, id, current, startTime);
  }
}
