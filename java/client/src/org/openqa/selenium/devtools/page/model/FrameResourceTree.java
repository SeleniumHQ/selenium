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

import org.openqa.selenium.Beta;
import org.openqa.selenium.devtools.DevToolsException;
import org.openqa.selenium.json.JsonInput;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/**
 * Information about the Frame hierarchy along with their cached resources.EXPERIMENTAL
 */
@Beta
public class FrameResourceTree {

  /**
   * Frame information for this tree item.
   */
  private final Frame frame;
  /**
   * Child frames.
   */
  private final List<FrameResourceTree> childFrames;
  /**
   * Information about frame resources.
   */
  private final List<FrameResource> resources;

  public FrameResourceTree(
      Frame frame, List<FrameResourceTree> childFrames, List<FrameResource> resources) {
    this.frame = Objects.requireNonNull(frame, "Frame is required");
    this.childFrames = childFrames;
    this.resources = validateResource(resources);
  }

  private static FrameResourceTree fromJson(JsonInput input) {
    Frame frame = input.read(Frame.class);
    List<FrameResourceTree> childFrames = null;
    List<FrameResource> resources = null;
    while (input.hasNext()) {
      switch (input.nextName()) {
        case "childFrames":
          childFrames = new ArrayList<>();
          input.beginArray();
          while (input.hasNext()) {
            childFrames.add(input.read(FrameResourceTree.class));
          }
          input.endArray();
          break;
        case "resources":
          resources = new ArrayList<>();
          input.beginArray();
          while (input.hasNext()) {
            resources.add(input.read(FrameResource.class));
          }
          input.endArray();
          break;
        default:
          input.skipValue();
          break;
      }
    }
    return new FrameResourceTree(frame, childFrames, resources);
  }

  private List<FrameResource> validateResource(List<FrameResource> resources) {
    Objects.requireNonNull(resources, "resources is required");
    if (resources.isEmpty()) {
      throw new DevToolsException("resource is empty");
    }
    return resources;
  }
}
