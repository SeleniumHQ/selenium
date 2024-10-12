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

import java.util.Map;
import java.util.Objects;
import org.jspecify.annotations.NullMarked;
import org.jspecify.annotations.Nullable;

@NullMarked
public class Rectangle {

  public final int x;
  public final int y;
  public final int height;
  public final int width;

  public Rectangle(int x, int y, int height, int width) {
    this.x = x;
    this.y = y;
    this.height = height;
    this.width = width;
  }

  public Rectangle(Point p, Dimension d) {
    x = p.x;
    y = p.y;
    height = d.height;
    width = d.width;
  }

  public int getX() {
    return x;
  }

  public int getY() {
    return y;
  }

  public int getHeight() {
    return height;
  }

  public int getWidth() {
    return width;
  }

  public Point getPoint() {
    return new Point(x, y);
  }

  public Dimension getDimension() {
    return new Dimension(width, height);
  }

  private Map<String, Object> toJson() {
    return Map.of("width", width, "height", height, "x", x, "y", y);
  }

  @Override
  public boolean equals(@Nullable Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }

    Rectangle rectangle = (Rectangle) o;

    return x == rectangle.x
        && y == rectangle.y
        && height == rectangle.height
        && width == rectangle.width;
  }

  @Override
  public int hashCode() {
    return Objects.hash(x, y, height, width);
  }
}
