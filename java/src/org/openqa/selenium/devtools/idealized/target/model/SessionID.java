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

package org.openqa.selenium.devtools.idealized.target.model;

import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.JsonInput;

/** Unique identifier of attached debugging session. */
public class SessionID {

  private final String sessionID;

  public SessionID(java.lang.String sessionID) {
    this.sessionID = Require.nonNull("Session ID", sessionID);
  }

  private static SessionID fromJson(JsonInput input) {
    return new SessionID(input.nextString());
  }

  private String toJson() {
    return sessionID;
  }

  @Override
  public String toString() {
    return sessionID;
  }
}
