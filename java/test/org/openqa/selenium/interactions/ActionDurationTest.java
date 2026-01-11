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

package org.openqa.selenium.interactions;

import static java.time.Duration.ofMillis;
import static org.assertj.core.api.Assertions.assertThat;
import static org.openqa.selenium.WaitingConditions.elementToBeInViewport;

import java.time.Duration;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.testing.JupiterTestBase;

@Tag("UnitTests")
class ActionDurationTest extends JupiterTestBase {
  @Test
  void shouldScrollToElementWithCustomDuration() {
    driver.get(
        appServer.whereIs("scrolling_tests/frame_with_nested_scrolling_frame_out_of_view.html"));
    WebElement iframe = driver.findElement(By.tagName("iframe"));

    assertThat(elementToBeInViewport(iframe).apply(driver)).isFalse();

    new Actions(driver, Duration.ofMillis(111)).scrollToElement(iframe).perform();

    wait.until(elementToBeInViewport(iframe));
  }

  @Test
  void shouldScrollFromViewportByGivenAmountWithCustomDuration() {
    driver.get(
        appServer.whereIs("scrolling_tests/frame_with_nested_scrolling_frame_out_of_view.html"));
    WebElement footer = driver.findElement(By.tagName("footer"));
    int deltaY = footer.getRect().y;

    new Actions(driver, Duration.ofMillis(111)).scrollByAmount(0, deltaY).perform();

    wait.until(elementToBeInViewport(footer));
  }

  @Test
  void shouldBeDefaultActionDuration250ms() {
    Actions actions = new Actions(driver);
    assertThat(actions.getActionDuration()).isEqualTo(ofMillis(250));
  }

  @Test
  void shouldBeCustomDuration110ms() {
    Actions actions = new Actions(driver, Duration.ofMillis(110));
    assertThat(actions.getActionDuration()).isEqualTo(ofMillis(110));
  }
}
