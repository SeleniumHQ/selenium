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

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.openqa.selenium.WaitingConditions.elementToBeInViewport;
import static org.openqa.selenium.testing.drivers.Browser.FIREFOX;

import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.testing.JupiterTestBase;
import org.openqa.selenium.testing.NotYetImplemented;

/** Tests operations that involve scroll wheel. */
class DefaultWheelTest extends JupiterTestBase {

  private Actions getBuilder(WebDriver driver) {
    return new Actions(driver);
  }

  @Test
  @NotYetImplemented(FIREFOX)
  void shouldScrollToElement() {
    driver.get(
        appServer.whereIs("scrolling_tests/frame_with_nested_scrolling_frame_out_of_view.html"));
    WebElement iframe = driver.findElement(By.tagName("iframe"));

    assertThat(elementToBeInViewport(iframe).apply(driver)).isFalse();

    getBuilder(driver).scrollToElement(iframe).perform();

    wait.until(elementToBeInViewport(iframe));
  }

  @Test
  @NotYetImplemented(FIREFOX)
  void shouldScrollFromElementByGivenAmount() {
    driver.get(
        appServer.whereIs("scrolling_tests/frame_with_nested_scrolling_frame_out_of_view.html"));
    WebElement iframe = driver.findElement(By.tagName("iframe"));
    WheelInput.ScrollOrigin scrollOrigin = WheelInput.ScrollOrigin.fromElement(iframe);

    getBuilder(driver).scrollFromOrigin(scrollOrigin, 0, 200).perform();

    driver.switchTo().frame(iframe);
    WebElement checkbox = driver.findElement(By.name("scroll_checkbox"));
    wait.until(elementToBeInViewport(checkbox));
  }

  @Test
  @NotYetImplemented(FIREFOX)
  void shouldScrollFromElementByGivenAmountWithOffset() {
    driver.get(
        appServer.whereIs("scrolling_tests/frame_with_nested_scrolling_frame_out_of_view.html"));
    WebElement footer = driver.findElement(By.tagName("footer"));
    WheelInput.ScrollOrigin scrollOrigin = WheelInput.ScrollOrigin.fromElement(footer, 0, -50);

    getBuilder(driver).scrollFromOrigin(scrollOrigin, 0, 200).perform();

    WebElement iframe = driver.findElement(By.tagName("iframe"));
    driver.switchTo().frame(iframe);
    WebElement checkbox = driver.findElement(By.name("scroll_checkbox"));
    wait.until(elementToBeInViewport(checkbox));
  }

  @Test
  void throwErrorWhenElementOriginIsOutOfViewport() {
    assertThatThrownBy(
            () -> {
              driver.get(
                  appServer.whereIs(
                      "scrolling_tests/frame_with_nested_scrolling_frame_out_of_view.html"));
              WebElement footer = driver.findElement(By.tagName("footer"));
              WheelInput.ScrollOrigin scrollOrigin =
                  WheelInput.ScrollOrigin.fromElement(footer, 0, 50);

              getBuilder(driver).scrollFromOrigin(scrollOrigin, 0, 200).perform();
            })
        .isInstanceOf(MoveTargetOutOfBoundsException.class)
        .hasMessageContaining("out of bounds");
  }

  @Test
  void shouldScrollFromViewportByGivenAmount() {
    driver.get(
        appServer.whereIs("scrolling_tests/frame_with_nested_scrolling_frame_out_of_view.html"));
    WebElement footer = driver.findElement(By.tagName("footer"));
    int deltaY = footer.getRect().y;

    getBuilder(driver).scrollByAmount(0, deltaY).perform();

    wait.until(elementToBeInViewport(footer));
  }

  @Test
  void shouldScrollFromViewportByGivenAmountFromOrigin() {
    driver.get(appServer.whereIs("scrolling_tests/frame_with_nested_scrolling_frame.html"));
    WheelInput.ScrollOrigin scrollOrigin = WheelInput.ScrollOrigin.fromViewport(10, 10);

    getBuilder(driver).scrollFromOrigin(scrollOrigin, 0, 200).perform();

    WebElement iframe = driver.findElement(By.tagName("iframe"));
    driver.switchTo().frame(iframe);
    WebElement checkbox = driver.findElement(By.name("scroll_checkbox"));
    wait.until(elementToBeInViewport(checkbox));
  }

  @Test
  void throwErrorWhenOriginOffsetIsOutOfViewport() {
    assertThatThrownBy(
            () -> {
              driver.get(
                  appServer.whereIs("scrolling_tests/frame_with_nested_scrolling_frame.html"));
              WheelInput.ScrollOrigin scrollOrigin = WheelInput.ScrollOrigin.fromViewport(-10, -10);

              getBuilder(driver).scrollFromOrigin(scrollOrigin, 0, 200).perform();
            })
        .isInstanceOf(MoveTargetOutOfBoundsException.class)
        .hasMessageContaining("out of bounds");
  }
}
