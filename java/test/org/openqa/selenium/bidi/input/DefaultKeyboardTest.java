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
import static org.junit.jupiter.api.Assumptions.assumeFalse;
import static org.openqa.selenium.testing.TestUtilities.getEffectivePlatform;
import static org.openqa.selenium.testing.drivers.Browser.CHROME;
import static org.openqa.selenium.testing.drivers.Browser.EDGE;
import static org.openqa.selenium.testing.drivers.Browser.IE;
import static org.openqa.selenium.testing.drivers.Browser.SAFARI;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.Platform;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.bidi.module.Input;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.Color;
import org.openqa.selenium.support.Colors;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JupiterTestBase;
import org.openqa.selenium.testing.NotYetImplemented;

/** Tests interaction through the advanced gestures API of keyboard handling. */
class DefaultKeyboardTest extends JupiterTestBase {

  private Input inputModule;

  private String windowHandle;

  @BeforeEach
  public void setUp() {
    windowHandle = driver.getWindowHandle();
    inputModule = new Input(driver);
  }

  private Actions getBuilder(WebDriver driver) {
    return new Actions(driver);
  }

  @Test
  void testBasicKeyboardInput() {
    driver.get(appServer.whereIs("single_text_input.html"));

    WebElement input = driver.findElement(By.id("textInput"));

    Actions sendLowercase = getBuilder(driver).sendKeys(input, "abc def");

    inputModule.perform(windowHandle, sendLowercase.getSequences());

    shortWait.until(ExpectedConditions.attributeToBe(input, "value", "abc def"));
  }

  @Test
  @NotYetImplemented(SAFARI)
  public void testSendingKeyDownOnly() {
    driver.get(appServer.whereIs("key_logger.html"));

    WebElement keysEventInput = driver.findElement(By.id("theworks"));

    Actions pressShift = getBuilder(driver).keyDown(keysEventInput, Keys.SHIFT);

    inputModule.perform(windowHandle, pressShift.getSequences());

    WebElement keyLoggingElement = driver.findElement(By.id("result"));
    String logText = keyLoggingElement.getText();

    inputModule.perform(
        windowHandle, getBuilder(driver).keyUp(keysEventInput, Keys.SHIFT).getSequences());

    assertThat(logText).describedAs("Key down event should be isolated").endsWith("keydown");
  }

  @Test
  @NotYetImplemented(SAFARI)
  public void testSendingKeyUp() {
    driver.get(appServer.whereIs("key_logger.html"));

    WebElement keysEventInput = driver.findElement(By.id("theworks"));

    inputModule.perform(
        windowHandle, getBuilder(driver).keyDown(keysEventInput, Keys.SHIFT).getSequences());

    WebElement keyLoggingElement = driver.findElement(By.id("result"));

    String eventsText = keyLoggingElement.getText();
    assertThat(eventsText)
        .describedAs("Key down should be isolated for this test to be meaningful")
        .endsWith("keydown");

    inputModule.perform(
        windowHandle, getBuilder(driver).keyUp(keysEventInput, Keys.SHIFT).getSequences());

    eventsText = keyLoggingElement.getText();
    assertThat(eventsText)
        .describedAs("Key up should be isolated for this test to be meaningful")
        .endsWith("keyup");
  }

  @Test
  @NotYetImplemented(SAFARI)
  public void testSendingKeysWithShiftPressed() {
    driver.get(pages.javascriptPage);

    WebElement keysEventInput = driver.findElement(By.id("theworks"));

    keysEventInput.click();

    String existingResult = getFormEvents();

    inputModule.perform(
        windowHandle, getBuilder(driver).keyDown(keysEventInput, Keys.SHIFT).getSequences());

    inputModule.perform(
        windowHandle, getBuilder(driver).sendKeys(keysEventInput, "ab").getSequences());

    inputModule.perform(
        windowHandle, getBuilder(driver).keyUp(keysEventInput, Keys.SHIFT).getSequences());

    String expectedEvents = " keydown keydown keypress keyup keydown keypress keyup keyup";
    assertThatFormEventsFiredAreExactly("Shift key not held", existingResult + expectedEvents);

    assertThat(keysEventInput.getAttribute("value")).isEqualTo("AB");
  }

  @Test
  @NotYetImplemented(value = SAFARI, reason = "getText does not normalize spaces")
  public void testSendingKeysToActiveElement() {
    driver.get(pages.bodyTypingPage);

    inputModule.perform(windowHandle, getBuilder(driver).sendKeys("ab").getSequences());

    assertThatBodyEventsFiredAreExactly("keypress keypress");
    assertThatFormEventsFiredAreExactly("");
  }

  @Test
  @NotYetImplemented(SAFARI)
  public void testBasicKeyboardInputOnActiveElement() {
    driver.get(pages.javascriptPage);

    WebElement keyReporter = driver.findElement(By.id("keyReporter"));

    keyReporter.click();

    inputModule.perform(windowHandle, getBuilder(driver).sendKeys("abc def").getSequences());

    shortWait.until(ExpectedConditions.attributeToBe(keyReporter, "value", "abc def"));
  }

