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

package org.openqa.selenium.devtools.profiler.model;

import org.openqa.selenium.devtools.network.model.CallFrame;
import org.openqa.selenium.json.JsonInput;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

public class ProfileNode {

  /**
   * Unique id of the node.
   */
  private final int id;
  /**
   * Function location.
   */
  private final CallFrame callFrame;

  /**
   * Number of samples where this node was on top of the call stack. Optional
   */
  private final Integer hitCount;

  /**
   * Children node id Optional
   */
  private final List<Integer> children;

  /**
   * The reason of being not optimized. The function may be deoptimized or marked as don't optimize. Optional
   */
  private final String deoptReason;

  /**
   * An array of source position ticks. Optional
   */
  private final List<PositionTickInfo> positionTicks;

  public ProfileNode(int id, CallFrame callFrame, Integer hitCount,
                     List<Integer> children, String deoptReason,
                     List<PositionTickInfo> positionTicks) {
    Objects.requireNonNull(callFrame, "callFrame is mandatory");
    this.id = id;
    this.callFrame = callFrame;
    this.hitCount = hitCount;
    this.children = children;
    this.deoptReason = deoptReason;
    this.positionTicks = positionTicks;
  }

  public static ProfileNode fromJson(JsonInput input) {
    int id = -1;
    CallFrame callFrame = null;
    Integer hitCount = null;
    List<Integer> children = null;
    String dropReason = null;
    List<PositionTickInfo> positionTicks = null;
    input.beginObject();
    while (input.hasNext()) {
      switch (input.nextName()) {
        case "id":
          id = input.read(Integer.class);
          break;
        case "callFrame":
          callFrame = input.read(CallFrame.class);
          break;
        case "hitCount":
          hitCount = input.read(Integer.class);
          break;
        case "children":
          children = new ArrayList<>();
          input.beginArray();
          while (input.hasNext()) {
            children.add(input.read(Integer.class));
          }
          input.endArray();
          break;
        case "dropReason":
          dropReason = input.nextString();
          break;
        case "positionTicks":
          positionTicks = new ArrayList<>();
          input.beginArray();
          while (input.hasNext()) {
            positionTicks.add(input.read(PositionTickInfo.class));
          }
          input.endArray();
          break;
        default:
          input.skipValue();
          break;
      }
    }
    input.endObject();
    return new ProfileNode(id, callFrame, hitCount, children, dropReason, positionTicks);
  }

  public int getId() {
    return id;
  }


  public CallFrame getCallFrame() {
    return callFrame;
  }

  public int getHitCount() {
    return hitCount;
  }

  public List<Integer> getChildren() {
    return children;
  }

  public String getDeoptReason() {
    return deoptReason;
  }

  public List<PositionTickInfo> getPositionTicks() {
    return positionTicks;
  }

}
