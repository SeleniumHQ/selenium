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

package org.openqa.selenium.print;

import org.openqa.selenium.internal.Require;

public class PageMargin {
  private double top;
  private double bottom;
  private double left;
  private double right;

  public PageMargin() {
    this.top = 1.0;
    this.bottom = 1.0;
    this.left = 1.0;
    this.right = 1.0;
  }

  public double getTop() {
    return top;
  }

  public void setTop(double top) {
    this.top = Require.positive("top", top);
  }

  public double getBottom() {
    return bottom;
  }

  public void setBottom(double bottom) {
    this.bottom = Require.positive("bottom", bottom);
  }

  public double getLeft() {
    return left;
  }

  public void setLeft(double left) {
    this.left = Require.positive("left", left);
  }

  public double getRight() {
    return right;
  }

  public void setRight(double right) {
    this.right = Require.positive("right", right);
  }

}
