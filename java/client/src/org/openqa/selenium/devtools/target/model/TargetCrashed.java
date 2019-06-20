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

public class TargetCrashed {

  private final TargetId targetId;

  private final String status;

  private final int errorCode;

  public TargetCrashed(TargetId targetId, String status, Integer errorCode) {
    this.targetId = Objects.requireNonNull(targetId, "targetId is required");
    this.status = Objects.requireNonNull(status, "status is required");
    this.errorCode = Objects.requireNonNull(errorCode, "errorCode is require");
  }

  private static TargetCrashed fromJson(JsonInput input) {
    TargetId targetId = null;
    String status = null;
    Integer errorCode = null;
    while (input.hasNext()) {
      switch (input.nextName()) {
        case "targetId":
          targetId = input.read(TargetId.class);
          break;
        case "status":
          status = input.nextString();
          break;
        case "errorCode":
          errorCode = input.read(Integer.class);
          break;
        default:
          input.skipValue();
          break;
      }
    }
    return new TargetCrashed(targetId, status, errorCode);
  }

  public TargetId getTargetId() {
    return targetId;
  }

  public String getStatus() {
    return status;
  }

  public int getErrorCode() {
    return errorCode;
  }
}
