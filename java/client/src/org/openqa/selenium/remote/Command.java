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

import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

public class Command {

  private final SessionId sessionId;
  private final String name;
  private final Map<String, ?> parameters;

  public Command(SessionId sessionId, String name) {
    this(sessionId, name, new HashMap<>());
  }

  public Command(SessionId sessionId, String name, Map<String, ?> parameters) {
    this.sessionId = sessionId;
    this.name = name;
    this.parameters = parameters == null ? new HashMap<>() : parameters;
  }

  public SessionId getSessionId() {
    return sessionId;
  }

  public String getName() {
    return name;
  }

  public Map<String, ?> getParameters() {
    return parameters;
  }

  @Override
  public String toString() {
    return "[" + sessionId + ", " + name + " " + parameters + "]";
  }

  @Override
  public boolean equals(Object o) {
    if (!(o instanceof Command)) {
      return false;
    }

    Command that = (Command) o;
    return Objects.equals(sessionId, that.sessionId) &&
           Objects.equals(name, that.name) &&
           Objects.equals(parameters, that.parameters);
  }

  @Override
  public int hashCode() {
    return Objects.hash(sessionId, name, parameters);
  }
}
