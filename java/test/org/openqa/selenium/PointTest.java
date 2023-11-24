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

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

/** Tests WebDriver's Point class. */
@Tag("UnitTests")
class PointTest {

  @Test
  void testSimpleAssignment() {
    Point p1 = new Point(30, 50);
    assertThat(p1.getX()).isEqualTo(30);
    assertThat(p1.getY()).isEqualTo(50);
  }

  @Test
  void testEquality() {
    Point p1 = new Point(30, 60);
    Point p2 = new Point(40, 60);

    assertThat(p1).isNotEqualTo(p2);
    // Doesn't have to be different, but known to be different for this case.
    assertThat(p1.hashCode()).isNotEqualTo(p2.hashCode());

    Point p1copy = new Point(30, 60);

    assertThat(p1copy).isEqualTo(p1);
    assertThat(p1copy.hashCode()).isEqualTo(p1.hashCode());
  }

  @Test
  void testMoveBy() {
    Point p1 = new Point(31, 42);

    assertThat(p1.moveBy(4, 5)).isEqualTo(new Point(35, 47));
  }
}
