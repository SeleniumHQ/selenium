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

import static org.hamcrest.Matchers.is;
import static org.hamcrest.core.IsInstanceOf.instanceOf;
import static org.junit.Assert.assertThat;
import static org.junit.Assert.assertTrue;
import static org.junit.Assume.assumeFalse;
import static org.openqa.selenium.testing.Driver.HTMLUNIT;
import static org.openqa.selenium.testing.Driver.IE;
import static org.openqa.selenium.testing.Driver.MARIONETTE;
import static org.openqa.selenium.testing.Driver.SAFARI;
import static org.openqa.selenium.testing.TestUtilities.catchThrowable;

import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.Platform;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.Color;
import org.openqa.selenium.support.Colors;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JUnit4TestBase;
import org.openqa.selenium.testing.NotYetImplemented;
import org.openqa.selenium.testing.TestUtilities;

/**
 * Tests interaction through the advanced gestures API of keyboard handling.
 */
@Ignore(value = SAFARI, reason = "not implemented (issue 4136)")
public class BasicKeyboardInterfaceTest extends JUnit4TestBase {

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
  @Ignore(IE)
  public void testSendingKeyDownOnly() {
    driver.get(appServer.whereIs("key_logger.html"));

    WebElement keysEventInput = driver.findElement(By.id("theworks"));

    Action pressShift = getBuilder(driver).keyDown(keysEventInput, Keys.SHIFT).build();

    pressShift.perform();

    WebElement keyLoggingElement = driver.findElement(By.id("result"));
    String logText = keyLoggingElement.getText();

    Action releaseShift = getBuilder(driver).keyUp(keysEventInput, Keys.SHIFT).build();
    releaseShift.perform();

    assertTrue("Key down event not isolated, got: " + logText,
               logText.endsWith("keydown"));
  }

  @Test
  @Ignore(IE)
  public void testSendingKeyUp() {
    driver.get(appServer.whereIs("key_logger.html"));

    WebElement keysEventInput = driver.findElement(By.id("theworks"));

    Action pressShift = getBuilder(driver).keyDown(keysEventInput, Keys.SHIFT).build();
    pressShift.perform();

    WebElement keyLoggingElement = driver.findElement(By.id("result"));

    String eventsText = keyLoggingElement.getText();
    assertTrue("Key down should be isolated for this test to be meaningful. " +
        "Got events: " + eventsText, eventsText.endsWith("keydown"));

    Action releaseShift = getBuilder(driver).keyUp(keysEventInput, Keys.SHIFT).build();

    releaseShift.perform();

    eventsText = keyLoggingElement.getText();
    assertTrue("Key up event not isolated. Got events: " + eventsText, eventsText.endsWith("keyup"));
  }

  @Test
  @Ignore(IE)
  @Ignore(value = MARIONETTE, issue = "https://github.com/mozilla/geckodriver/issues/646")
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
    assertThatFormEventsFiredAreExactly("Shift key not held",
        existingResult + expectedEvents);

    assertThat(keysEventInput.getAttribute("value"), is("AB"));
  }

  @Test
  public void testSendingKeysToActiveElement() {
    driver.get(pages.bodyTypingPage);

    Action someKeys = getBuilder(driver).sendKeys("ab").build();
    someKeys.perform();

    assertThatBodyEventsFiredAreExactly("keypress keypress");
    assertThatFormEventsFiredAreExactly("");
  }

  @Test
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
  public void testThrowsIllegalArgumentExceptionWithNullKeys() {
    driver.get(pages.javascriptPage);
    Throwable t = catchThrowable(() -> driver.findElement(By.id("keyReporter")).sendKeys(null));
    assertThat(t, instanceOf(IllegalArgumentException.class));
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

    assertThat(input.getAttribute("value"), is("abc d"));
  }

  @Test
  @Ignore(IE)
  public void testSelectionSelectByWord() {
    assumeFalse(
        "MacOS has alternative keyboard",
        TestUtilities.getEffectivePlatform().is(Platform.MAC));

    driver.get(appServer.whereIs("single_text_input.html"));

    WebElement input = driver.findElement(By.id("textInput"));

    getBuilder(driver).click(input).sendKeys("abc def").perform();
    wait.until(
      ExpectedConditions.attributeToBe(input, "value", "abc def"));

    getBuilder(driver).click(input)
        .keyDown(Keys.SHIFT)
        .keyDown(Keys.CONTROL)
        .sendKeys(Keys.LEFT)
        .keyUp(Keys.CONTROL)
        .keyUp(Keys.SHIFT)
        .sendKeys(Keys.DELETE)
        .perform();

    wait.until(
      ExpectedConditions.attributeToBe(input, "value", "abc "));
  }

  @Test
  @Ignore(IE)
  public void testSelectionSelectAll() {
    assumeFalse(
        "MacOS has alternative keyboard",
        TestUtilities.getEffectivePlatform().is(Platform.MAC));

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

    assertThat(input.getAttribute("value"), is(""));
  }

  private void assertBackgroundColor(WebElement el, Colors expected) {
    Color actual = Color.fromString(el.getCssValue("background-color"));
    assertThat(actual, is(expected.getColorValue()));
  }

  private void assertThatFormEventsFiredAreExactly(String message, String expected) {
    assertThat(message, getFormEvents(), is(expected.trim()));
  }

  private String getFormEvents() {
    return driver.findElement(By.id("result")).getText().trim();
  }

  private void assertThatFormEventsFiredAreExactly(String expected) {
    assertThatFormEventsFiredAreExactly("", expected);
  }

  private void assertThatBodyEventsFiredAreExactly(String expected) {
    assertThat(driver.findElement(By.id("body_result")).getText().trim(), is(expected.trim()));
  }
}
