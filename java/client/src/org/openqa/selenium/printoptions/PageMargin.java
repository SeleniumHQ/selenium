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

package org.openqa.selenium.printoptions;

import java.util.HashMap;
import java.util.Map;

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
    return this.top;
  }

  public double getBottom() {
    return this.bottom;
  }

  public double getLeft() {
    return this.left;
  }

  public double getRight() {
    return this.right;
  }

  public void setTop(double top) {
    if (top < 0) {
      throw new IllegalArgumentException("Top margin value should be > 0");
    }

    this.top = top;
  }

  public void setBottom(double bottom) {
    if (bottom < 0) {
      throw new IllegalArgumentException("Bottom margin value should be > 0");
    }

    this.bottom = bottom;
  }

  public void setRight(double right) {
    if (right < 0) {
      throw new IllegalArgumentException("Right margin value should be > 0");
    }

    this.right = right;
  }

  public void setLeft(double left) {
    if (left < 0) {
      throw new IllegalArgumentException("Left margin value should be > 0");
    }

    this.left = left;
  }

  public Map<String, Double> to_json() {
    Map<String, Double> marginParams = new HashMap<>();

    marginParams.put("top", this.top);
    marginParams.put("bottom", this.bottom);
    marginParams.put("left", this.left);
    marginParams.put("right", this.right);

    return marginParams;
  }
}
