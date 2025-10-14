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

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

@Tag("UnitTests")
class PageSizeTest {

  private PrintOptions printOptions;

  @BeforeEach
  void setUp() {
    printOptions = new PrintOptions();
  }

  @Test
  void setsDefaultHeightWidth() {
    PageSize pageSize = new PageSize();
    assertThat(pageSize.getHeight()).isEqualTo(29.7);
    assertThat(pageSize.getWidth()).isEqualTo(21.0);
  }

  @Test
  void verifiesPageSizeA4() {

    printOptions.setPageSize(PageSize.ISO_A4);
    assertThat(printOptions.getPageSize().getHeight()).isEqualTo(29.7);
    assertThat(printOptions.getPageSize().getWidth()).isEqualTo(21.0);
  }

  @Test
  void verifiesPageSizeLegal() {
    printOptions.setPageSize(PageSize.US_LEGAL);
    assertThat(printOptions.getPageSize().getHeight()).isEqualTo(35.56);
    assertThat(printOptions.getPageSize().getWidth()).isEqualTo(21.59);
  }

  @Test
  void verifiesPageSizeLetter() {
    printOptions.setPageSize(PageSize.US_LETTER);
    assertThat(printOptions.getPageSize().getHeight()).isEqualTo(27.94);
    assertThat(printOptions.getPageSize().getWidth()).isEqualTo(21.59);
  }

  @Test
  void verifiesPageSizeTabloid() {
    printOptions.setPageSize(PageSize.ANSI_TABLOID);
    assertThat(printOptions.getPageSize().getHeight()).isEqualTo(43.18);
    assertThat(printOptions.getPageSize().getWidth()).isEqualTo(27.94);
  }
}
