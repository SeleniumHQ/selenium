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

import java.util.HashMap;
import java.util.Map;
import org.jspecify.annotations.NullMarked;

@NullMarked
public class PageSize {
  private final double height;
  private final double width;

  // Reference for predefined page size constants:
  // https://www.agooddaytoprint.com/page/paper-size-chart-faq
  public static final PageSize ISO_A4 = new PageSize(29.7, 21.0); // ISO_A4 size in cm
  public static final PageSize US_LEGAL = new PageSize(35.56, 21.59); // US_LEGAL size in cm
  public static final PageSize ANSI_TABLOID = new PageSize(43.18, 27.94); // ANSI_TABLOID size in cm
  public static final PageSize US_LETTER = new PageSize(27.94, 21.59); // US_LETTER size in cm

  public PageSize() {
    // Initialize with defaults. ISO_A4 paper size defaults in cms.
    this(ISO_A4.getHeight(), ISO_A4.getWidth());
  }

  public PageSize(double height, double width) {
    this.height = height;
    this.width = width;
  }

  public double getHeight() {
    return height;
  }

  public double getWidth() {
    return width;
  }

  public static PageSize setPageSize(PageSize pageSize) {
    if (pageSize == null) {
      throw new IllegalArgumentException("Page size cannot be null");
    }
    return new PageSize(pageSize.getHeight(), pageSize.getWidth());
  }

  public Map<String, Object> toMap() {
    final Map<String, Object> options = new HashMap<>(7);
    options.put("height", getHeight());
    options.put("width", getWidth());

    return options;
  }

  @Override
  public String toString() {
    return "PageSize[width=" + this.getWidth() + ", height=" + this.getHeight() + "]";
  }
}
