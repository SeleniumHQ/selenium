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

import org.openqa.selenium.devtools.network.model.LoaderId;
import org.openqa.selenium.devtools.network.model.MonotonicTime;
import org.openqa.selenium.json.JsonInput;

import java.util.Objects;

public class LifecycleEvent {

  /**
   * Id of the frame.
   */
  private final FrameId frameId;
  /**
   * Loader identifier. Empty string if the request is fetched from worker.
   */
  private final LoaderId loaderId;

  private final String name;

  private final MonotonicTime timestamp;

  public LifecycleEvent(FrameId frameId, LoaderId loaderId, String name, MonotonicTime timestamp) {
    this.frameId = Objects.requireNonNull(frameId, "frameId is required");
    this.loaderId = Objects.requireNonNull(loaderId, "loaderIs is required");
    this.name = Objects.requireNonNull(name, "name is required");
    this.timestamp = Objects.requireNonNull(timestamp, "timestamp is required");
  }

  private static LifecycleEvent fromJson(JsonInput input) {
    FrameId frameId = input.read(FrameId.class);
    LoaderId loaderId = null;
    String name = null;
    MonotonicTime timestamp = null;
    while (input.hasNext()) {
      switch (input.nextName()) {
        case "loaderId":
          loaderId = input.read(LoaderId.class);
          break;
        case "name":
          name = input.nextString();
          break;
        case "timestamp":
          timestamp = input.read(MonotonicTime.class);
          break;
        default:
          input.skipValue();
          break;
      }
    }
    return new LifecycleEvent(frameId, loaderId, name, timestamp);
  }

  public FrameId getFrameId() {
    return frameId;
  }

  public LoaderId getLoaderId() {
    return loaderId;
  }

  public String getName() {
    return name;
  }

  public MonotonicTime getTimestamp() {
    return timestamp;
  }
}
