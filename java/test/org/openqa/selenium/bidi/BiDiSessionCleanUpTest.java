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

package org.openqa.selenium.bidi;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.assertj.core.api.Assumptions.assumeThat;

import org.junit.jupiter.api.Test;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.WindowType;
import org.openqa.selenium.testing.JupiterTestBase;
import org.openqa.selenium.testing.NoDriverBeforeTest;
import org.openqa.selenium.testing.drivers.WebDriverBuilder;

final class BiDiSessionCleanUpTest extends JupiterTestBase {

  @Test
  @NoDriverBeforeTest
  void shouldNotCloseBiDiSessionIfOneWindowIsClosed() {
    localDriver = new WebDriverBuilder().get();
    assumeThat(localDriver).isInstanceOf(HasBiDi.class);
    BiDi biDi = ((HasBiDi) localDriver).getBiDi();

    BiDiSessionStatus status = biDi.getBidiSessionStatus();
    assertThat(status).isNotNull();
    assertThat(status.isReady()).isFalse();
    assertThat(status.getMessage()).containsPattern("(?i)already (connected|started)");

    localDriver.switchTo().newWindow(WindowType.WINDOW);
    localDriver.switchTo().newWindow(WindowType.TAB);
    localDriver.switchTo().newWindow(WindowType.TAB);

    localDriver.close();

    BiDiSessionStatus statusAfterClosing = biDi.getBidiSessionStatus();
    assertThat(statusAfterClosing).isNotNull();
    assertThat(statusAfterClosing.isReady()).isFalse();
    assertThat(statusAfterClosing.getMessage()).containsPattern("(?i)already (connected|started)");
  }

  @Test
  @NoDriverBeforeTest
  void shouldCloseBiDiSessionIfLastWindowIsClosed() {
    localDriver = new WebDriverBuilder().get();
    assumeThat(localDriver).isInstanceOf(HasBiDi.class);
    BiDi biDi = ((HasBiDi) localDriver).getBiDi();

    BiDiSessionStatus status = biDi.getBidiSessionStatus();
    assertThat(status).isNotNull();
    assertThat(status.isReady()).isFalse();
    assertThat(status.getMessage()).containsPattern("(?i)already (connected|started)");

    localDriver.close();

    // Closing the last top-level browsing context, closes the WebDriver and BiDi session
    assertThatExceptionOfType(WebDriverException.class)
        .isThrownBy(() -> biDi.getBidiSessionStatus());
  }
}
