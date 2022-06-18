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

import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.Platform;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.Color;
import org.openqa.selenium.support.Colors;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JupiterTestBase;
import org.openqa.selenium.testing.NotYetImplemented;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.junit.jupiter.api.Assumptions.assumeFalse;
import static org.openqa.selenium.testing.TestUtilities.getEffectivePlatform;
import static org.openqa.selenium.testing.drivers.Browser.FIREFOX;
import static org.openqa.selenium.testing.drivers.Browser.HTMLUNIT;
import static org.openqa.selenium.testing.drivers.Browser.IE;
import static org.openqa.selenium.testing.drivers.Browser.SAFARI;

/**
 * Tests interaction through the advanced gestures API of keyboard handling.
 */
public class DefaultKeyboardTest extends JupiterTestBase {
  private Actions getBuilder(WebDriver driver) {
    return new Actions(driver);
  }

  @Test
  public void testBasicKeyboardInput() {
    driver.get(appServer.whereIs("single_text_input.html"));

    WebElement input = driver.findElement(By.id("textInput"));

    Action sendLowercase = getBuilder(driver).sendKeys(input, "abc def").build();

    sendLowercase.perform();

    shortWait.until(ExpectedConditions.attributeToBe(input, "value", "abc def"));
  }

  @Test
  @NotYetImplemented(SAFARI)
  public void testSendingKeyDownOnly() {
    driver.get(appServer.whereIs("key_logger.html"));

    WebElement keysEventInput = driver.findElement(By.id("theworks"));

    Action pressShift = getBuilder(driver).keyDown(keysEventInput, Keys.SHIFT).build();

    pressShift.perform();

    WebElement keyLoggingElement = driver.findElement(By.id("result"));
    String logText = keyLoggingElement.getText();

    Action releaseShift = getBuilder(driver).keyUp(keysEventInput, Keys.SHIFT).build();
    releaseShift.perform();

    assertThat(logText).describedAs("Key down event should be isolated").endsWith("keydown");
  }

  @Test
  @NotYetImplemented(SAFARI)
  public void testSendingKeyUp() {
    driver.get(appServer.whereIs("key_logger.html"));

    WebElement keysEventInput = driver.findElement(By.id("theworks"));

    Action pressShift = getBuilder(driver).keyDown(keysEventInput, Keys.SHIFT).build();
    pressShift.perform();

    WebElement keyLoggingElement = driver.findElement(By.id("result"));

    String eventsText = keyLoggingElement.getText();
    assertThat(eventsText).describedAs("Key down should be isolated for this test to be meaningful").endsWith("keydown");

    Action releaseShift = getBuilder(driver).keyUp(keysEventInput, Keys.SHIFT).build();

    releaseShift.perform();

    eventsText = keyLoggingElement.getText();
    assertThat(eventsText).describedAs("Key up should be isolated for this test to be meaningful").endsWith("keyup");
  }

  @Test
  @NotYetImplemented(SAFARI)
  public void testSendingKeysWithShiftPressed() {
    driver.get(pages.javascriptPage);

    WebElement keysEventInput = driver.findElement(By.id("theworks"));

    keysEventInput.click();

    String existingResult = getFormEvents();

    Action pressShift = getBuilder(driver).keyDown(keysEventInput, Keys.SHIFT).build();
    pressShift.perform();

    Action sendLowercase = getBuilder(driver).sendKeys(keysEventInput, "ab").build();
    sendLowercase.perform();

    Action releaseShift = getBuilder(driver).keyUp(keysEventInput, Keys.SHIFT).build();
    releaseShift.perform();

    String expectedEvents = " keydown keydown keypress keyup keydown keypress keyup keyup";
    assertThatFormEventsFiredAreExactly("Shift key not held", existingResult + expectedEvents);

    assertThat(keysEventInput.getAttribute("value")).isEqualTo("AB");
  }

  @Test
  @NotYetImplemented(value = SAFARI, reason = "getText does not normalize spaces")
  public void testSendingKeysToActiveElement() {
    driver.get(pages.bodyTypingPage);

    Action someKeys = getBuilder(driver).sendKeys("ab").build();
    someKeys.perform();

    assertThatBodyEventsFiredAreExactly("keypress keypress");
    assertThatFormEventsFiredAreExactly("");
  }

  @Test
  @NotYetImplemented(SAFARI)
  public void testBasicKeyboardInputOnActiveElement() {
    driver.get(pages.javascriptPage);

    WebElement keyReporter = driver.findElement(By.id("keyReporter"));

    keyReporter.click();

    Action sendLowercase = getBuilder(driver).sendKeys("abc def").build();

    sendLowercase.perform();

    shortWait.until(ExpectedConditions.attributeToBe(keyReporter, "value", "abc def"));
  }

  @Test
  @NotYetImplemented(HTMLUNIT)
  public void testThrowsIllegalArgumentExceptionWithNoParameters() {
    driver.get(pages.javascriptPage);
    assertThatExceptionOfType(IllegalArgumentException.class)
      .isThrownBy(() -> driver.findElement(By.id("keyReporter")).sendKeys());
  }

  @Test
  @NotYetImplemented(HTMLUNIT)
  public void testThrowsIllegalArgumentExceptionWithNullParameter() {
    driver.get(pages.javascriptPage);
    assertThatExceptionOfType(IllegalArgumentException.class)
      .isThrownBy(() -> driver.findElement(By.id("keyReporter")).sendKeys((CharSequence) null));
  }

