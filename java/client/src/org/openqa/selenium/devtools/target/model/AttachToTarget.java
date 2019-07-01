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
import org.openqa.selenium.remote.SessionId;

import java.util.Objects;

public class AttachToTarget {

  private final SessionId sessionId;

  private final TargetInfo targetInfo;

  private final boolean waitForDebugger;

  public AttachToTarget(SessionId sessionId,
                        TargetInfo targetInfo, Boolean waitForDebugger) {
    this.sessionId = Objects.requireNonNull(sessionId, "sessionId is required");
    this.targetInfo = Objects.requireNonNull(targetInfo, "targetInfo is required");
    this.waitForDebugger = Objects.requireNonNull(waitForDebugger, "waitForDebugger is require");
  }

  private static AttachToTarget fromJson(JsonInput input) {
    SessionId sessionId = input.read(SessionId.class);
    TargetInfo targetInfo = null;
    Boolean waitForDebugger = null;
    while (input.hasNext()) {
      switch (input.nextName()) {
        case "targetInfo":
          targetInfo = input.read(TargetInfo.class);
          break;
        case "waitingForDebugger":
          waitForDebugger = input.nextBoolean();
          break;
        default:
          input.skipValue();
          break;
      }
    }
    return new AttachToTarget(sessionId, targetInfo, waitForDebugger);
  }
}
