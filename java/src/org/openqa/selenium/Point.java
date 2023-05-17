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

import java.util.Objects;

/** A copy of java.awt.Point, to remove dependency on awt. */
public class Point {
  public int x;
  public int y;

  public Point(int x, int y) {
    this.x = x;
    this.y = y;
  }

  public int getX() {
    return x;
  }

  public int getY() {
    return y;
  }

  public Point moveBy(int xOffset, int yOffset) {
    return new Point(x + xOffset, y + yOffset);
  }

  @Override
  public boolean equals(Object o) {
    if (!(o instanceof Point)) {
      return false;
    }

    Point other = (Point) o;
    return other.x == x && other.y == y;
  }

  @Override
  public int hashCode() {
    return Objects.hash(x, y);
  }

  /**
   * @deprecated Use {{@link #moveBy(int, int)} instead}
   */
  @Deprecated
  public void move(int newX, int newY) {
    x = newX;
    y = newY;
  }

  @Override
  public String toString() {
    return String.format("(%d, %d)", x, y);
  }
}
