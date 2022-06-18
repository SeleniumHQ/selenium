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
import static org.junit.jupiter.api.Assumptions.assumeTrue;
import static org.openqa.selenium.ScreenOrientation.LANDSCAPE;
import static org.openqa.selenium.ScreenOrientation.PORTRAIT;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.testing.JupiterTestBase;

public class RotatableTest extends JupiterTestBase {

  private Rotatable rotatable;

  @BeforeEach
  public void setUp() {
    assumeTrue(driver instanceof Rotatable);
    rotatable = (Rotatable) driver;
  }

  @Test
  public void testRotateToLandscapeMode() {
    rotatable.rotate(ScreenOrientation.LANDSCAPE);
    assertThat(rotatable.getOrientation()).isEqualTo(LANDSCAPE);
  }

  @Test
  public void testRotateToPortrait() {
    rotatable.rotate(ScreenOrientation.PORTRAIT);
    assertThat(rotatable.getOrientation()).isEqualTo(PORTRAIT);
  }

  @Test
  public void testGetOrientationReturnsInitialValue() {
    assertThat(rotatable.getOrientation()).isNotNull();
  }

}
