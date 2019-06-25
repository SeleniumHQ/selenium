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
package org.openqa.selenium.devtools.dom.model;

import org.openqa.selenium.json.JsonInput;

public class Rect {

  /**
   * X coordinate
   */
  private final int x;
  /**
   * Y coordinate
   */
  private final int y;
  /**
   * Rectangle width
   */
  private final int width;
  /**
   * Rectangle height
   */
  private final int height;

  public Rect(int x, int y, int width, int height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  private static Rect fromJson(JsonInput input) {
    Integer x = null, y = null, width = null, height = null;
    input.beginObject();
    while (input.hasNext()) {
      switch (input.nextName()) {
        case "x":
          x = input.read(Integer.class);
          break;
        case "y":
          y = input.read(Integer.class);
          break;
        case "width":
          width = input.read(Integer.class);
          break;
        case "height":
          height = input.read(Integer.class);
          break;
        default:
          input.skipValue();
          break;
      }
    }
    input.endObject();
    return new Rect(x, y, width, height);
  }
}
