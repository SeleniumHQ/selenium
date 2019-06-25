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

import java.time.Instant;

/**
 * Screencast frame metadata.EXPERIMENTAL
 */
public class ScreencastFrameMetadata {

  /**
   * Top offset in DIP.
   */
  private final double offsetTop;
  /**
   * Page scale factor.
   */
  private final double pageScaleFactor;
  /**
   * Device screen width in DIP.
   */
  private final double deviceWidth;
  /**
   * Device screen height in DIP.
   */
  private final double deviceHeight;
  /**
   * Position of horizontal scroll in CSS pixels.
   */
  private final double scrollOffsetX;
  /**
   * Position of vertical scroll in CSS pixels.
   */
  private final double scrollOffsetY;
  /**
   * Frame swap timestamp.
   */
  private final Instant timestamp;

  public ScreencastFrameMetadata(
      double offsetTop,
      double pageScaleFactor,
      double deviceWidth,
      double deviceHeight,
      double scrollOffsetX,
      double scrollOffsetY,
      Instant timestamp) {
    this.offsetTop = offsetTop;
    this.pageScaleFactor = pageScaleFactor;
    this.deviceWidth = deviceWidth;
    this.deviceHeight = deviceHeight;
    this.scrollOffsetX = scrollOffsetX;
    this.scrollOffsetY = scrollOffsetY;
    this.timestamp = timestamp;
  }

  private static ScreencastFrameMetadata fromJson(JsonInput input) {
    Double offsetTop = input.read(Double.class),
        pageScaleFactor = null,
        deviceWidth = null,
        deviceHeight = null,
        scrollOffsetX = null,
        scrollOffsetY = null;
    Instant timestamp = null;
    while (input.hasNext()) {
      switch (input.nextName()) {
        case "pageScaleFactor":
          pageScaleFactor = input.read(Double.class);
          break;
        case "deviceHeight":
          deviceHeight = input.read(Double.class);
          break;
        case "deviceWidth":
          deviceWidth = input.read(Double.class);
          break;
        case "scrollOffsetX":
          scrollOffsetX = input.read(Double.class);
          break;
        case "scrollOffsetY":
          scrollOffsetY = input.read(Double.class);
          break;
        case "timestamp":
          timestamp = input.nextInstant();
          break;
        default:
          input.skipValue();
          break;
      }
    }
    return new ScreencastFrameMetadata(
        offsetTop,
        pageScaleFactor,
        deviceWidth,
        deviceHeight,
        scrollOffsetX,
        scrollOffsetY,
        timestamp);
  }
}
