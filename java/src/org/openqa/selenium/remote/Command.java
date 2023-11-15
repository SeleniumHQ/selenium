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

import static org.openqa.selenium.json.Json.MAP_TYPE;

import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import org.openqa.selenium.json.JsonInput;

public class Command {

  private final SessionId sessionId;
  private final CommandPayload payload;

  public Command(SessionId sessionId, String name) {
    this(sessionId, name, new HashMap<>());
  }

  public Command(SessionId sessionId, String name, Map<String, ?> parameters) {
    this(sessionId, new CommandPayload(name, parameters));
  }

  public Command(SessionId sessionId, CommandPayload payload) {
    this.sessionId = sessionId;
    this.payload = payload;
  }

  public SessionId getSessionId() {
    return sessionId;
  }

  public String getName() {
    return payload.getName();
  }

  public Map<String, ?> getParameters() {
    return payload.getParameters();
  }

  @Override
  public String toString() {
    return "[" + sessionId + ", " + getName() + " " + getParameters() + "]";
  }

  @Override
  public boolean equals(Object o) {
    if (!(o instanceof Command)) {
      return false;
    }

    Command that = (Command) o;
    return Objects.equals(this.sessionId, that.sessionId)
        && Objects.equals(this.getName(), that.getName())
        && Objects.equals(this.getParameters(), that.getParameters());
  }

  @Override
  public int hashCode() {
    return Objects.hash(sessionId, getName(), getParameters());
  }

  private static Command fromJson(JsonInput input) {
    input.beginObject();

    SessionId sessionId = null;
    String name = null;
    Map<String, Object> parameters = null;

    while (input.hasNext()) {
      switch (input.nextName()) {
        case "name":
          name = input.nextString();
          break;

        case "parameters":
          parameters = input.read(MAP_TYPE);
          break;

        case "sessionId":
          sessionId = input.read(SessionId.class);
          break;

        default:
          input.skipValue();
          break;
      }
    }

    input.endObject();

    return new Command(sessionId, name, parameters);
  }
}
