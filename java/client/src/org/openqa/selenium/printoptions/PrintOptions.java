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


import org.openqa.selenium.internal.Require;
import org.openqa.selenium.printoptions.print.PageMargin;
import org.openqa.selenium.printoptions.print.PageSize;

public class PrintOptions {

  public enum Orientation {
    Portrait,
    Landscape
  }
  private Orientation orientation = Orientation.Portrait;
  private double scale = 1.0;
  private boolean background = false;
  private boolean shrinkToFit = true;
  private org.openqa.selenium.printoptions.print.PageSize pageSize = new org.openqa.selenium.printoptions.print.PageSize();
  private org.openqa.selenium.printoptions.print.PageMargin pageMargin = new org.openqa.selenium.printoptions.print.PageMargin();
  private String[] pageRanges;

  public Orientation getOrientation() {
    return this.orientation;
  }

  public void setOrientation(Orientation orientation) {
    this.orientation = Require.nonNull("orientation", orientation);
  }

  public String[] getPageRanges() {
    return this.pageRanges;
  }

  public void setPageRanges(String[] ranges) {
    this.pageRanges = ranges;
  }

  public boolean getBackground() {
    return this.background;
  }

  public void setBackground(boolean background) {
    this.background = Require.nonNull("background", background);
  }

  public double getScale() {
    return this.scale;
  }

  public void setScale(double scale) {
    Require.nonNull("scale", scale);

    if (scale < 0.1 || scale > 2) {
      throw new IllegalArgumentException("Scale value should be between 0.1 and 2");
    }

    this.scale = scale;
  }

  public boolean getShrinkToFit() {
    return this.shrinkToFit;
  }

  public void setShrinkToFit(boolean value) {
    this.shrinkToFit = Require.nonNull("value", value);
  }

  public PageSize getPageSize() {
    return this.pageSize;
  }

  public void setPageSize(PageSize pageSize) {
    this.pageSize = Require.nonNull("pageSize", pageSize);
  }

  public PageMargin getPageMargin() {
    return this.pageMargin;
  }

  public void setPageMargin(PageMargin margin) {
    this.pageMargin = Require.nonNull("margin", margin);
  }
}
