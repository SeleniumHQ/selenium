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

import org.openqa.selenium.json.JsonInput;

import java.util.Objects;

public class FrameScheduledNavigation {

  /**
   * Id of the frame that has scheduled a navigation.
   */
  private final FrameId frameId;
  /**
   * Delay (in seconds) until the navigation is scheduled to begin. The navigation is not guaranteed
   * to start.
   */
  private final int delay;
  /**
   * The reason for the navigation.
   */
  private final String reason;
  /**
   * The destination URL for the scheduled navigation.
   */
  private final String url;

  public FrameScheduledNavigation(FrameId frameId, int delay, String reason, String url) {
    this.frameId = Objects.requireNonNull(frameId, "frameId is required");
    this.delay = delay;
    this.reason = validateReason(reason);
    this.url = Objects.requireNonNull(url, "url is required");
  }

  private static FrameScheduledNavigation fromJson(JsonInput input) {
    FrameId frameId = input.read(FrameId.class);
    Integer delay = null;
    String reason = null, url = null;
    while (input.hasNext()) {
      switch (input.nextName()) {
        case "delay":
          delay = input.read(Integer.class);
          break;
        case "reason":
          reason = input.nextString();
          break;
        case "url":
          url = input.nextString();
          break;
        default:
          input.skipValue();
          break;
      }
    }
    return new FrameScheduledNavigation(frameId, delay, reason, url);
  }

  private String validateReason(String reason) {
    String v = Objects.requireNonNull(reason, "reason is required");
    ClientNavigationReasonValues.getValues(v);
    return v;
  }
}
