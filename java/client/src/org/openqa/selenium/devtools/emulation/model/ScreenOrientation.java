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
package org.openqa.selenium.devtools.emulation.model;

import org.openqa.selenium.json.JsonInput;

import java.util.Objects;

/**
 * Screen orientation.
 */
public class ScreenOrientation {

  /**
   * Orientation type.
   */
  private final ScreenOrientationTypes type;
  /**
   * Orientation angle
   */
  private final int angel;

  public ScreenOrientation(ScreenOrientationTypes type, int angel) {
    Objects.requireNonNull(type, "type is required");
    this.type = type;
    this.angel = angel;
  }

  private static ScreenOrientation fromJson(JsonInput input) {
    ScreenOrientationTypes type = input.read(ScreenOrientationTypes.class);
    Integer angel = null;
    while (input.hasNext()) {
      switch (input.nextName()) {
        case "angle":
          angel = input.read(Integer.class);
          break;
        default:
          input.skipValue();
          break;
      }
    }
    return new ScreenOrientation(type, angel);
  }
}
