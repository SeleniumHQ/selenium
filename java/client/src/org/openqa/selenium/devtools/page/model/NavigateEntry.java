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
import org.openqa.selenium.json.JsonInput;

import java.util.Objects;

public class NavigateEntry {

  /**
   * Frame id that has navigated (or failed to navigate)
   */
  private final FrameId frameId;
  /**
   * Loader identifier.
   */
  private final LoaderId loaderId;
  /**
   * User friendly error message, present if and only if navigation has failed.
   */
  private final String errorText;

  public NavigateEntry(FrameId frameId, LoaderId loaderId, String errorText) {
    this.frameId = Objects.requireNonNull(frameId, "frameId is required");
    this.loaderId = loaderId;
    this.errorText = errorText;
  }

  private static NavigateEntry fromJson(JsonInput input) {
    FrameId frameId = input.read(FrameId.class);
    LoaderId loaderId = null;
    String errorText = null;
    while (input.hasNext()) {
      switch (input.nextName()) {
        case "loaderId":
          loaderId = input.read(LoaderId.class);
          break;
        case "errorText":
          errorText = input.nextString();
          break;
        default:
          input.skipValue();
          break;
      }
    }
    return new NavigateEntry(frameId, loaderId, errorText);
  }

}
