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

public class Rectangle {

  public int x;
  public int y;
  public int height;
  public int width;

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

  public void setX(int x) {
    this.x = x;
  }

  public void setY(int y) {
    this.y = y;
  }

  public int getHeight() {
    return height;
  }

  public void setHeight(int height) {
    this.height = height;
  }

  public int getWidth() {
    return width;
  }

  public void setWidth(int width) {
    this.width = width;
  }

  public Point getPoint() {
    return new Point(x, y);
  }

  public Dimension getDimension() {
    return new Dimension(width, height);
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }

    Rectangle rectangle = (Rectangle) o;

    if (! getPoint().equals(rectangle.getPoint())) {
      return false;
    }
    return getDimension().equals(rectangle.getDimension());

  }

  @Override
  public int hashCode() {
    int result = getPoint().hashCode();
    result = 31 * result + getDimension().hashCode();
    return result;
  }
}
