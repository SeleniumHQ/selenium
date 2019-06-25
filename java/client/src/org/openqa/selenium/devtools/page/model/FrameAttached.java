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
package org.openqa.selenium.devtools.page.model;

import org.openqa.selenium.devtools.runtime.model.StackTrace;
import org.openqa.selenium.json.JsonInput;

import java.util.Objects;

/**
 * Fired when frame has been attached to its parent.
 */
public class FrameAttached {

  /**
   * Id of the frame that has been attached.
   */
  private final FrameId frameId;
  /**
   * Parent frame identifier.
   */
  private final FrameId parentFrameId;
  /**
   * JavaScript stack trace of when frame was attached, only set if frame initiated from script.
   */
  private final StackTrace stack;

  public FrameAttached(FrameId frameId, FrameId parentFrameId,
                       StackTrace stack) {

    this.frameId = Objects.requireNonNull(frameId, "frameId is required");
    this.parentFrameId = Objects.requireNonNull(parentFrameId, "parentFrameId is required");
    this.stack = stack;
  }

  private static FrameAttached fromJson(JsonInput input) {
    FrameId frameId = input.read(FrameId.class);
    FrameId parentFrameId = null;
    StackTrace stack = null;
    while (input.hasNext()) {
      switch (input.nextName()) {
        case "parentFrameId":
          parentFrameId = input.read(FrameId.class);
          break;
        case "stack":
          stack = input.read(StackTrace.class);
          break;
        default:
          input.skipValue();
          break;
      }
    }
    return new FrameAttached(frameId, parentFrameId, stack);
  }
}
