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

import static org.openqa.selenium.json.JsonInputConverter.extractInt;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import org.openqa.selenium.devtools.network.model.CallFrame;
import org.openqa.selenium.json.JsonInput;

public class ProfileNode {

  /**
   * Unique id of the node.
   */
  private int id;
  /**
   * Function location.
   */
  private CallFrame callFrame;

  /**
   * Number of samples where this node was on top of the call stack. Optional
   */
  private Integer hitCount;

  /**
   * Children node id Optional
   */
  private List<Integer> children;

  /**
   * The reason of being not optimized. The function may be deoptimized or marked as don't optimize. Optional
   */
  private String deoptReason;

  /**
   * An array of source position ticks. Optional
   */
  private List<PositionTickInfo> positionTicks;

  public ProfileNode(
    int id,
    CallFrame callFrame,
    Integer hitCount,
    List<Integer> children,
    String deoptReason,
    List<PositionTickInfo> positionTicks) {

    this.setId(id);
    this.setCallFrame(callFrame);
    this.setHitCount(hitCount);
    this.setChildren(children);
    this.setDeoptReason(deoptReason);
    this.setPositionTicks(positionTicks);
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
          id = extractInt(input);
          break;
        case "callFrame":
          callFrame = CallFrame.parseCallFrame(input);
          break;
        case "hitCount":
          hitCount = extractInt(input);
          break;
        case "children":
          children = new ArrayList<>();
          input.beginArray();
          while (input.hasNext()) {
            children.add(extractInt(input));
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
            positionTicks.add(PositionTickInfo.fromJson(input));
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

  public void setId(Integer id) {
    this.id = id;
  }

  public CallFrame getCallFrame() {
    return callFrame;
  }

  public void setCallFrame(CallFrame callFrame) {
    Objects.requireNonNull(callFrame, "callFrame is mandatory");
    this.callFrame = callFrame;
  }

  public int getHitCount() {
    return hitCount;
  }

  public void setHitCount(int hitCount) {
    this.hitCount = hitCount;
  }

  public List<Integer> getChildren() {
    return children;
  }

  public void setChildren(List<Integer> children) {
    this.children = children;
  }

  public String getDeoptReason() {
    return deoptReason;
  }

  public void setDeoptReason(String deoptReason) {
    this.deoptReason = deoptReason;
  }

  public List<PositionTickInfo> getPositionTicks() {
    return positionTicks;
  }

  public void setPositionTicks(List<PositionTickInfo> positionTicks) {
    this.positionTicks = positionTicks;
  }
}
