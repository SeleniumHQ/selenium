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
package org.openqa.selenium.devtools.target.model;

import org.openqa.selenium.json.JsonInput;

import java.util.Objects;

public class ReceivedMessageFromTarget {

  private final SessionID sessionId;

  @Deprecated
  private final TargetID targetId;

  private final String message;

  public ReceivedMessageFromTarget(SessionID sessionId,
                                   TargetID targetId, String message) {
    this.sessionId = Objects.requireNonNull(sessionId, "sessionId is required");
    this.targetId = targetId;
    this.message = Objects.requireNonNull(message, "message is require");
  }

  private static ReceivedMessageFromTarget fromJson(JsonInput input) {
    SessionID sessionId = input.read(SessionID.class);
    TargetID targetId = null;
    String message = null;
    while (input.hasNext()) {
      switch (input.nextName()) {
        case "targetId":
          targetId = input.read(TargetID.class);
          break;
        case "message":
          message = input.nextString();
          break;
        default:
          input.skipValue();
          break;
      }
    }
    return new ReceivedMessageFromTarget(sessionId, targetId, message);
  }

  public SessionID getSessionId() {
    return sessionId;
  }

  public TargetID getTargetId() {
    return targetId;
  }

  public String getMessage() {
    return message;
  }
}
