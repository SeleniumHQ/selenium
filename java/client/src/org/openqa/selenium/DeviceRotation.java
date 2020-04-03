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

package org.openqa.selenium;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

/**
 * Defines an object which represents the three dimensional plane and how a device can be rotated
 * about it. Each of the axes is in positive degrees on the real number scale (0 &lt;= deg &lt;=
 * 360).
 *
 * <p>Example instantiation to rotate device to "Landscape Right": DeviceRotation(0, 0, 90);
 */
public class DeviceRotation {
  // The default orientation is portrait.
  private int x = 0;
  private int y = 0;
  private int z = 0;

  /**
   * Instantiate a DeviceRotation object based on three integers.
   */
  public DeviceRotation(int x, int y, int z) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.validateParameters(this.x, this.y, this.z);
  }

  /**
   * Instantiate a DeviceRotation object based on a HashMap object where the keys are the axes x, y,
   * and z respectively: x : xVal y : yVal z : zVal
   */
  public DeviceRotation(Map<String, Number> map) {
    if (map == null || !map.containsKey("x") || !map.containsKey("y") || !map.containsKey("z")) {
      throw new IllegalArgumentException(
          "Could not initialize DeviceRotation with map given: " + map.toString());
    }
    this.x = map.get("x").intValue();
    this.y = map.get("y").intValue();
    this.z = map.get("z").intValue();
    this.validateParameters(x, y, z);
  }

  private void validateParameters(int x, int y, int z) {
    if (x < 0 || y < 0 || z < 0) {
      throw new IllegalArgumentException(
          "DeviceRotation requires positive axis values: \nx = " + x + "\ny = " + y + "\nz = " + z);
    } else if (x >= 360 || y >= 360 || z >= 360) {
      throw new IllegalArgumentException(
          "DeviceRotation requires positive axis values under 360: \nx = "
              + x
              + "\ny = "
              + y
              + "\nz = "
              + z);
    }
  }

  /** @return The x. */
  public int getX() {
    return x;
  }

  /** @return The y. */
  public int getY() {
    return y;
  }

  /** @return The z. */
  public int getZ() {
    return z;
  }

  /** @return All axes mapped to a Map. */
  public Map<String, Integer> parameters() {
    HashMap<String, Integer> values = new HashMap<>();
    values.put("x", this.x);
    values.put("y", this.y);
    values.put("z", this.z);
    return Collections.unmodifiableMap(values);
  }

  @Override
  public boolean equals(Object o) {
    if (!(o instanceof DeviceRotation)) {
      return false;
    }
    if (o == this) {
      return true;
    }

    DeviceRotation obj = (DeviceRotation) o;
    return obj.getX() == this.getX() && obj.getY() == this.getY() && obj.getZ() == this.getZ();
  }

  @Override
  public int hashCode() {
    return Objects.hash(getX(), getY(), getZ());
  }
}