  @Test
  @NotYetImplemented(HTMLUNIT)
  public void testThrowsIllegalArgumentExceptionWithNullInParameters() {
    driver.get(pages.javascriptPage);
    assertThatExceptionOfType(IllegalArgumentException.class)
      .isThrownBy(() -> driver.findElement(By.id("keyReporter")).sendKeys("x", null, "y"));
  }

  @Test
  @NotYetImplemented(HTMLUNIT)
  public void testThrowsIllegalArgumentExceptionWithCharSequenceThatContainsNull() {
    driver.get(pages.javascriptPage);
    assertThatExceptionOfType(IllegalArgumentException.class).isThrownBy(
      () -> driver.findElement(By.id("keyReporter")).sendKeys("x", null, "y"));
  }

  @Test
  @NotYetImplemented(HTMLUNIT)
  public void testThrowsIllegalArgumentExceptionWithCharSequenceThatContainsNullOnly() {
    driver.get(pages.javascriptPage);
    assertThatExceptionOfType(IllegalArgumentException.class).isThrownBy(
      () -> driver.findElement(By.id("keyReporter")).sendKeys(new CharSequence[]{null}));
  }

  @Test
  public void canGenerateKeyboardShortcuts() {
    driver.get(appServer.whereIs("keyboard_shortcut.html"));

    WebElement body = driver.findElement(By.xpath("//body"));
    assertBackgroundColor(body, Colors.WHITE);

    new Actions(driver).keyDown(Keys.SHIFT).sendKeys("1").keyUp(Keys.SHIFT).perform();
    assertBackgroundColor(body, Colors.GREEN);

    new Actions(driver).keyDown(Keys.ALT).sendKeys("1").keyUp(Keys.ALT).perform();
    assertBackgroundColor(body, Colors.LIGHTBLUE);

    new Actions(driver)
      .keyDown(Keys.SHIFT).keyDown(Keys.ALT)
      .sendKeys("1")
      .keyUp(Keys.SHIFT).keyUp(Keys.ALT)
      .perform();
    assertBackgroundColor(body, Colors.SILVER);
  }

  @Test
  @NotYetImplemented(value = FIREFOX, reason = "https://bugzilla.mozilla.org/show_bug.cgi?id=1422583")
  public void testSelectionSelectBySymbol() {
    driver.get(appServer.whereIs("single_text_input.html"));

    WebElement input = driver.findElement(By.id("textInput"));

    getBuilder(driver).click(input).sendKeys("abc def").perform();

    shortWait.until(ExpectedConditions.attributeToBe(input, "value", "abc def"));

    getBuilder(driver).click(input)
      .keyDown(Keys.SHIFT)
      .sendKeys(Keys.LEFT)
      .sendKeys(Keys.LEFT)
      .keyUp(Keys.SHIFT)
      .sendKeys(Keys.DELETE)
      .perform();

    assertThat(input.getAttribute("value")).isEqualTo("abc d");
  }

  @Test
  @Ignore(IE)
  @NotYetImplemented(value = FIREFOX, reason = "https://bugzilla.mozilla.org/show_bug.cgi?id=1422583")
  public void testSelectionSelectByWord() {
    assumeFalse(getEffectivePlatform(driver).is(Platform.MAC),
      "MacOS has alternative keyboard");

    driver.get(appServer.whereIs("single_text_input.html"));

    WebElement input = driver.findElement(By.id("textInput"));

    getBuilder(driver).click(input).sendKeys("abc def").perform();
    wait.until(ExpectedConditions.attributeToBe(input, "value", "abc def"));

    getBuilder(driver).click(input)
      .keyDown(Keys.SHIFT)
      .keyDown(Keys.CONTROL)
      .sendKeys(Keys.LEFT)
      .keyUp(Keys.CONTROL)
      .keyUp(Keys.SHIFT)
      .sendKeys(Keys.DELETE)
      .perform();

    wait.until(ExpectedConditions.attributeToBe(input, "value", "abc "));
  }

  @Test
  public void testSelectionSelectAll() {
    assumeFalse(getEffectivePlatform(driver).is(Platform.MAC),
      "MacOS has alternative keyboard");

    driver.get(appServer.whereIs("single_text_input.html"));

    WebElement input = driver.findElement(By.id("textInput"));

    getBuilder(driver).click(input).sendKeys("abc def").perform();

    shortWait.until(ExpectedConditions.attributeToBe(input, "value", "abc def"));

    getBuilder(driver).click(input)
      .keyDown(Keys.CONTROL)
      .sendKeys("a")
      .keyUp(Keys.CONTROL)
      .sendKeys(Keys.DELETE)
      .perform();

    assertThat(input.getAttribute("value")).isEqualTo("");
  }

  @Test
  public void testLeftArrowEntry() {
    final String leftArrowSpaceTestStringCore = "bfmtv.fr";
    final String leftArrowSpaceTestString = leftArrowSpaceTestStringCore + "est";
    final String leftArrowSpaceTestStringExpected = leftArrowSpaceTestStringCore + " est";

    driver.get(appServer.whereIs("single_text_input.html"));
    WebElement textInput = driver.findElement(By.id("textInput"));
    sendLeftArrowSpaceTestKeys(textInput, leftArrowSpaceTestString);

    assertThat(textInput.getAttribute("value")).isEqualTo(leftArrowSpaceTestStringExpected);
  }

  private void sendLeftArrowSpaceTestKeys(final WebElement inputElement, final String leftArrowSpaceTestString) {
    inputElement.sendKeys(leftArrowSpaceTestString);
    for (byte j = 0; j < 3; j++)
      inputElement.sendKeys(Keys.LEFT);
    inputElement.sendKeys(Keys.SPACE);
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
    assertThat(driver.findElement(By.id("body_result")).getText().trim()).isEqualTo(expected.trim());
  }
}
