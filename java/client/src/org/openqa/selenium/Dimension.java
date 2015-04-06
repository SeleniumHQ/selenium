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

/**
 * Similar to Point - implement locally to avoid depending on GWT.
 */
public class Dimension {
  public final int width;
  public final int height;

  public Dimension(int width, int height) {
    this.width = width;
    this.height = height;
  }

  public int getWidth() {
    return width;
  }

  public int getHeight() {
    return height;
  }

  @Override
  public boolean equals(Object o) {
    if (!(o instanceof Dimension)) {
      return false;
    }

    Dimension other = (Dimension) o;
    return other.width == width && other.height == height;
  }

  @Override
  public int hashCode() {
    // Assuming height, width, rarely exceed 4096 pixels, shifting
    // by 12 should provide a good hash value.
    return width << 12 + height;
  }

  @Override
  public String toString() {
    return String.format("(%d, %d)", width, height);
  }
}
