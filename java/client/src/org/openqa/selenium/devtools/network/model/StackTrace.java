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

package org.openqa.selenium.devtools.network.model;

import static java.util.Objects.requireNonNull;

import org.openqa.selenium.json.JsonInput;

import java.util.ArrayList;
import java.util.List;

/**
 * Call frames for assertions or error messages.
 */
public class StackTrace {

  private String description;

  private List<CallFrame> callFrames;

  private StackTrace parent;

  private StackTraceId parentId;

  private StackTrace(String description,
                     List<CallFrame> callFrames,
                     StackTrace parent,
                     StackTraceId parentId) {
    this.description = description;
    this.callFrames = requireNonNull(callFrames, "'callFrames' is required for StackTrace");
    this.parent = parent;
    this.parentId = parentId;
  }

  /**
   * String label of this stack trace. For async traces this may be a name of the function that
   * initiated the async call.
   */
  public String getDescription() {
    return description;
  }

  /**
   * String label of this stack trace. For async traces this may be a name of the function that
   * initiated the async call.
   */
  public void setDescription(String description) {
    this.description = description;
  }

  /**
   * JavaScript function name.
   */
  public List<CallFrame> getCallFrames() {
    return callFrames;
  }

  /**
   * JavaScript function name.
   */
  public void setCallFrames(List<CallFrame> callFrames) {
    this.callFrames = callFrames;
  }

  /**
   * Asynchronous JavaScript stack trace that preceded this stack, if available.
   */
  public StackTrace getParent() {
    return parent;
  }

  /**
   * Asynchronous JavaScript stack trace that preceded this stack, if available.
   */
  public void setParent(StackTrace parent) {
    this.parent = parent;
  }

  /**
   * Asynchronous JavaScript stack trace that preceded this stack, if available.
   */
  public StackTraceId getParentId() {
    return parentId;
  }

  /**
   * Asynchronous JavaScript stack trace that preceded this stack, if available.
   */
  public void setParentId(StackTraceId parentId) {
    this.parentId = parentId;
  }

  private static StackTrace fromJson(JsonInput input) {
    input.beginObject();
    String description = null;
    List<CallFrame> callFrames = null;
    StackTrace parent = null;
    StackTraceId parentId = null;

    while (input.hasNext()) {
      switch (input.nextName()) {
        case "description":
          description = input.nextString();
          break;
        case "callFrames":
          input.beginArray();
          callFrames = new ArrayList<>();
          while (input.hasNext()) {
            callFrames.add(input.read(CallFrame.class));
          }
          input.endArray();
          break;
        default:
          input.skipValue();
          break;
      }
    }
    input.endObject();
    return new StackTrace(description, callFrames, parent, parentId);
  }
}
