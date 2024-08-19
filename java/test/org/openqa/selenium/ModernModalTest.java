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
import static org.openqa.selenium.support.ui.ExpectedConditions.visibilityOf;

import org.junit.jupiter.api.Test;
import org.openqa.selenium.testing.JupiterTestBase;

class ModernModalTest extends JupiterTestBase {

  @Test
  void testButtonOpensModal() {
    driver.get(pages.modernModalPage);
    driver.findElement(By.id("trigger-modal-btn")).click();

    WebElement modal = driver.findElement(By.id("modalContent"));
    wait.until(visibilityOf(modal));
    assertThat(modal.isDisplayed()).isTrue();
  }

  @Test
  void testLinkOpensModal() {
    driver.get(pages.modernModalPage);
    driver.findElement(By.id("trigger-modal-link")).click();

    WebElement modal = driver.findElement(By.id("modalContent"));
    wait.until(visibilityOf(modal));
    assertThat(modal.isDisplayed()).isTrue();
  }

  @Test
  void testCloseModal() {
    driver.get(pages.modernModalPage);
    driver.findElement(By.id("trigger-modal-btn")).click();

    WebElement modal = driver.findElement(By.id("modalContent"));
    wait.until(visibilityOf(modal));

    driver.findElement(By.id("modal-close")).click();
    assertThat(modal.isDisplayed()).isFalse();
  }
}
