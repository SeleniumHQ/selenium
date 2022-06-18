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

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.testing.JupiterTestBase;

/**
 * Tests operations that involve scroll wheel.
 */
public class DefaultWheelTest extends JupiterTestBase {

  private Actions getBuilder(WebDriver driver) {
    return new Actions(driver);
  }

  @Test
  public void shouldScrollToElement() {
    driver.get(appServer.whereIs("scrolling_tests/frame_with_nested_scrolling_frame_out_of_view.html"));
    WebElement iframe = driver.findElement(By.tagName("iframe"));

    assertFalse(inViewport(iframe));

    getBuilder(driver).scrollToElement(iframe).perform();

    assertTrue(inViewport(iframe));
  }

  @Test
  public void shouldScrollFromElementByGivenAmount() {
    driver.get(appServer.whereIs("scrolling_tests/frame_with_nested_scrolling_frame_out_of_view.html"));
    WebElement iframe = driver.findElement(By.tagName("iframe"));
    WheelInput.ScrollOrigin scrollOrigin = WheelInput.ScrollOrigin.fromElement(iframe);

    getBuilder(driver).scrollFromOrigin(scrollOrigin, 0, 200).perform();

    driver.switchTo().frame(iframe);
    WebElement checkbox = driver.findElement(By.name("scroll_checkbox"));
    assertTrue(inViewport(checkbox));
  }

  @Test
  public void shouldScrollFromElementByGivenAmountWithOffset() {
    driver.get(appServer.whereIs("scrolling_tests/frame_with_nested_scrolling_frame_out_of_view.html"));
    WebElement footer = driver.findElement(By.tagName("footer"));
    WheelInput.ScrollOrigin scrollOrigin = WheelInput.ScrollOrigin.fromElement(footer, 0, -50);

    getBuilder(driver).scrollFromOrigin(scrollOrigin,0, 200).perform();

    WebElement iframe = driver.findElement(By.tagName("iframe"));
    driver.switchTo().frame(iframe);
    WebElement checkbox = driver.findElement(By.name("scroll_checkbox"));
    assertTrue(inViewport(checkbox));
  }

  @Test
  public void throwErrorWhenElementOriginIsOutOfViewport() {
    assertThrows(MoveTargetOutOfBoundsException.class, () -> {
      driver.get(appServer.whereIs("scrolling_tests/frame_with_nested_scrolling_frame_out_of_view.html"));
      WebElement footer = driver.findElement(By.tagName("footer"));
      WheelInput.ScrollOrigin scrollOrigin = WheelInput.ScrollOrigin.fromElement(footer, 0, 50);

      getBuilder(driver).scrollFromOrigin(scrollOrigin, 0, 200).perform();
    });
  }

  @Test
  public void shouldScrollFromViewportByGivenAmount() {
    driver.get(appServer.whereIs("scrolling_tests/frame_with_nested_scrolling_frame_out_of_view.html"));
    WebElement footer = driver.findElement(By.tagName("footer"));
    int deltaY = footer.getRect().y;

    getBuilder(driver).scrollByAmount(0, deltaY).perform();

    assertTrue(inViewport(footer));
  }

  @Test
  public void shouldScrollFromViewportByGivenAmountFromOrigin() {
    driver.get(appServer.whereIs("scrolling_tests/frame_with_nested_scrolling_frame.html"));
    WheelInput.ScrollOrigin scrollOrigin = WheelInput.ScrollOrigin.fromViewport(10, 10);

    getBuilder(driver).scrollFromOrigin(scrollOrigin, 0, 200).perform();

    WebElement iframe = driver.findElement(By.tagName("iframe"));
    driver.switchTo().frame(iframe);
    WebElement checkbox = driver.findElement(By.name("scroll_checkbox"));
    assertTrue(inViewport(checkbox));
  }

  @Test
  public void throwErrorWhenOriginOffsetIsOutOfViewport() {
    assertThrows(MoveTargetOutOfBoundsException.class, () -> {
      driver.get(appServer.whereIs("scrolling_tests/frame_with_nested_scrolling_frame.html"));
      WheelInput.ScrollOrigin scrollOrigin = WheelInput.ScrollOrigin.fromViewport(-10, -10);

      getBuilder(driver).scrollFromOrigin(scrollOrigin, 0, 200).perform();
    });
  }

  private boolean inViewport(WebElement element) {

    String script =
      "for(var e=arguments[0],f=e.offsetTop,t=e.offsetLeft,o=e.offsetWidth,n=e.offsetHeight;\n"
      + "e.offsetParent;)f+=(e=e.offsetParent).offsetTop,t+=e.offsetLeft;\n"
      + "return f<window.pageYOffset+window.innerHeight&&t<window.pageXOffset+window.innerWidth&&f+n>\n"
      + "window.pageYOffset&&t+o>window.pageXOffset";

    return (boolean) ((JavascriptExecutor) driver).executeScript(script, element);
  }
}