  @Test
  void canGenerateKeyboardShortcuts() {
    driver.get(appServer.whereIs("keyboard_shortcut.html"));

    WebElement body = driver.findElement(By.xpath("//body"));
    assertBackgroundColor(body, Colors.WHITE);

    inputModule.perform(
        windowHandle,
        new Actions(driver).keyDown(Keys.SHIFT).sendKeys("1").keyUp(Keys.SHIFT).getSequences());
    assertBackgroundColor(body, Colors.GREEN);

    inputModule.perform(
        windowHandle,
        new Actions(driver).keyDown(Keys.ALT).sendKeys("1").keyUp(Keys.ALT).getSequences());
    assertBackgroundColor(body, Colors.LIGHTBLUE);

    inputModule.perform(
        windowHandle,
        new Actions(driver)
            .keyDown(Keys.SHIFT)
            .keyDown(Keys.ALT)
            .sendKeys("1")
            .keyUp(Keys.SHIFT)
            .keyUp(Keys.ALT)
            .getSequences());
    assertBackgroundColor(body, Colors.SILVER);
  }

  @Test
  public void testSelectionSelectBySymbol() throws InterruptedException {
    driver.get(appServer.whereIs("single_text_input.html"));

    WebElement input = driver.findElement(By.id("textInput"));

    inputModule.perform(
        windowHandle, getBuilder(driver).click(input).sendKeys("abc def").getSequences());

    // TODO: The wait until condition does not wait for the attribute.
    // Hence this is required.
    // Not an ideal fix but it needs to be triaged further.
    Thread.sleep(5000);

    shortWait.until(ExpectedConditions.attributeToBe(input, "value", "abc def"));

    inputModule.perform(
        windowHandle,
        getBuilder(driver)
            .click(input)
            .keyDown(Keys.SHIFT)
            .sendKeys(Keys.LEFT)
            .sendKeys(Keys.LEFT)
            .keyUp(Keys.SHIFT)
            .sendKeys(Keys.DELETE)
            .getSequences());

    assertThat(input.getAttribute("value")).isEqualTo("abc d");
  }

  @Test
  @Ignore(IE)
  @NotYetImplemented(
      value = CHROME,
      reason = "https://github.com/GoogleChromeLabs/chromium-bidi/issues/2321")
  @NotYetImplemented(
      value = EDGE,
      reason = "https://github.com/GoogleChromeLabs/chromium-bidi/issues/2321")
  public void testSelectionSelectByWord() {
    assumeFalse(getEffectivePlatform(driver).is(Platform.MAC), "MacOS has alternative keyboard");

    driver.get(appServer.whereIs("single_text_input.html"));

    WebElement input = driver.findElement(By.id("textInput"));

    inputModule.perform(
        windowHandle, getBuilder(driver).click(input).sendKeys("abc def").getSequences());
    wait.until(ExpectedConditions.attributeToBe(input, "value", "abc def"));

    inputModule.perform(
        windowHandle,
        getBuilder(driver)
            .click(input)
            .keyDown(Keys.SHIFT)
            .keyDown(Keys.CONTROL)
            .sendKeys(Keys.LEFT)
            .keyUp(Keys.CONTROL)
            .keyUp(Keys.SHIFT)
            .sendKeys(Keys.DELETE)
            .getSequences());

    wait.until(ExpectedConditions.attributeToBe(input, "value", "abc "));
  }

  @Test
  void testSelectionSelectAll() {
    assumeFalse(getEffectivePlatform(driver).is(Platform.MAC), "MacOS has alternative keyboard");

    driver.get(appServer.whereIs("single_text_input.html"));

    WebElement input = driver.findElement(By.id("textInput"));

    inputModule.perform(
        windowHandle, getBuilder(driver).click(input).sendKeys("abc def").getSequences());

    shortWait.until(ExpectedConditions.attributeToBe(input, "value", "abc def"));

    inputModule.perform(
        windowHandle,
        getBuilder(driver)
            .click(input)
            .keyDown(Keys.CONTROL)
            .sendKeys("a")
            .keyUp(Keys.CONTROL)
            .sendKeys(Keys.DELETE)
            .getSequences());

    assertThat(input.getAttribute("value")).isEmpty();
  }

  private void assertBackgroundColor(WebElement el, Colors expected) {
    Color actual = Color.fromString(el.getCssValue("background-color"));
    assertThat(actual).isEqualTo(expected.getColorValue());
  }

  private void assertThatFormEventsFiredAreExactly(String message, String expected) {
    assertThat(getFormEvents()).describedAs(message).isEqualTo(expected.trim());
  }

  private String getFormEvents() {
    return driver.findElement(By.id("result")).getText().trim();
  }

  private void assertThatFormEventsFiredAreExactly(String expected) {
    assertThatFormEventsFiredAreExactly("", expected);
  }

  private void assertThatBodyEventsFiredAreExactly(String expected) {
    assertThat(driver.findElement(By.id("body_result")).getText().trim())
        .isEqualTo(expected.trim());
  }
}
