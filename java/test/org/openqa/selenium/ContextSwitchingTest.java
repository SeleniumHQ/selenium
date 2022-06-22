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

import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.junit.jupiter.api.Assumptions.assumeTrue;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.testing.JupiterTestBase;

public class ContextSwitchingTest extends JupiterTestBase {

  @BeforeEach
  public void assumeBrowserIsContextAware() {
    assumeTrue(driver.switchTo() instanceof ContextAware, "Driver is not ContextAware");
  }

  @Test
  public void testShouldNotBeAbleToSwitchContext() {
    assertThatExceptionOfType(UnsupportedCommandException.class)
        .isThrownBy(() -> ((ContextAware) driver.switchTo()).context("WEBVIEW"));
  }

  @Test
  public void testShouldNotBeAbleToGetContextHandle() {
    assertThatExceptionOfType(UnsupportedCommandException.class)
        .isThrownBy(() -> ((ContextAware) driver.switchTo()).getContext());
  }

  @Test
  public void testShouldNotBeAbleToGetContextHandles() {
    assertThatExceptionOfType(UnsupportedCommandException.class)
        .isThrownBy(() -> ((ContextAware) driver.switchTo()).getContextHandles());
  }
}
