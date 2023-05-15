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

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

@Tag("UnitTests")
class PageMarginTest {

  // Defaults assertion
  private static final double TOP = 1.0;
  private static final double BOTTOM = 1.0;
  private static final double LEFT = 1.0;
  private static final double RIGHT = 1.0;

  @Test
  void setsDefaultMarginValues() {
    PageMargin pageMargin = new PageMargin();

    assertThat(pageMargin.getTop()).isEqualTo(TOP);
    assertThat(pageMargin.getBottom()).isEqualTo(BOTTOM);
    assertThat(pageMargin.getLeft()).isEqualTo(LEFT);
    assertThat(pageMargin.getRight()).isEqualTo(RIGHT);
  }
}
