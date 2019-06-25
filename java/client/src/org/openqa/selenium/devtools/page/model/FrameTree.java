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
/**
 * Information about the Frame hierarchy.
 */

import org.openqa.selenium.json.JsonInput;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/** Information about the Frame hierarchy. */
public class FrameTree {

  /** Frame information for this tree item. */
  private final Frame frame;
  /** Child frames. */
  private final List<Frame> childFrames;

  public FrameTree(Frame frame, List<Frame> childFrames) {
    this.frame = Objects.requireNonNull(frame, "frame is required");
    this.childFrames = childFrames;
  }

  private static FrameTree fromJson(JsonInput input) {
    Frame frame = input.read(Frame.class);
    List<Frame> childFrames = null;
    while (input.hasNext()) {
      switch (input.nextName()) {
        case "childFrames":
          childFrames = new ArrayList<>();
          input.beginArray();
          while (input.hasNext()) {
            childFrames.add(input.read(Frame.class));
          }
          input.endArray();
          break;
        default:
          input.skipValue();
          break;
      }
    }
    return new FrameTree(frame, childFrames);
  }
}
