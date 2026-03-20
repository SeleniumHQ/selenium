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
class PageSizeTest {

  @Test
  void setsDefaultHeightWidth() {
    PageSize pageSize = new PageSize();
    assertThat(pageSize.getHeight()).isEqualTo(29.7);
    assertThat(pageSize.getWidth()).isEqualTo(21.0);
  }

  @Test
  void verifiesPageSizeA4() {
    assertThat(PageSize.ISO_A4.getHeight()).isEqualTo(29.7);
    assertThat(PageSize.ISO_A4.getWidth()).isEqualTo(21.0);
  }

  @Test
  void verifiesPageSizeLegal() {
    assertThat(PageSize.US_LEGAL.getHeight()).isEqualTo(35.56);
    assertThat(PageSize.US_LEGAL.getWidth()).isEqualTo(21.59);
  }

  @Test
  void verifiesPageSizeLetter() {
    assertThat(PageSize.US_LETTER.getHeight()).isEqualTo(27.94);
    assertThat(PageSize.US_LETTER.getWidth()).isEqualTo(21.59);
  }

  @Test
  void verifiesPageSizeTabloid() {
    assertThat(PageSize.ANSI_TABLOID.getHeight()).isEqualTo(43.18);
    assertThat(PageSize.ANSI_TABLOID.getWidth()).isEqualTo(27.94);
  }
}
