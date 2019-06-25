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

/**
 * Viewport for capturing screenshot.
 */

public class Viewport {

  /**
   * X offset in device independent pixels (dip).
   */
  private final double x;
  /**
   * Y offset in device independent pixels (dip).
   */
  private final double y;
  /**
   * Rectangle width in device independent pixels (dip).
   */
  private final double width;
  /**
   * Rectangle height in device independent pixels (dip).
   */
  private final double height;
  /**
   * Page scale factor.
   */
  private final double scale;

  public Viewport(Double x, Double y, Double width, Double height, Double scale) {
    this.x = Objects.requireNonNull(x, "x is required");
    this.y = Objects.requireNonNull(y, "y is required");
    this.width = Objects.requireNonNull(width, "width is required");
    this.height = Objects.requireNonNull(height, "height is required");
    this.scale = Objects.requireNonNull(scale, "scale is required");
  }


  private static Viewport fromJson(JsonInput input) {
    Double x = input.read(Double.class);
    Double y = null;
    Double width = null;
    Double height = null;
    Double scale = null;
    while (input.hasNext()) {
      switch (input.nextName()) {
        case "y":
          y = input.read(Double.class);
          break;
        case "width":
          width = input.read(Double.class);
          break;
        case "height":
          height = input.read(Double.class);
          break;
        case "scale":
          scale = input.read(Double.class);
          break;
        default:
          input.skipValue();
          break;
      }
    }
    return new Viewport(x, y, width, height, scale);
  }
}
