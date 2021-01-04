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

import org.junit.Test;
import org.junit.experimental.categories.Category;
import static org.assertj.core.api.Assertions.assertThat;
import org.openqa.selenium.testing.UnitTests;

import java.util.Map;

@Category(UnitTests.class)
public class PageMarginTest {

  // Defaults assertion
  private static double TOP = 1.0;
  private static double BOTTOM = 1.0;
  private static double LEFT = 1.0;
  private static double RIGHT = 1.0;

  @Test
  public void setsDefaultMarginValues() {
    PageMargin pageMargin = new PageMargin();

    assertThat(pageMargin.getTop()).isEqualTo(TOP);
    assertThat(pageMargin.getBottom()).isEqualTo(BOTTOM);
    assertThat(pageMargin.getLeft()).isEqualTo(LEFT);
    assertThat(pageMargin.getRight()).isEqualTo(RIGHT);
  }

  @Test
  public void returnsMapOfPageMargin() {
    PageMargin pageMargin = new PageMargin();
    pageMargin.setBottom(2.0);
    pageMargin.setTop(3.0);
    pageMargin.setLeft(1.0);
    pageMargin.setRight(2.0);

    Map<String, Double> pageMarginMap = pageMargin.to_json();

    assertThat(pageMarginMap.get("bottom")).isEqualTo(2.0);
    assertThat(pageMarginMap.get("top")).isEqualTo(3.0);
    assertThat(pageMarginMap.get("left")).isEqualTo(1.0);
    assertThat(pageMarginMap.get("right")).isEqualTo(2.0);
  }
}
