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

package org.openqa.selenium.bidi.input;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.openqa.selenium.WaitingConditions.elementToBeInViewport;
import static org.openqa.selenium.testing.drivers.Browser.CHROME;
import static org.openqa.selenium.testing.drivers.Browser.EDGE;
import static org.openqa.selenium.testing.drivers.Browser.FIREFOX;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.bidi.BiDiException;
import org.openqa.selenium.bidi.module.Input;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.interactions.WheelInput;
import org.openqa.selenium.testing.JupiterTestBase;
import org.openqa.selenium.testing.NeedsFreshDriver;
import org.openqa.selenium.testing.NotYetImplemented;

/** Tests operations that involve scroll wheel. */
class DefaultWheelTest extends JupiterTestBase {

  private Input input;

  private String windowHandle;

  @BeforeEach
  public void setUp() {
    windowHandle = driver.getWindowHandle();
    input = new Input(driver);
  }

  private Actions getBuilder(WebDriver driver) {
    return new Actions(driver);
  }

  @Test
  @NotYetImplemented(EDGE)
  @NotYetImplemented(CHROME)
  @NotYetImplemented(FIREFOX)
  // ToDo: Identify how to get frame's context id
  void shouldScrollToElement() {
    driver.get(
        appServer.whereIs("scrolling_tests/frame_with_nested_scrolling_frame_out_of_view.html"));
    WebElement iframe = driver.findElement(By.tagName("iframe"));

    assertThat(elementToBeInViewport(iframe).apply(driver)).isFalse();

    input.perform("iframe", getBuilder(driver).scrollToElement(iframe).getSequences());

    wait.until(elementToBeInViewport(iframe));
  }

  @Test
  @NotYetImplemented(EDGE)
  @NotYetImplemented(CHROME)
  @NotYetImplemented(FIREFOX)
  // ToDo: Identify how to get frame's context id
  void shouldScrollFromElementByGivenAmount() {
    driver.get(
        appServer.whereIs("scrolling_tests/frame_with_nested_scrolling_frame_out_of_view.html"));
    WebElement iframe = driver.findElement(By.tagName("iframe"));
    WheelInput.ScrollOrigin scrollOrigin = WheelInput.ScrollOrigin.fromElement(iframe);

    input.perform(
        windowHandle, getBuilder(driver).scrollFromOrigin(scrollOrigin, 0, 200).getSequences());

    driver.switchTo().frame(iframe);
    WebElement checkbox = driver.findElement(By.name("scroll_checkbox"));
    wait.until(elementToBeInViewport(checkbox));
    driver.switchTo().window(windowHandle);
  }

  @Test
  @NotYetImplemented(EDGE)
  @NotYetImplemented(CHROME)
  @NotYetImplemented(FIREFOX)
  void shouldScrollFromElementByGivenAmountWithOffset() {
    driver.get(
        appServer.whereIs("scrolling_tests/frame_with_nested_scrolling_frame_out_of_view.html"));
    WebElement footer = driver.findElement(By.tagName("footer"));
    WheelInput.ScrollOrigin scrollOrigin = WheelInput.ScrollOrigin.fromElement(footer, 0, -50);

    input.perform(
        windowHandle, getBuilder(driver).scrollFromOrigin(scrollOrigin, 0, 200).getSequences());

    WebElement iframe = driver.findElement(By.tagName("iframe"));
    driver.switchTo().frame(iframe);
    WebElement checkbox = driver.findElement(By.name("scroll_checkbox"));
    wait.until(elementToBeInViewport(checkbox));
  }

  @Test
  @NotYetImplemented(EDGE)
  @NotYetImplemented(CHROME)
  void throwErrorWhenElementOriginIsOutOfViewport() {
    assertThatThrownBy(
            () -> {
              driver.get(
                  appServer.whereIs(
                      "scrolling_tests/frame_with_nested_scrolling_frame_out_of_view.html"));
              WebElement footer = driver.findElement(By.tagName("footer"));
              WheelInput.ScrollOrigin scrollOrigin =
                  WheelInput.ScrollOrigin.fromElement(footer, 0, 50);

              input.perform(
                  windowHandle,
                  getBuilder(driver).scrollFromOrigin(scrollOrigin, 0, 200).getSequences());
            })
        .isInstanceOf(BiDiException.class)
        .hasMessageContaining("move target out of bounds");
  }

  @NeedsFreshDriver
  @Test
  void shouldScrollFromViewportByGivenAmount() {
    driver.get(
        appServer.whereIs("scrolling_tests/frame_with_nested_scrolling_frame_out_of_view.html"));
    WebElement footer = driver.findElement(By.tagName("footer"));
    int deltaY = footer.getRect().y;

    input.perform(
        windowHandle,
        new Actions(driver)
            .setActiveWheel("huh")
            .scrollByAmount(0, deltaY)
            .pause(3000)
            .getSequences());

    wait.until(driver -> driver.findElement(By.name("nested_scrolling_frame")).isDisplayed());

    wait.until(elementToBeInViewport(footer));
  }

  @NeedsFreshDriver
  @Test
  void shouldScrollFromViewportByGivenAmountFromOrigin() {
    driver.get(appServer.whereIs("scrolling_tests/frame_with_nested_scrolling_frame.html"));
    WheelInput.ScrollOrigin scrollOrigin = WheelInput.ScrollOrigin.fromViewport(10, 10);

    input.perform(
        windowHandle,
        new Actions(driver)
            .setActiveWheel("blsh")
            .scrollFromOrigin(scrollOrigin, 0, 200)
            .pause(3000)
            .getSequences());

    WebElement iframe = driver.findElement(By.tagName("iframe"));
    driver.switchTo().frame(iframe);
    WebElement checkbox = driver.findElement(By.name("scroll_checkbox"));
    wait.until(elementToBeInViewport(checkbox));
    driver.switchTo().window(windowHandle);
  }

  @Test
  void throwErrorWhenOriginOffsetIsOutOfViewport() {
    assertThatThrownBy(
            () -> {
              driver.get(
                  appServer.whereIs("scrolling_tests/frame_with_nested_scrolling_frame.html"));
              WheelInput.ScrollOrigin scrollOrigin = WheelInput.ScrollOrigin.fromViewport(-10, -10);

              input.perform(
                  windowHandle,
                  getBuilder(driver).scrollFromOrigin(scrollOrigin, 0, 200).getSequences());
            })
        .isInstanceOf(BiDiException.class)
        .hasMessageContaining("move target out of bounds");
  }
}
