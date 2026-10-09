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

import org.junit.jupiter.api.MethodOrderer.OrderAnnotation;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.openqa.selenium.testing.CloseExtraWindowsAfterTest;
import org.openqa.selenium.testing.JupiterTestBase;
import org.openqa.selenium.testing.NoDriverAfterTest;
import org.openqa.selenium.testing.SeleniumExtension;

@TestMethodOrder(OrderAnnotation.class)
@CloseExtraWindowsAfterTest
class CloseExtraWindowsTest extends JupiterTestBase {

  private static String windowBeforeOpener;

  @Test
  @Order(1)
  void leavesExtraWindowsOpenForTheAnnotationToClose() {
    windowBeforeOpener = driver.getWindowHandle();
    driver.switchTo().newWindow(WindowType.TAB);
    driver.switchTo().newWindow(WindowType.WINDOW);

    assertThat(driver.getWindowHandles()).hasSize(3);
  }

  @Test
  @Order(2)
  void startsOnTheInitialWindowWithNothingElseOpen() {
    assumeTrue(windowBeforeOpener != null);

    assertThat(driver.getWindowHandles()).containsExactly(windowBeforeOpener);
    assertThat(driver.getWindowHandle()).isEqualTo(windowBeforeOpener);
  }

  @Test
  @Order(3)
  void closesExtraWindowsAndRestoresTheInitialOne() {
    String initial = driver.getWindowHandle();
    driver.switchTo().newWindow(WindowType.TAB);
    driver.switchTo().newWindow(WindowType.WINDOW);

    SeleniumExtension.closeExtraWindows(driver, initial);

    assertThat(driver.getWindowHandles()).containsExactly(initial);
    assertThat(driver.getWindowHandle()).isEqualTo(initial);
  }

  @Test
  @Order(4)
  void restoresTheInitialWindowAfterTheFocusedOneWasClosed() {
    String initial = driver.getWindowHandle();
    driver.switchTo().newWindow(WindowType.TAB);
    driver.close();

    SeleniumExtension.closeExtraWindows(driver, initial);

    assertThat(driver.getWindowHandles()).containsExactly(initial);
    assertThat(driver.getWindowHandle()).isEqualTo(initial);
  }

  @Test
  @Order(5)
  @NoDriverAfterTest
  void keepsTheFirstRemainingWindowWhenTheInitialOneIsGone() {
    String initial = driver.getWindowHandle();
    String replacement = driver.switchTo().newWindow(WindowType.TAB).getWindowHandle();
    driver.switchTo().window(initial).close();

    SeleniumExtension.closeExtraWindows(driver, initial);

    assertThat(driver.getWindowHandles()).containsExactly(replacement);
    assertThat(driver.getWindowHandle()).isEqualTo(replacement);
  }
}
