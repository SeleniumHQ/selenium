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

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.Test;

/**
 * Test WebDriver's Dimensions class.
 */
public class DimensionTest {
  @Test
  public void testSimpleAssignment() {
    Dimension d1 = new Dimension(100, 200);
    assertThat(d1.getHeight()).isEqualTo(200);
    assertThat(d1.getWidth()).isEqualTo(100);
  }

  @Test
  public void testEquality() {
    Dimension d1 = new Dimension(100, 200);
    Dimension d2 = new Dimension(200, 200);

    assertThat(d1).isNotSameAs(d2);
    // Doesn't have to be different, but known to be different for this case.
    assertThat(d1.hashCode()).isNotEqualTo(d2.hashCode());

    Dimension d1copy = new Dimension(100, 200);

    assertThat(d1copy).isEqualTo(d1);
    assertThat(d1copy.hashCode()).isEqualTo(d1.hashCode());
  }

}
