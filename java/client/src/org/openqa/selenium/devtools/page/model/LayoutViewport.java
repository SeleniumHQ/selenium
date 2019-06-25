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

/**
 * Layout viewport position and dimensions.
 */
public class LayoutViewport {

  /**
   * Horizontal offset relative to the document (CSS pixels).
   */
  private final int pageX;
  /**
   * Vertical offset relative to the document (CSS pixels).
   */
  private final int pageY;
  /**
   * Width (CSS pixels), excludes scrollbar if present.
   */
  private final int clientWidth;
  /**
   * Height (CSS int), excludes scrollbar if present.
   */
  private final int clientHeight;

  public LayoutViewport(int pageX, int pageY, int clientWidth, int clientHeight) {
    this.pageX = pageX;
    this.pageY = pageY;
    this.clientWidth = clientWidth;
    this.clientHeight = clientHeight;
  }

  private static LayoutViewport fromJson(JsonInput input) {
    Integer pageX = null, pageY = null, clientHeight = null, clientWidth = null;
    input.beginObject();
    while (input.hasNext()) {
      switch (input.nextName()) {
        case "pageX":
          pageX = input.read(Integer.class);
          break;
        case "pageY":
          pageY = input.read(Integer.class);
          break;
        case "clientWidth":
          clientWidth = input.read(Integer.class);
          break;
        case "clientHeight":
          clientHeight = input.read(Integer.class);
          break;
        default:
          input.skipValue();
          break;
      }

    }
    input.endObject();
    return new LayoutViewport(pageX, pageY, clientWidth, clientWidth);
  }
}
