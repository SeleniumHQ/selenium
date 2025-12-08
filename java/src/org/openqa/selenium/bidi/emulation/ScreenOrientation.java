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

package org.openqa.selenium.bidi.emulation;

import java.util.HashMap;
import java.util.Map;

public class ScreenOrientation {
  private final ScreenOrientationNatural natural;
  private final ScreenOrientationType type;

  public ScreenOrientation(ScreenOrientationNatural natural, ScreenOrientationType type) {
    if (natural == null) {
      throw new IllegalArgumentException("Natural orientation cannot be null");
    }
    if (type == null) {
      throw new IllegalArgumentException("Orientation type cannot be null");
    }
    this.natural = natural;
    this.type = type;
  }

  public ScreenOrientationNatural getNatural() {
    return natural;
  }

  public ScreenOrientationType getType() {
    return type;
  }

  public Map<String, Object> toMap() {
    Map<String, Object> map = new HashMap<>();
    map.put("natural", natural.toString());
    map.put("type", type.toString());
    return map;
  }
}
